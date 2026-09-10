// Run with Electron in an isolated headless profile, never the live vault.
const {app,BrowserWindow}=require('electron');
const {buildSync}=require('esbuild');
const {mkdtempSync,writeFileSync}=require('node:fs');
const {join}=require('node:path');
const {tmpdir}=require('node:os');
const assert=require('node:assert/strict');
const root=join(__dirname,'..'),out=mkdtempSync(join(tmpdir(),'blackhole-electron-'));
app.setPath('userData',join(out,'profile'));app.disableHardwareAcceleration();
const bundle=buildSync({entryPoints:[join(root,'src/backdrop.ts')],bundle:true,format:'iife',globalName:'Test',write:false}).outputFiles[0].text;
const deadline=setTimeout(()=>app.exit(2),40000);
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1000,height:700,show:true,webPreferences:{offscreen:true,sandbox:true,contextIsolation:true}});
 const wc=win.webContents;
 await wc.loadURL('data:text/html,'+encodeURIComponent('<style>body{margin:0;background:white}#note{position:absolute;left:200px;top:60px;width:760px;height:600px;overflow:auto;background:white}p{margin:0;font:22px/28px monospace}#marker{position:absolute;left:230px;top:180px;width:5px;height:200px;background:red}.blackhole-backdrop{position:fixed;z-index:89;pointer-events:none}</style><div id="note"></div>'));
 await wc.executeJavaScript(bundle);
 await wc.executeJavaScript(`document.querySelector('#note').innerHTML='<p>REAL TIME TEXT 0123456789</p>'.repeat(10000)+'<div id="marker"></div>';window.lens=new Test.BackdropLens(document.body);lens.setTarget(document.querySelector('#note'));lens.setSuspended(false);lens.setEnabled(false);window.frame={x:530,y:322,radius:24.5,intensity:1,width:1000,height:700,depth:13};lens.update(frame)`);
 const capture=async name=>{
  await wc.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const image=await wc.capturePage({x:0,y:0,width:1000,height:700});
  const size=image.getSize();assert.equal(size.width,1000);assert.equal(size.height,700);
  writeFileSync(join(out,name+'.png'),image.toPNG());const b=image.toBitmap();const red=[];
  for(let x=350;x<460;x++){const i=(300*size.width+x)*4;if(b[i]<10&&b[i+1]<10&&b[i+2]>245)red.push(x)}return red;
 };
 const off=await capture('off');
 await wc.executeJavaScript('lens.setEnabled(true);lens.update(frame)');const on=await capture('on');
 assert.ok(off.length&&on.length);assert.ok(!off.some(x=>on.includes(x)));assert.ok(on.every((x,i)=>!i||x===on[i-1]+1));
 await wc.executeJavaScript('lens.destroy()');assert.equal(await wc.executeJavaScript('document.querySelectorAll(".blackhole-backdrop,.blackhole-filter-defs").length'),0);
 const result={electron:process.versions.electron,chromium:process.versions.chrome,off,on,cleanup:true,artifacts:out,scope:'production BackdropLens, synthetic 10000-row note, software compositor; not live Obsidian/GPU FPS'};
 writeFileSync(join(out,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));clearTimeout(deadline);win.destroy();app.quit();
}).catch(e=>{console.error(e);clearTimeout(deadline);app.exit(1)});
