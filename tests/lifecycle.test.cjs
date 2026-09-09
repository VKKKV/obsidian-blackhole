const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadTS}=require('./helpers.cjs');
const {normalizeSettings,DEFAULT_SETTINGS,runtimeRenderScale,resetEffectSettings}=loadTS('src/config.ts');
const {countWords,MetricCache}=loadTS('src/metrics.ts');
test('settings reject invalid types and preserve stored preference separate from budget',()=>{
 const s=normalizeSettings({renderScale:1,nSteps:10,holeRadius:null,maxWordCount:0,starGain:Infinity,enabled:'false'});
 assert.equal(s.renderScale,1);assert.equal(runtimeRenderScale(s),1);assert.equal(s.nSteps,64);
 assert.equal(s.holeRadius,DEFAULT_SETTINGS.holeRadius);assert.equal(s.maxWordCount,100);
 assert.equal(s.starGain,0);assert.equal(s.enabled,true);
});
test('reset restores full animation defaults while keeping language and enable state',()=>{
 const reset=resetEffectSettings({...DEFAULT_SETTINGS,language:'zh-CN',enabled:false,captureEnabled:true,holeRadius:.001,sizeMode:1});
 assert.equal(reset.holeRadius,.02);assert.equal(reset.sizeMode,2);assert.equal(reset.captureEnabled,false);
 assert.equal(reset.language,'zh-CN');assert.equal(reset.enabled,false);
});
test('migration updates untouched tiny defaults but leaves custom sizes alone',()=>{
 const legacy={holeRadius:.014,tokenAreaMin:.003,tokenAreaMax:.02,diskOuter:7,sizeMode:1,renderScale:.35};
 const upgraded=normalizeSettings(legacy);assert.equal(upgraded.holeRadius,.02);assert.equal(upgraded.sizeMode,2);
 const custom=normalizeSettings({...legacy,holeRadius:.012});assert.equal(custom.holeRadius,.012);assert.equal(custom.sizeMode,1);
});
test('metrics count mixed CJK and words and cache unchanged editor content',()=>{
 assert.equal(countWords('中文 hello world'),4);
 let reads=0;const cache=new MetricCache({currentText:()=>{reads++;return '中文 hello world'},markdownFileCount:()=>2,markdownTabCount:()=>3});
 cache.level({...DEFAULT_SETTINGS,sizeMode:1},0);cache.level({...DEFAULT_SETTINGS,sizeMode:1},10000);assert.equal(reads,1);
 cache.invalidate('word-count');cache.level({...DEFAULT_SETTINGS,sizeMode:1},10001);assert.equal(reads,2);
 cache.invalidate('word-count');cache.level({...DEFAULT_SETTINGS,sizeMode:1},10002);assert.equal(reads,2);
});
function fixture({idle=false,hidden=false,pending=false}={}){
 let layout,resolveInit,starts=0,inits=0,destroyed=0;
 const doc={hidden,body:{appendChild(){}},querySelector:()=>null,createElement:()=>({className:'',classList:{toggle(){}},remove(){}})};
 const rendererMock={BlackHoleRenderer:class{
   constructor(){this.softwareRenderer=false}
   init(){inits++;return pending?new Promise(resolve=>resolveInit=resolve):Promise.resolve(true)}
   start(){starts++}stop(){}destroy(){destroyed++}setRenderScale(){}updateTexture(){}
 }};
 const captureMock={WorkspaceCapture:class{setSuspended(){}setElement(){}setOptions(){}requestSoon(){}destroy(){}}};
 const obsidian={Plugin:class{},Notice:class{},MarkdownView:class{},PluginSettingTab:class{},Setting:class{}};
 const {default:Plugin}=loadTS('src/main.ts',{'obsidian':obsidian,'./renderer':rendererMock,'./capture':captureMock},{
   document:doc,window:{clearInterval(){},clearTimeout(){},setTimeout(){return 1},setInterval(){return 1}},
 });
 const p=new Plugin();p.loadData=async()=>({idlePlaybackEnabled:idle});p.saveData=async()=>{};
 p.addSettingTab=()=>{};p.addRibbonIcon=()=>{};p.registerDomEvent=()=>{};p.registerEvent=()=>{};
 p.app={workspace:{on:()=>({}),onLayoutReady:fn=>layout=fn,getActiveViewOfType:()=>null},vault:{on:()=>({})}};
 return {p,doc,layout:()=>layout(),resolve:()=>resolveInit(true),counts:()=>({starts,inits,destroyed})};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve()};
test('live parameter edits enforce the same area relation as reload',()=>{
 const f=fixture();f.p.settings.tokenAreaMax=.0001;f.p.onParamsChange();
 assert.equal(f.p.settings.tokenAreaMax,f.p.settings.tokenAreaMin);
 const p=f.p.toShaderParams();assert.ok(p.tokenAreaMax>=p.tokenAreaMin);f.p.onunload();
});
test('plugin reset restarts once and persists restored settings',async()=>{
 const f=fixture();await f.p.onload();f.layout();await flush();
 f.p.settings.language='zh-CN';f.p.settings.holeRadius=.001;f.p.settings.captureEnabled=true;
 let saved;f.p.saveData=async s=>saved=s;
 await f.p.resetSettings();await flush();
 assert.equal(saved.holeRadius,.02);assert.equal(saved.captureEnabled,false);assert.equal(saved.language,'zh-CN');
 assert.equal(f.counts().destroyed,1);assert.equal(f.counts().starts,2);f.p.onunload();
});
test('idle-only initial load does not initialize GPU or render',async()=>{
 const f=fixture({idle:true});await f.p.onload();f.layout();await flush();assert.equal(f.counts().inits,0);f.p.onunload();
});
test('unload before layout ready cannot revive plugin',async()=>{
 const f=fixture();await f.p.onload();f.p.onunload();f.layout();await flush();assert.equal(f.counts().inits,0);
});
test('unload during asynchronous GPU init cannot render on completion',async()=>{
 const f=fixture({pending:true});await f.p.onload();f.layout();assert.equal(f.counts().inits,1);
 f.p.onunload();f.resolve();await flush();assert.equal(f.counts().starts,0);assert.equal(f.counts().destroyed,1);
});
test('hidden document blocks initial GPU startup',async()=>{
 const f=fixture({hidden:true});await f.p.onload();f.layout();await flush();assert.equal(f.counts().inits,0);f.p.onunload();
});
test('ready visible plugin starts through exactly one gate',async()=>{
 const f=fixture();await f.p.onload();f.layout();await flush();assert.equal(f.counts().starts,1);
 f.p.applyRuntimeSettings();assert.equal(f.counts().starts,1);f.p.onunload();
});
