const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loadTS} = require('./helpers.cjs');
const {DEFAULT_SETTINGS} = loadTS('src/config.ts');
const params = {...DEFAULT_SETTINGS, tokenGlideMin:.3, tokenGlideMax:1.5, tokenGlideRate:10};
function fixture({software=false,failLink=false,dpr=1}={}) {
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
  const canvas={width:1,height:1,style:{},getContext:()=>gl,ownerDocument:{defaultView:{devicePixelRatio:dpr}},
    parentElement:{clientWidth:800,clientHeight:600},
    addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener:(name)=>delete listeners[name]};
  const {BlackHoleRenderer}=loadTS('src/renderer.ts',{}, {
    ResizeObserver:class{observe(){}disconnect(){}},
    requestAnimationFrame(){raf++;return raf},cancelAnimationFrame(){},
  });
  return {r:new BlackHoleRenderer(canvas,params),gl,canvas,listeners,
    counts:()=>({draws,compiles,deleted,raf})};
}
test('viewport-fixed canvas shares center with lens regardless of parent offset',async()=>{
 const f=fixture();await f.r.init();f.r.autoQuality=false;
 f.canvas.parentElement.getBoundingClientRect=()=>({left:100,top:32});
 f.r.computeEffectBounds=()=>{f.r.effectState={x:.5,y:.5,radius:.04,intensity:1};return {x:0,y:0,width:800,height:600}};
 let frame;f.r.onEffectFrame=value=>frame=value;f.r.renderFrame(10000);
 assert.equal(frame.x,400);assert.equal(frame.y,300);f.r.destroy();
});
test('body-hosted renderer uses viewport height even if body content collapses',async()=>{
 const f=fixture();await f.r.init();f.canvas.ownerDocument.body=f.canvas.parentElement;
 Object.assign(f.canvas.ownerDocument.defaultView,{innerWidth:1000,innerHeight:700});
 f.canvas.parentElement.clientHeight=0;
 assert.equal(f.r.getViewportSize().width,1000);assert.equal(f.r.getViewportSize().height,700);f.r.destroy();
});
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
test('healthy 60 FPS cadence does not trigger quality reduction',async()=>{
  const f=fixture();await f.r.init();const r=f.r;r.renderScale=.35;r.tokenLevel=.5;
  r.startTime=1000;r.prevTime=1000;
  for(let now=1000;now<10000;now+=1000/60)r.renderFrame(now);
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
test('resize and scale changes retain last pixels until next draw',async()=>{
 const f=fixture();await f.r.init();f.r.tokenLevel=.5;f.r.renderFrame(10000);
 const width=f.canvas.width,height=f.canvas.height;
 f.r.resize();f.r.setRenderScale(.2);
 assert.equal(f.canvas.width,width);assert.equal(f.canvas.height,height);f.r.destroy();
});
test('upstream token size uses one size dial without double shrink',async()=>{
 const f=fixture();await f.r.init();const r=f.r;r.tokenLevel=.3;r.lastTokenLevel=.3;r.prevTokenLevel=.3;
 r.renderFrame(10000);
 const expected=(Math.sqrt(.01*(800/600)/Math.PI)*.7+Math.sqrt(.5*(800/600)/Math.PI)*.3)*(.02/.08);
 assert.ok(Math.abs(r.effectState.radius-expected)<1e-9);r.destroy();
});
test('large windows obey fragment budget without shrinking CSS effect',async()=>{
 const f=fixture();await f.r.init();f.canvas.parentElement.clientWidth=7680;f.canvas.parentElement.clientHeight=4320;
 f.r.setRenderScale(1);f.r.tokenLevel=1;f.r.lastTokenLevel=1;f.r.prevTokenLevel=1;f.r.renderFrame(10000);
 assert.ok(f.canvas.width*f.canvas.height<=2097152);assert.ok(Math.abs(f.r.effectState.radius-Math.sqrt(.5*(7680/4320)/Math.PI)*(.02/.08))<1e-9);f.r.destroy();
});
test('60 FPS deadline never overschedules on high-refresh displays',async()=>{
 for(const hz of [60,120,144]){
   const f=fixture();await f.r.init();const r=f.r;r.running=true;r.autoQuality=false;r.tokenLevel=.5;
   for(let i=1;i<=hz*2;i++)r.loop(i*1000/hz);
   assert.ok(f.counts().draws>=119&&f.counts().draws<=121,`${hz}Hz: ${f.counts().draws}`);r.destroy();
 }
});
test('large default scene reaches full CSS resolution and honors HiDPI',async()=>{
 for(const dpr of [1,2]){
   const f=fixture({dpr});await f.r.init();const r=f.r;r.tokenLevel=1;r.lastTokenLevel=1;r.prevTokenLevel=1;
   r.renderFrame(10000);
   assert.equal(f.canvas.width,Math.floor(r.viewportRect.width*dpr));
   assert.equal(f.canvas.height,Math.floor(r.viewportRect.height*dpr));r.destroy();
 }
});
test('adaptive quality reduces actual capped pixels without changing saved scale',async()=>{
 const f=fixture({dpr:2});await f.r.init();const r=f.r;
 f.canvas.parentElement.clientWidth=3840;f.canvas.parentElement.clientHeight=2160;
 r.tokenLevel=1;r.lastTokenLevel=1;r.prevTokenLevel=1;r.startTime=10000;r.prevTime=10000;
 r.renderFrame(10000);const before=f.canvas.width*f.canvas.height,radius=r.effectState.radius;
 r.dtAvg=.1;r.renderFrame(14000);
 assert.ok(f.canvas.width*f.canvas.height<before*.7);assert.equal(r.renderScale,1);
 assert.equal(r.effectState.radius,radius);r.destroy();
});
test('extreme aspect ratio also respects dimension limits',async()=>{
 const f=fixture({dpr:2});await f.r.init();const r=f.r;
 r.updateViewportRect({x:0,y:0,width:100000,height:1});
 assert.ok(f.canvas.width<=4096&&f.canvas.height<=4096&&f.canvas.width*f.canvas.height<=2097152);r.destroy();
});
test('resolution caps hold across fractional DPR, 4K, 8K and narrow viewports',async()=>{
 const f=fixture();await f.r.init();
 for(const dpr of [1,1.25,2,3])for(const [width,height] of [[1000,700],[3840,2160],[7680,4320],[100000,1],[1,100000]]){
   f.canvas.ownerDocument.defaultView.devicePixelRatio=dpr;
   const rect={x:0,y:0,width,height};f.r.qualityFactor=1;f.r.updateViewportRect(rect);
   const before=f.canvas.width*f.canvas.height;
   assert.ok(before<=2097152&&f.canvas.width<=4096&&f.canvas.height<=4096);
   f.r.qualityFactor=.8;f.r.updateViewportRect(rect);
   assert.ok(f.canvas.width*f.canvas.height<before);
 }
 f.r.destroy();
});
test('unchanged runtime setting preserves adaptation and minimum quality stops safely',async()=>{
 const f=fixture();await f.r.init();const r=f.r;r.qualityFactor=.25;r.setRenderScale(1);
 assert.equal(r.qualityFactor,.25);r.autoQuality=false;r.tokenLevel=.5;r.renderFrame(10000);
 r.autoQuality=true;r.running=true;r.startTime=10000;r.dtAvg=.1;let fatal=false;r.onFatalError=()=>fatal=true;
 r.renderFrame(14000);assert.equal(fatal,true);assert.equal(r.running,false);r.destroy();
});
test('GPU WAIT_FAILED stops instead of submitting another draw',async()=>{
 const f=fixture();await f.r.init();const r=f.r;r.running=true;r.gpuFence={};
 f.gl.WAIT_FAILED=99;f.gl.clientWaitSync=()=>99;let fatal=false;r.onFatalError=()=>fatal=true;
 r.loop(1000);assert.equal(f.counts().draws,0);assert.equal(r.running,false);assert.equal(fatal,true);r.destroy();
});
test('GPU backpressure skips draws while retaining canvas and stops on timeout',async()=>{
 const f=fixture();await f.r.init();const r=f.r;r.running=true;
 f.gl.TIMEOUT_EXPIRED=123;f.gl.clientWaitSync=()=>123;r.gpuFence={};r.fenceCreatedAt=1000;
 r.loop(1500);assert.equal(f.counts().draws,0);assert.equal(r.running,true);
 let fatal=false;r.onFatalError=()=>fatal=true;r.loop(3100);
 assert.equal(r.running,false);assert.equal(fatal,true);r.destroy();
});
test('token state is updated before shared CPU/GPU effect bounds',async()=>{
  const f=fixture();await f.r.init();const r=f.r;
  r.tokenLevel=1;r.lastTokenLevel=1;r.prevTokenLevel=1;r.lastTokenChange=0;
  r.renderFrame(10000);const radius=r.effectState.radius;
  r.tokenLevel=.1;r.renderFrame(10001);
  assert.equal(r.effectState.radius,radius);r.destroy();
});
