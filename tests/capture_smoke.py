import json, os, subprocess, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
MEDIA=os.environ.get('BLACKHOLE_MEDIA')=='1'
INHERITED=os.environ.get('BLACKHOLE_INHERITED')=='1'
TRANSLUCENT=os.environ.get('BLACKHOLE_TRANSLUCENT')=='1'
with tempfile.TemporaryDirectory(prefix='blackhole-capture-') as tmp:
    tmp=Path(tmp)
    entry=ROOT/'src/capture.ts'
    subprocess.run([str(ROOT/'node_modules/.bin/esbuild'),str(entry),'--bundle','--format=iife','--global-name=Capture',f'--outfile={tmp}/capture.js'],check=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_EXECUTABLE'))
        page=browser.new_page()
        page.set_content('<div id="host" style="width:200px;height:100px;overflow:auto;background-color:rgb(220,220,220)"><div style="height:100px;color:red;font-size:60px">TOP</div><div style="height:100px;color:blue;font-size:60px">END</div></div>')
        if MEDIA:
            page.set_content('<div id="host" style="width:200px;height:160px;background:white"><img style="display:block;width:100px;height:80px"><div id="marker" style="height:20px;background:red"></div></div>')
        if INHERITED:
            page.evaluate("document.body.style.background='rgb(220,220,220)';document.querySelector('#host').style.background='transparent'")
        if TRANSLUCENT:
            page.evaluate("document.body.style.background='white';document.querySelector('#host').style.background='rgba(255,0,0,.5)'")
        page.add_script_tag(path=str(tmp/'capture.js'))
        result=page.evaluate('''async()=>{
          const el=document.querySelector('#host');el.scrollTop=100;
          const capture=new Capture.WorkspaceCapture();capture.setElement(el);capture.setOptions({enabled:true,scale:1});
          const result=await new Promise((resolve,reject)=>{
            const timer=setTimeout(()=>reject(Error('no capture delivered')),3000);
            capture.onCapture=canvas=>{
              clearTimeout(timer);const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
              let red=0,blue=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i]>pixels[i+2]+30)red++;if(pixels[i+2]>pixels[i]+30)blue++}
              let firstRed=-1;for(let y=0;y<canvas.height;y++){const i=(y*canvas.width+5)*4;if(pixels[i]>200&&pixels[i+1]<30){firstRed=y;break}}
              resolve({red,blue,firstRed,width:canvas.width,height:canvas.height,corner:Array.from(pixels.slice(-4))});
            };
            if(!capture.capture(performance.now())){clearTimeout(timer);reject(Error('capture refused'))}
          });
          capture.destroy();return result;
        }''')
        print(json.dumps(result,indent=2))
        if TRANSLUCENT:
            r,g,b,a=result['corner'];assert r==255 and 126<=g<=128 and g==b and a==255, 'root tint must survive backdrop compositing'
        elif MEDIA:
            assert result['firstRed']==80, 'excluded image must retain its layout height'
        else:
            assert result['blue']>0 and result['red']==0, 'capture must preserve scroll to the blue END text'
            assert result['corner']==[220,220,220,255], 'solid workspace background must survive filtering'
        browser.close()
