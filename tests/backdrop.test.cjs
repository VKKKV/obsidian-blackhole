const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadTS}=require('./helpers.cjs');
const {displacementMap,lensGeometry}=loadTS('src/backdrop.ts');
const frame={x:500,y:350,radius:40,intensity:1,width:1000,height:700,depth:13};
const note={left:200,top:60,right:960,bottom:660};
test('bounded cached map has identity perimeter and only inward vectors',()=>{
 const n=128,data=displacementMap(n);assert.equal(data.length,n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,nx=(x+.5)/n*2-1,ny=(y+.5)/n*2-1;
  assert.ok((data[i]-128)*nx<=0);assert.ok((data[i+1]-128)*ny<=0);
  assert.equal(data[i+3],255);
  if(nx*nx+ny*ny>=1){assert.equal(data[i],128);assert.equal(data[i+1],128);}
 }
});
test('lens clips output to note and keeps center registered within map',()=>{
 for(const x of [203,500,957])for(const y of [63,350,657]){
  const g=lensGeometry({...frame,x,y},note,2);assert.ok(g);
  assert.ok(g.left>=note.left&&g.top>=note.top);
  assert.ok(g.left+g.width<=note.right&&g.top+g.height<=note.bottom);
  assert.equal(g.left+g.mapX+g.diameter/2,x);
  assert.equal(g.top+g.mapY+g.diameter/2,y);
 }
});
test('physical filter pixels bounded at 1/2/3 DPR without allocating note-sized maps',()=>{
 for(const dpr of [1,2,3]){
  const g=lensGeometry({...frame,radius:5000}, {left:0,top:0,right:8000,bottom:5000},dpr);
  assert.ok(g.width*g.height*dpr*dpr<=1048576);
 }
});
test('non-note, inactive and malformed effects cannot leave a visible lens',()=>{
 for(const override of [{x:199},{y:700},{radius:0},{radius:NaN},{depth:0},{intensity:0}])
  assert.equal(lensGeometry({...frame,...override},note,1),null);
});
test('lens depth increases displacement but never beyond inward-safe strength',()=>{
 const low=lensGeometry({...frame,depth:1},note,1), high=lensGeometry({...frame,depth:50},note,1);
 assert.ok(low.scale<high.scale);assert.ok(high.scale<=high.diameter*.8);
});
