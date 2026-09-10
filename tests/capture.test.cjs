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
test('capture reports viewport geometry and rejects results after a layout move',async()=>{
 const f=fixture();let left=200,uploads=0;
 f.el.getBoundingClientRect=()=>({left,top:60,width:100,height:100});
 f.c.onCapture=(_canvas,_time,rect)=>{assert.equal(rect.left,200);uploads++};
 f.c.capture(10000);f.clock(10100);f.resolve({});await flush();assert.equal(uploads,1);
 f.c.requestSoon();f.clock(17000);f.c.capture(17000);left=300;f.clock(17100);f.resolve({});await flush();
 assert.equal(uploads,1);assert.equal(f.c.latestCanvas,null);f.c.destroy();
});
test('blocked captures notify and a new note can retry',async()=>{
 const f=fixture();let blocked=0;f.c.onBlocked=()=>blocked++;
 f.c.capture(10000);f.clock(12000);f.resolve({});await flush();assert.equal(blocked,1);
 f.c.setElement({...f.el});f.clock(20000);assert.equal(f.c.capture(20000),true);
 f.clock(20100);f.resolve({});await flush();assert.ok(f.c.latestCanvas);f.c.destroy();
});
test('temporary preflight pressure recovers without manual toggle',async()=>{
 const f=fixture();let blocked=0;f.c.onBlocked=()=>blocked++;
 const preflight=f.c.preflight.bind(f.c);let busy=true;
 f.c.preflight=(...args)=>busy?'DOM preflight exceeded its time budget':preflight(...args);
 assert.equal(f.c.capture(10000),false);assert.equal(blocked,0);
 busy=false;f.clock(17000);assert.equal(f.c.capture(17000),true);
 f.clock(17100);f.resolve({});await flush();assert.ok(f.c.latestCanvas);f.c.destroy();
});
test('layout settling defers work and rejects old-note completion on reused element',async()=>{
 const f=fixture();let uploads=0,blocked=0;f.c.onCapture=()=>uploads++;f.c.onBlocked=()=>blocked++;
 f.c.capture(10000);f.clock(10020);f.c.waitForLayout();
 f.clock(11100);f.timeout();f.reject(Error('old note failed'));await flush();
 assert.equal(blocked,0);assert.equal(uploads,0);assert.equal(f.c.latestCanvas,null);
 f.clock(18000);f.c.waitForLayout();assert.equal(f.c.capture(18349),false);
 f.clock(18350);assert.equal(f.c.capture(18350),true);f.clock(18400);f.resolve({});await flush();
 assert.equal(uploads,1);f.c.destroy();
});
test('persistent preflight limits retry only three times and notify once',()=>{
 const f=fixture();let attempts=0,blocked=0;
 f.c.preflight=()=>{attempts++;return 'DOM node/depth limit exceeded'};f.c.onBlocked=()=>blocked++;
 for(const now of [10000,10010,17000,17010,24000,31000]){f.clock(now);f.c.capture(now)}
 assert.equal(attempts,3);assert.equal(blocked,1);assert.equal(f.calls(),0);
 f.c.waitForLayout();f.c.requestSoon();f.clock(40000);assert.equal(f.c.capture(40000),false);f.c.destroy();
});
test('content observers and scroll listeners detach on suspend, target change and destroy',()=>{
 const f=fixture();let watching=false,scrolls=0,changed;
 class Observer{constructor(fn){changed=fn}observe(){watching=true}disconnect(){watching=false}takeRecords(){return []}}
 const el={...f.el,ownerDocument:{defaultView:{MutationObserver:Observer}},
   addEventListener(){scrolls++},removeEventListener(){scrolls--}};
 f.c.setElement(el);assert.equal(watching,true);assert.equal(scrolls,1);
 f.c.latestCanvas={};changed();assert.equal(f.c.latestCanvas,null);
 f.c.setSuspended(true);assert.equal(watching,false);assert.equal(scrolls,0);
 f.c.setSuspended(false);assert.equal(watching,true);
 f.c.setElement(f.el);assert.equal(watching,false);assert.equal(scrolls,0);
 f.c.setElement(el);f.c.destroy();assert.equal(watching,false);assert.equal(scrolls,0);
});
test('capture failures disable the effective texture after a previous success',async()=>{
 const f=fixture();let available;f.c.onAvailabilityChange=v=>available=v;
 f.c.capture(10000);f.clock(10100);f.resolve({});await flush();assert.equal(available,true);
 f.c.requestSoon();f.clock(17000);f.c.capture(17000);f.reject(Error('expected'));await flush();
 assert.equal(available,false);f.c.destroy();
});
