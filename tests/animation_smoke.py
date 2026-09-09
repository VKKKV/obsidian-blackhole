import json, os, subprocess, tempfile, io
from PIL import Image, ImageChops
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
ARTIFACTS=Path(os.environ.get('BLACKHOLE_ARTIFACTS', '/tmp/blackhole-animation-artifacts'))
ARTIFACTS.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='blackhole-animation-') as tmp:
    tmp=Path(tmp)
    entry=tmp/'entry.ts'
    entry.write_text(f"export {{BlackHoleRenderer}} from '{ROOT}/src/renderer';\nexport {{DEFAULT_SETTINGS}} from '{ROOT}/src/config';")
    subprocess.run([str(ROOT/'node_modules/.bin/esbuild'),str(entry),'--bundle','--format=iife','--global-name=Test',f'--outfile={tmp}/bundle.js'],check=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        page=browser.new_page(viewport={'width':1000,'height':700})
        page.set_content('<style>body{margin:0;color:#ddd;background:#202124;font:18px/1.8 sans-serif}#host{width:1000px;height:700px;position:relative}article{padding:40px}canvas{position:absolute;pointer-events:none}</style><div id="host"><article><h1>Black Hole — default showcase</h1><p>Live notes remain visible and interactive outside the effect.</p><p>Schwarzschild geodesics · accretion disk · photon ring</p><p>Hardware-only plugin · isolated SwiftShader visual test</p></article></div>')
        page.add_script_tag(path=str(tmp/'bundle.js'))
        page.evaluate('''async()=>{
          const c=document.createElement('canvas');document.querySelector('#host').append(c);
          const params={...Test.DEFAULT_SETTINGS,tokenGlideMin:.3,tokenGlideMax:1.5,tokenGlideRate:10};
          const r=new Test.BlackHoleRenderer(c,params);if(!await r.init({allowSoftware:true}))throw Error(r.lastError);
          r.sizeMode=Test.DEFAULT_SETTINGS.sizeMode;r.autoQuality=false;r.frameIntervalMs=1000/60;
          window.r=r;window.c=c;
        }''')
        samples=[]
        for second in (0,10,20,30,40):
            sample=page.evaluate('''async second=>{
              const r=window.r,c=window.c,gl=r.gl;
              r.renderFrame((r.demoStart+second)*1000);gl.finish();
              const bytes=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
              let mass=0,lit=0;for(let i=0;i<bytes.length;i+=4){mass+=bytes[i+3];if(bytes[i]+bytes[i+1]+bytes[i+2]>10)lit++}
              return {second,shadowDiameterCss:r.effectState.radius*1400,pixels:c.width*c.height,mass,lit,glError:gl.getError()};
            }''',second)
            samples.append(sample)
            page.screenshot(path=str(ARTIFACTS/f'demo-{second:02}.png'))
        # Inspect the presented screen, not the disposable WebGL drawing buffer.
        reference=Image.open(io.BytesIO(page.screenshot())).convert('RGB')
        changed_presentations=0
        for _ in range(12):
            page.evaluate("async()=>{window.r.resize();await new Promise(resolve=>requestAnimationFrame(resolve));}")
            shot=Image.open(io.BytesIO(page.screenshot())).convert('RGB')
            if ImageChops.difference(reference,shot).getbbox(): changed_presentations+=1
        hold={'changedPresentations':changed_presentations,
              'preserveDrawingBuffer':page.evaluate('window.r.gl.getContextAttributes().preserveDrawingBuffer')}
        runtime=page.evaluate('''async()=>{
          const r=window.r;r.resize();r.start();
          const start=performance.now();let previous=start,maxGap=0,ticks=0;
          await new Promise(resolve=>{
            const tick=now=>{maxGap=Math.max(maxGap,now-previous);previous=now;ticks++;
              if(now-start>=1500)resolve();else requestAnimationFrame(tick)};
            requestAnimationFrame(tick);
          });
          r.stop();return {ticks,maxRafGapMs:maxGap,elapsedMs:performance.now()-start,error:r.lastError};
        }''')
        page.evaluate('window.r.destroy()')
        result={'samples':samples,'hold':hold,'runtime':runtime,'artifacts':str(ARTIFACTS)}
        print(json.dumps(result,indent=2))
        assert all(s['mass']>0 and s['lit']>0 and s['glError']==0 and s['pixels']<=262144 for s in samples)
        assert samples[0]['shadowDiameterCss']>20 and samples[-1]['shadowDiameterCss']>150
        assert hold['changedPresentations']==0 and not hold['preserveDrawingBuffer']
        (ARTIFACTS/'results.json').write_text(json.dumps(result,indent=2))
        browser.close()
