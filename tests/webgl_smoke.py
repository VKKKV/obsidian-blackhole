import json, os, subprocess, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

# Optional integration suite: pip install playwright; playwright install chromium.
# Never launches Obsidian or reads a vault. Software WebGL is permitted ONLY here.
ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='blackhole-webgl-') as tmp:
    tmp = Path(tmp)
    entry = tmp / 'entry.ts'
    entry.write_text(f"export {{ BlackHoleRenderer }} from '{ROOT}/src/renderer';\nexport {{ DEFAULT_SETTINGS }} from '{ROOT}/src/config';\n")
    subprocess.run([str(ROOT/'node_modules/.bin/esbuild'), str(entry), '--bundle', '--format=iife', '--global-name=Test', f'--outfile={tmp}/bundle.js'], check=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),
          args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width':800,'height':600})
        page.set_content('<style>body{margin:0;background:#ddd}#host{position:relative;width:800px;height:600px}canvas{position:absolute;pointer-events:none}</style><div id="host"></div>')
        page.add_script_tag(path=str(tmp/'bundle.js'))
        result = page.evaluate('''async () => {
          const params={...Test.DEFAULT_SETTINGS,holeRadius:.014,tokenAreaMin:.003,tokenAreaMax:.02,diskOuter:7,tokenGlideMin:.3,tokenGlideMax:1.5,tokenGlideRate:10};
          const host=document.querySelector('#host');
          const rejected=new Test.BlackHoleRenderer(document.createElement('canvas'),params);
          const softwareRejected=!await rejected.init();rejected.destroy();
          const c=document.createElement('canvas');host.append(c);
          const r=new Test.BlackHoleRenderer(c,params);
          if(!await r.init({allowSoftware:true}))throw Error(r.lastError);
          r.autoQuality=false;r.setRenderScale(.35);r.sizeMode=1;
          r.tokenLevel=.3;r.lastTokenLevel=.3;r.prevTokenLevel=.3;
          const gl=r.gl,outputs=[];
          for(const sec of [10,50,100]){
            r.renderFrame(sec*1000);gl.finish();
            const pixels=new Uint8Array(c.width*c.height*4);
            gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
            let maxRGB=0,mass=0,sx=0,sy=0;
            for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
              const i=(y*c.width+x)*4,a=pixels[i+3];mass+=a;sx+=x*a;sy+=y*a;
              maxRGB=Math.max(maxRGB,pixels[i],pixels[i+1],pixels[i+2]);
            }
            const rect=r.viewportRect;
            const actualY=rect.y+(1-sy/mass/c.height)*rect.height;
            outputs.push({sec,maxRGB,mass,centerErrorY:Math.abs(actualY-r.effectState.y*600),glError:gl.getError()});
          }
          // Transparent capture must not become a black lens-shaped mask.
          const transparent=document.createElement('canvas');transparent.width=8;transparent.height=8;
          r.updateTexture(transparent);r.captureEnabled=true;r.renderFrame(100000);gl.finish();
          const transparentPixels=new Uint8Array(c.width*c.height*4);
          gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,transparentPixels);
          let transparentMass=0;for(let i=3;i<transparentPixels.length;i+=4)transparentMass+=transparentPixels[i];
          // Probe orientation with an asymmetric top-red/bottom-blue capture.
          const tex=document.createElement('canvas');tex.width=800;tex.height=600;
          const ctx=tex.getContext('2d');ctx.fillStyle='red';ctx.fillRect(0,0,800,300);ctx.fillStyle='blue';ctx.fillRect(0,300,800,300);
          r.updateTexture(tex);r.captureEnabled=true;r.renderFrame(100000);gl.finish();
          const pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
          let red=0,blue=0;for(let i=0;i<pixels.length;i+=4){red+=pixels[i]*pixels[i+3];blue+=pixels[i+2]*pixels[i+3]}
          // Drive RAF timestamps without waiting: healthy intentional cadence.
          r.autoQuality=true;r.startTime=100000;r.prevTime=100000;r.dtAvg=0;r.lastScaleAdjust=100000;
          for(let now=100000;now<110000;now+=1000/60)r.renderFrame(now);
          const healthyScale=r.renderScale;
          let contextLost=false;r.onFatalError=()=>contextLost=true;
          const lose=gl.getExtension('WEBGL_lose_context');lose.loseContext();
          await new Promise(resolve=>setTimeout(resolve,100));
          r.destroy();return {softwareRejected,outputs,transparentMass,texture:{red,blue},healthyScale,contextLost};
        }''')
        print(json.dumps(result,indent=2))
        assert result['softwareRejected'], 'production must not compile the effect on software WebGL'
        assert all(x['maxRGB']>0 and x['mass']>0 and x['glError']==0 for x in result['outputs'])
        assert all(x['centerErrorY']<8 for x in result['outputs']), 'top-left effect center must match the crop'
        assert result['texture']['red']>result['texture']['blue']*2, 'top-of-window texture is upside down'
        assert result['transparentMass']==result['outputs'][-1]['mass'], 'transparent capture must match capture-disabled alpha'
        assert result['healthyScale']==.35, 'intentional cadence must not lower quality'
        assert result['contextLost'], 'context loss must stop safely'
        browser.close()
