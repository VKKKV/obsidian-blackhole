const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loadTS} = require('./helpers.cjs');
const {DEFAULT_SETTINGS} = loadTS('src/config.ts');
const params = {...DEFAULT_SETTINGS, tokenGlideMin:.3, tokenGlideMax:1.5, tokenGlideRate:10};
function fixture({software=false,failLink=false}={}) {
  let draws=0,compiles=0,deleted=0,raf=0;
  const listeners={};
  const gl = new Proxy({
    getExtension(name) {return name==='WEBGL_debug_renderer_info'?{UNMASKED_RENDERER_WEBGL:1}:null},
    getParameter(){return software?'SwiftShader':'Test Hardware'},
    createShader(){return {}},createProgram(){return {}},
    compileShader(){compiles++},getProgramParameter(){return !failLink},
    getProgramInfoLog(){return 'test link failure'},isContextLost(){return false},
    deleteShader(){deleted++},drawArrays(){draws++},
  },{get:(o,k)=>k in o?o[k]:(()=>{})});
  const canvas={width:1,height:1,style:{},getContext:()=>gl,
    parentElement:{clientWidth:800,clientHeight:600},
    addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener:(name)=>delete listeners[name]};
  const {BlackHoleRenderer}=loadTS('src/renderer.ts',{}, {
    ResizeObserver:class{observe(){}disconnect(){}},
    requestAnimationFrame(){raf++;return raf},cancelAnimationFrame(){},
  });
  return {r:new BlackHoleRenderer(canvas,params),gl,canvas,listeners,
    counts:()=>({draws,compiles,deleted,raf})};
}
test('software WebGL is refused before compiling or drawing',async()=>{
  const f=fixture({software:true});assert.equal(await f.r.init(),false);
  assert.equal(f.counts().compiles,0);assert.equal(f.counts().draws,0);f.r.destroy();
});
test('destroy between successful program build and init continuation cannot allocate',async()=>{
  const f=fixture();let allocations=0;
  f.gl.getExtension=name=>name==='KHR_parallel_shader_compile'?{COMPLETION_STATUS_KHR:999}:null;
  for(const key of ['createVertexArray','createBuffer','createTexture'])f.gl[key]=()=>{allocations++;return {}};
  const pending=f.r.init();f.r.destroy();
  assert.equal(await pending,false);assert.equal(allocations,0);assert.equal(f.r.workspaceTex,null);
});
test('low render scales remain effective',async()=>{
  const f=fixture();await f.r.init();f.r.setRenderScale(.15);assert.equal(f.r.renderScale,.15);
  f.r.setRenderScale(.22);assert.equal(f.r.renderScale,.22);f.r.destroy();
});
test('intentional 15 FPS cadence does not trigger quality reduction',async()=>{
  const f=fixture();await f.r.init();const r=f.r;r.renderScale=.35;r.tokenLevel=.5;
  r.startTime=1000;r.prevTime=1000;
  for(let now=1000;now<10000;now+=1000/15)r.renderFrame(now);
  assert.equal(r.renderScale,.35);assert.ok(f.counts().draws>0);r.destroy();
});
test('start defers first draw; context loss stops the loop',async()=>{
  const f=fixture();await f.r.init();f.r.start();assert.equal(f.counts().draws,0);
  let fatal=false;f.r.onFatalError=()=>fatal=true;
  f.listeners.webglcontextlost({preventDefault(){}});
  assert.equal(f.r.running,false);assert.equal(fatal,true);f.r.destroy();
});
test('failed recompile preserves both old params and program',async()=>{
  const f=fixture();await f.r.init();const old=f.r.program;const radius=f.r.params.holeRadius;
  f.gl.getProgramParameter=()=>false;
  assert.equal(await f.r.recompile({...params,holeRadius:.01}),false);
  assert.equal(f.r.program,old);assert.equal(f.r.params.holeRadius,radius);f.r.destroy();
});
test('token state is updated before shared CPU/GPU effect bounds',async()=>{
  const f=fixture();await f.r.init();const r=f.r;
  r.tokenLevel=1;r.lastTokenLevel=1;r.prevTokenLevel=1;r.lastTokenChange=0;
  r.renderFrame(10000);const radius=r.effectState.radius;
  r.tokenLevel=.1;r.renderFrame(10001);
  assert.equal(r.effectState.radius,radius);r.destroy();
});
