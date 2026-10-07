import * as THREE from 'three';
import profile from './book2-profile.json';

// The official lateral photograph controls the side profile. Transverse depth
// and hidden surfaces are designed, not scan-derived or dimensionally measured.
function bodyGeometry(){
 const rows=profile.rings,steps=64,positions=[],uv=[],side=[],top=[],bottom=[];
 rows.forEach(r=>{const t=r.x,x=(t-.5)*5.4,hi=(1-r.top)*5.4/profile.aspect,lo=(1-r.bottom)*5.4/profile.aspect;
  const width=(.32+.12*Math.exp(-Math.pow((t-.24)/.32,2))-.14*Math.exp(-Math.pow((t-.58)/.16,2)))*Math.pow(Math.sin(Math.PI*THREE.MathUtils.clamp(t,.001,.999)),.2);
  for(let j=0;j<=steps;j++){const angle=j/steps*Math.PI*2,s=Math.sin(angle),z=width*Math.sign(Math.cos(angle))*Math.pow(Math.abs(Math.cos(angle)),.38),y=(hi+lo)/2+(hi-lo)/2*Math.sign(s)*Math.pow(Math.abs(s),.62);positions.push(x,y,z);uv.push(t,y*profile.aspect/5.4);}
 });
 for(let i=0;i<rows.length-1;i++)for(let j=0;j<steps;j++){
  const a=i*(steps+1)+j,b=a+steps+1,angle=(j+.5)/steps*Math.PI*2;
  if(rows[i].x>.73&&rows[i].x<.965&&Math.sin(angle)>.74)continue;
  const target=Math.sin(angle)>.74?top:Math.sin(angle)<-.8?bottom:side;target.push(a,a+1,b,a+1,b+1,b);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex([...side,...top,...bottom]);g.addGroup(0,side.length,0);g.addGroup(side.length,top.length,1);g.addGroup(side.length+top.length,bottom.length,2);g.computeVertexNormals();return g;
}
function knitTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#777';ctx.fillRect(0,0,128,128);for(let y=0;y<128;y+=4)for(let x=0;x<128;x+=5){ctx.strokeStyle=y%8?'#bababa':'#404040';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2,y+3);ctx.lineTo(x+4,y);ctx.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(20,10);return t;}
export function createBookModel(model,texture,resources){
 const knit=knitTexture(),side=new THREE.MeshBasicMaterial({map:texture,alphaTest:.3,side:THREE.DoubleSide}),upper=new THREE.MeshStandardMaterial({color:'#39296a',map:knit,roughness:.93,bumpMap:knit,bumpScale:.008,side:THREE.DoubleSide}),sole=new THREE.MeshStandardMaterial({color:'#8397ae',roughness:.84});resources.push(knit,side,upper,sole);
 const add=(geometry,material,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);model.add(mesh);resources.push(geometry);return mesh;};add(bodyGeometry(),[side,upper,sole]);
 const lace=new THREE.MeshStandardMaterial({color:'#75649c',roughness:.94,bumpMap:knit,bumpScale:.006}),lining=new THREE.MeshStandardMaterial({color:'#1c1830',roughness:1,side:THREE.DoubleSide}),orange=new THREE.MeshStandardMaterial({color:'#d87527',roughness:.65});resources.push(lace,lining,orange);
 const inner=add(new THREE.SphereGeometry(1,48,24,0,Math.PI*2,Math.PI/2,Math.PI/2),lining,1.8,1.73,0);inner.scale.set(.55,.48,.31);
 const collar=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;collar.push(new THREE.Vector3(1.83+.53*Math.cos(a),1.67+.2*Math.cos(a),.34*Math.sin(a)));}add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(collar),96,.059,12,false),upper);
 for(let i=0;i<6;i++){const x=-1.02+i*.29,y=.91+i*.165,w=.36-i*.023;const points=[new THREE.Vector3(x-.1,y,-w),new THREE.Vector3(x+.035,y+.13,-w*.42),new THREE.Vector3(x+.08,y+.12,w*.45),new THREE.Vector3(x+.15,y-.025,w)];add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,.028,8,false),lace);}
 const pull=[new THREE.Vector3(2.55,1.37,0),new THREE.Vector3(2.62,2.04,0),new THREE.Vector3(2.46,2.08,0),new THREE.Vector3(2.43,1.82,0)];add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pull),36,.012,8,false),orange);
}
