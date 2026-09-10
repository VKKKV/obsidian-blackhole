"""Actual plugin + SVG backdrop over a long synthetic note; no capture mocks."""
import io, json, os, subprocess, tempfile
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('BLACKHOLE_ARTIFACTS','/tmp/blackhole-backdrop-smoke'));OUT.mkdir(exist_ok=True,parents=True)
DARK=os.environ.get('BLACKHOLE_DARK')=='1'
EDITOR=os.environ.get('BLACKHOLE_EDITOR')=='1'
THEME=os.environ.get('BLACKHOLE_THEME')=='1'
with tempfile.TemporaryDirectory(prefix='blackhole-backdrop-') as tmp:
 tmp=Path(tmp);entry=tmp/'entry.ts'
 entry.write_text(f"export {{default as Plugin}} from '{ROOT}/src/main';export {{BlackHoleRenderer as Renderer}} from '{ROOT}/src/renderer';")
 subprocess.run([str(ROOT/'node_modules/.bin/esbuild'),str(entry),'--bundle','--format=iife','--global-name=Test','--external:obsidian',f'--outfile={tmp}/bundle.js',f'--metafile={tmp}/meta.json'],check=True)
 inputs=json.loads((tmp/'meta.json').read_text())['inputs'];assert not any('dom-to-image' in x or x.endswith('/capture.ts') for x in inputs)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  page=browser.new_page(viewport={'width':1000,'height':700},device_scale_factor=float(os.environ.get('BLACKHOLE_DPR','1')))
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('''<style>body{margin:0;background:#202124}.app-container{width:1000px;height:700px}.view-content{position:absolute;left:200px;top:60px;width:760px;height:600px;background:white;overflow:auto}p{height:28px;line-height:28px;margin:0;font:22px monospace;color:#171717}.marker{position:absolute;left:230px;top:180px;width:5px;height:200px;background:red}aside{position:absolute;width:180px;color:cyan}</style><div class="app-container"><aside>SIDEBAR unchanged</aside><div class="view-content"></div></div>''')
  page.add_style_tag(path=str(ROOT/'styles.css'))
  if DARK:page.add_style_tag(content='.view-content{background:#25262a}p{color:#ddd}')
  if THEME:page.add_style_tag(content='.app-container{position:absolute;top:32px;opacity:.99}.view-content{top:28px;background:transparent}p{color:#ddd}')
  page.evaluate('''()=>{
    const note=document.querySelector('.view-content');note.innerHTML=Array.from({length:10000},(_,i)=>`<p><b>LINE ${i}</b> TEXT LENS <span>ABCDEFG 0123456789</span></p>`).join('')+'<div class="marker"></div>';
    window.events={};window.notices=[];window.activeView={contentEl:note,file:{path:'long.md'},editor:{getValue:()=>''}};
    window.require=()=>({Plugin:class{registerEvent(){}registerDomEvent(){}addSettingTab(){}addRibbonIcon(){}},Notice:class{constructor(s){notices.push(s)}},MarkdownView:class{},PluginSettingTab:class{},Setting:class{}});
    window.cloneCalls=0;Node.prototype.cloneNode=function(){cloneCalls++;throw Error('DOM clone forbidden')};
  }''')
  if EDITOR:
   page.evaluate("document.querySelector('.view-content').contentEditable='true';document.querySelector('.view-content').classList.add('cm-content')")
  page.add_script_tag(path=str(tmp/'bundle.js'))
  page.evaluate('''async()=>{
    const init=Test.Renderer.prototype.init;Test.Renderer.prototype.init=async function(){const ok=await init.call(this,{allowSoftware:true});this.softwareRenderer=false;return ok};
    Test.Renderer.prototype.start=function(){};
    const p=window.plugin=new Test.Plugin();p.loadData=async()=>({captureEnabled:true});p.saveData=async()=>{};
    p.app={workspace:{on:(name,fn)=>{events[name]=fn;return {}},onLayoutReady:fn=>fn(),getActiveViewOfType:()=>activeView},vault:{on:()=>({})}};
    await p.onload();
  }''')
  page.wait_for_function('plugin.ready===true')
  page.evaluate('''async()=>{
    const r=plugin.renderer;await r.recompile({...plugin.toShaderParams(),diskGain:0,diskOpacity:0,starGain:0});r.autoQuality=false;r.sizeMode=1;
    r.computeEffectBounds=()=>{r.effectState={x:.53,y:.46,radius:.035,intensity:1};return {x:0,y:0,width:1000,height:700}};
    window.draw=()=>{r.renderFrame(10000);r.gl.finish()};draw();
  }''')
  def shot(name):return Image.open(io.BytesIO(page.screenshot(path=str(OUT/(name+'.png'))))).convert('RGB')
  on=shot('lens-on')
  frame=page.evaluate('plugin.lens.lastFrame');assert frame['x']==530 and frame['y']==322,frame
  state=page.evaluate("({supported:plugin.lens.supported,capture:plugin.renderer.captureEnabled,clones:cloneCalls,notices,layer:getComputedStyle(document.querySelector('.blackhole-backdrop')).display,nodes:document.querySelectorAll('*').length})")
  assert state['supported'] and not state['capture'] and state['clones']==0 and not state['notices'] and state['layer']=='block',state
  page.evaluate('plugin.settings.captureEnabled=false;plugin.applyRuntimeSettings();draw()');off=shot('lens-off')
  diff=ImageChops.difference(on,off);changed=sum(max(p)>12 for p in diff.getdata());assert changed>2000,changed
  # A red marker provides a strict oracle: only ONE displaced stripe, no original copy.
  ratio=on.width/1000
  red=lambda im:[x for x in range(int(230*ratio),int(460*ratio)) if (lambda c:c[0]>245 and c[1]<10 and c[2]<10)(im.getpixel((x,int(300*ratio))))]
  redOff,redOn=red(off),red(on)
  assert redOff and redOn and not set(redOff)&set(redOn),(redOff,redOn)
  assert redOn==list(range(redOn[0],redOn[-1]+1)),redOn
  # Count no effect beyond active pane (including sidebar).
  w,h=on.size;dpr=w/1000
  outside=sum(max(diff.getpixel((x,y)))>12 for y in range(h) for x in range(w) if not(200*dpr<=x<960*dpr and 60*dpr<=y<660*dpr));assert outside==0,outside
  page.evaluate("plugin.settings.captureEnabled=true;plugin.applyRuntimeSettings();draw();document.querySelector('.marker').style.background='blue';document.querySelector('.view-content p').textContent='LIVE UPDATED TEXT'")
  live=shot('live-update');assert ImageChops.difference(on,live).getbbox()
  page.evaluate("document.querySelector('.view-content').scrollTop=140000")
  scrolled=shot('scrolled');assert ImageChops.difference(live,scrolled).getbbox()
  # Clip near both note edges; sidebar pixels must stay exactly unchanged.
  page.evaluate("document.querySelector('.view-content').scrollTop=0;plugin.lens.setEnabled(false)")
  edgePlain=shot('edge-plain')
  for cx in (203,957):
    page.evaluate("cx=>{plugin.lens.setEnabled(true);plugin.lens.update({...plugin.lens.lastFrame,x:cx,radius:80})}",cx)
    edge=shot(f'edge-{cx}');edgeDiff=ImageChops.difference(edge,edgePlain)
    assert not edgeDiff.crop((0,0,int(200*dpr),h)).getbbox()
    assert not edgeDiff.crop((int(960*dpr),0,w,h)).getbbox()
  page.evaluate('draw()')
  # Frozen WebGL frame does not freeze real backdrop contents, and depth still works.
  page.evaluate("document.querySelector('.view-content').scrollTop=0;plugin.lens.update({...plugin.lens.lastFrame,depth:1})")
  shallow=shot('depth-low')
  page.evaluate("plugin.lens.update({...plugin.lens.lastFrame,depth:50})")
  deep=shot('depth-high');assert ImageChops.difference(shallow,deep).getbbox()
  page.evaluate("plugin.lens.setSuspended(true)")
  assert page.locator('.blackhole-backdrop').evaluate("el=>getComputedStyle(el).display")=='none'
  page.evaluate("plugin.lens.setSuspended(false);draw()")
  unchanged=page.evaluate('''()=>{
    const svg=document.querySelector('.blackhole-filter-defs'),observer=new MutationObserver(()=>{});
    observer.observe(svg,{attributes:true,subtree:true});
    for(let i=0;i<30;i++)plugin.lens.update(plugin.lens.lastFrame);
    const changes=observer.takeRecords().length;observer.disconnect();return changes;
  }''');assert unchanged==0,unchanged
  # No clone/map encoding while advancing real shared WebGL/SVG frames.
  animation=page.evaluate('''async()=>{
    const original=HTMLCanvasElement.prototype.toDataURL;let encodes=0;
    HTMLCanvasElement.prototype.toDataURL=function(...args){encodes++;return original.apply(this,args)};
    const samples=[];const r=plugin.renderer;
    r.computeEffectBounds=()=>{r.effectState={x:.53+Math.sin(samples.length/10)*.04,y:.46,radius:.07,intensity:1};return {x:0,y:0,width:1000,height:700}};
    for(let i=0;i<24;i++){await new Promise(requestAnimationFrame);const t=performance.now();r.renderFrame(10000+i*17);samples.push(performance.now()-t)}
    HTMLCanvasElement.prototype.toDataURL=original;
    return {encodes,maxSubmitMs:Math.max(...samples),frames:samples.length};
  }''')
  assert animation['encodes']==0,animation
  # Preserve the complete default animation; test large demo stages with the live lens too.
  showcase=page.evaluate('''async()=>{
    const r=plugin.renderer;r.computeEffectBounds=Test.Renderer.prototype.computeEffectBounds;
    await r.recompile(plugin.toShaderParams());r.sizeMode=2;
    const samples=[];
    for(const seconds of [0,20,40]){
      r.renderFrame((r.demoStart+seconds)*1000);r.gl.finish();
      samples.push({seconds,diameter:r.effectState.radius*1400,glError:r.gl.getError()});
    }
    return samples;
  }''');shot('showcase')
  assert all(x['glError']==0 for x in showcase) and showcase[-1]['diameter']>150
  # Restore controlled geometry for note switch assertions.
  page.evaluate("plugin.renderer.computeEffectBounds=()=>{plugin.renderer.effectState={x:.53,y:.46,radius:.035,intensity:1};return {x:0,y:0,width:1000,height:700}}")
  # Same element new content, and replacement element: no retry/debounce/capture required.
  switching=page.evaluate('''()=>{
    for(let i=0;i<3;i++){activeView.file.path=`note-${i}.md`;events['file-open']();events['layout-change']();draw()}
    const old=activeView.contentEl;const next=document.createElement('div');next.className='view-content';next.innerHTML='<p>REPLACEMENT NOTE</p>'.repeat(3000);old.replaceWith(next);activeView.contentEl=next;events['active-leaf-change']();draw();
    const ok=plugin.lens.target===next&&document.querySelector('.blackhole-backdrop').style.display==='block';
    activeView=null;events['active-leaf-change']();draw();const nonNoteHidden=document.querySelector('.blackhole-backdrop').style.display==='none';
    plugin.onunload();return {ok,nonNoteHidden,remaining:document.querySelectorAll('.blackhole-canvas,.blackhole-backdrop,.blackhole-filter-defs').length,clones:cloneCalls,notices};
  }''')
  assert switching['ok'] and switching['nonNoteHidden'] and switching['remaining']==0 and switching['clones']==0 and not switching['notices'],switching
  assert not errors,errors
  result={'state':state,'changedPixels':changed,'outsidePixels':outside,'redOff':redOff,'redOn':redOn,'animation':animation,'showcase':showcase,'switching':switching,'errors':errors,'browser':browser.version,'dark':DARK,'editor':EDITOR,'theme':THEME,'dpr':dpr}
  print(json.dumps(result));(OUT/'result.json').write_text(json.dumps(result,indent=2));browser.close()
