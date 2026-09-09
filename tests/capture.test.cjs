const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadTS}=require('./helpers.cjs');
function fixture(){
 let clock=10000,resolve,reject,calls=0,timer;
 const {WorkspaceCapture}=loadTS('src/capture.ts',{'dom-to-image-more':{toCanvas(){calls++;return new Promise((a,b)=>{resolve=a;reject=b})}}},{
   performance:{now:()=>clock},setTimeout:fn=>{timer=fn;return 1},clearTimeout(){},
 });
 const el={nodeType:1,namespaceURI:'http://www.w3.org/1999/xhtml',localName:'div',hasAttribute:()=>false,
   classList:{contains:()=>false},isConnected:true,offsetWidth:100,offsetHeight:100,firstChild:null};
 const c=new WorkspaceCapture();c.setElement(el);c.setOptions({enabled:true,intervalMs:6000});
 return {c,WorkspaceCapture,el,clock:v=>clock=v,calls:()=>calls,resolve:v=>resolve(v),reject:v=>reject(v),timeout:()=>timer()};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};
test('capture is dirty driven and events cannot bypass post-completion cooldown',async()=>{
 const f=fixture();assert.equal(f.c.capture(10000),true);f.clock(10100);f.resolve({});await flush();
 assert.equal(f.c.capture(20000),false);
 f.c.requestSoon();assert.equal(f.c.capture(16099),false);assert.equal(f.c.capture(16100),true);
 f.clock(16200);f.resolve({});await flush();f.c.destroy();
});
test('disabled in-flight result never uploads or becomes available',async()=>{
 const f=fixture();let uploads=0,available=false;f.c.onCapture=()=>uploads++;f.c.onAvailabilityChange=v=>available=v;
 f.c.capture(10000);f.c.setOptions({enabled:false});f.clock(10100);f.resolve({});await flush();
 assert.equal(uploads,0);assert.equal(available,false);f.c.destroy();
});
test('timeout trips circuit without releasing the underlying operation lock',async()=>{
 const f=fixture();f.c.capture(10000);f.clock(11001);f.timeout();f.c.reset();
 assert.equal(f.c.capture(20000),false);f.resolve({});await flush();assert.equal(f.c.latestCanvas,null);f.c.destroy();
});
test('replacement capture waits for destroyed instance actual settlement',async()=>{
 const f=fixture();f.c.capture(10000);f.c.destroy();const next=new f.WorkspaceCapture();
 next.setElement(f.el);next.enabled=true;assert.equal(next.capture(10000),false);
 f.clock(10100);f.resolve({});await flush();assert.equal(next.capture(20000),true);
 f.clock(10200);f.resolve({});await flush();next.destroy();
});
test('slow completed capture opens circuit instead of recurring long tasks',async()=>{
 const f=fixture();f.c.capture(10000);f.clock(11500);f.resolve({});await flush();
 f.c.requestSoon();assert.equal(f.c.capture(50000),false);assert.equal(f.c.latestCanvas,null);f.c.destroy();
});
test('capture failures disable the effective texture after a previous success',async()=>{
 const f=fixture();let available;f.c.onAvailabilityChange=v=>available=v;
 f.c.capture(10000);f.clock(10100);f.resolve({});await flush();assert.equal(available,true);
 f.c.requestSoon();f.clock(17000);f.c.capture(17000);f.reject(Error('expected'));await flush();
 assert.equal(available,false);f.c.destroy();
});
