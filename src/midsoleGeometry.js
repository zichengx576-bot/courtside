import * as THREE from 'three';
export function outline(p={}){
 const w=p.width??1,h=p.heel??1,a=p.waist??1,s=new THREE.Shape();s.moveTo(-1.4,-.29*h);
 s.bezierCurveTo(-1.62,-.22*h,-1.62,.26*h,-1.36,.32*h);s.bezierCurveTo(-.8,.4*w,-.38,.19*a,.15,.37*w);
 s.bezierCurveTo(.65,.52*w,1.4,.53*w,1.5,.12);s.bezierCurveTo(1.7,-.34*w,1.14,-.52*w,.45,-.45*w);
 s.bezierCurveTo(-.18,-.32*a,-.68,-.33*h,-1.4,-.29*h);return s;
}
function camber(x){return .055*Math.pow(Math.max(0,x-.6),2)+.055*Math.exp(-Math.pow((x+.35)/.48,2));}
function extrude(s,d,soft=false){const b=soft?Math.min(.034,d*.22):.008,g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:7,curveSegments:64});g.rotateX(-Math.PI/2);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);pos.setY(i,y+camber(x)+(soft?Math.max(0,y)*(.13*Math.exp(-Math.pow((x+1)/.6,2))-.06*Math.pow(z/.52,2)):0));}g.computeVertexNormals();return g;}
function cupWall(p,depth){
 const pts=outline(p).getPoints(150),position=[],indices=[],uv=[];
 const rings=[[1,0],[1.008,.25],[1.012,.66],[1, .94],[.979,1],[.923,.98],[.892,.7],[.863,.18],[.845,0]];
 rings.forEach(([scale,raised],j)=>pts.forEach((v,i)=>{const heel=THREE.MathUtils.smoothstep(-v.x,-.1,1.4),height=.05+.23*heel+.036*Math.exp(-Math.pow(v.x/.65,2));position.push(v.x*scale,depth+camber(v.x)+height*raised-.012,-v.y*scale);uv.push(i/pts.length*3,j/8);}));
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<pts.length-1;i++){const a=j*pts.length+i,b=a+pts.length;indices.push(a,b,a+1,a+1,b,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function plate(region){
 const s=new THREE.Shape();
 if(region==='forefoot-arch'){s.moveTo(-.45,-.14);s.bezierCurveTo(.05,-.24,.66,-.39,1.19,-.28);s.bezierCurveTo(1.49,-.15,1.44,.32,1.13,.37);s.bezierCurveTo(.45,.46,.1,.18,-.48,.15);}
 else if(region==='longitudinal'){s.moveTo(-1.16,-.135);s.bezierCurveTo(-1.04,-.215,-.78,-.21,-.53,-.115);s.bezierCurveTo(-.1,-.06,.18,-.14,.6,-.23);s.bezierCurveTo(.99,-.315,1.24,-.24,1.29,-.08);s.bezierCurveTo(1.34,.09,1.11,.285,.79,.27);s.bezierCurveTo(.38,.25,.02,.09,-.37,.105);s.bezierCurveTo(-.73,.15,-1.08,.215,-1.18,.11);s.bezierCurveTo(-1.27,.015,-1.26,-.09,-1.16,-.135);for(const [x,rx,ry] of [[-.91,.2,.066],[.86,.33,.092]]){const h=new THREE.Path();h.absellipse(x,0,rx,ry,0,Math.PI*2,false);s.holes.push(h);}}
 else{s.moveTo(-.76,-.14);s.bezierCurveTo(-.5,-.18,-.08,-.25,.35,-.18);s.lineTo(.53,.03);s.lineTo(.28,.23);s.lineTo(-.64,.18);}s.closePath();return s;
}
function surfaceTexture(carbon){
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=carbon?'#171c22':'#969a9c';ctx.fillRect(0,0,512,512);
 if(carbon){for(let row=0;row<64;row++)for(let col=0;col<64;col++){const vertical=((col-row+128)%4)<2,x=col*8,y=row*8;const gradient=ctx.createLinearGradient(x,y,vertical?x+8:x,vertical?y:y+8);gradient.addColorStop(0,'#20262d');gradient.addColorStop(.45,'#47505a');gradient.addColorStop(1,'#242b33');ctx.fillStyle=gradient;ctx.fillRect(x,y,8,8);ctx.strokeStyle='#88929c35';for(let k=1;k<8;k+=2){ctx.beginPath();ctx.moveTo(vertical?x+k:x,vertical?y:y+k);ctx.lineTo(vertical?x+k:x+8,vertical?y+8:y+k);ctx.stroke();}}}
 else{let seed=9137;for(let i=0;i<18000;i++){seed=(seed*16807)%2147483647;const x=seed%512;seed=(seed*16807)%2147483647;const y=seed%512;ctx.fillStyle=i%3?'#838a8b80':'#b4b7b68a';ctx.beginPath();ctx.ellipse(x,y,.5+(seed%5)*.16,.7,0,0,Math.PI*2);ctx.fill();}}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(carbon?2.4:3,carbon?1.1:1.7);t.anisotropy=8;if(carbon)t.colorSpace=THREE.SRGBColorSpace;return t;
}
export function componentMesh(l,p,r){
 const group=new THREE.Group(),materials=[],air=l.type==='air',carbon=l.type==='carbon'||l.material==='carbon',foam=['foam','insole','carrier'].includes(l.type);
 const physicalColor=carbon?'#bac3cc':foam?(l.type==='insole'?'#cbd0cd':'#abbabf'):l.type==='outsole'?'#778c9b':l.type==='frame'?'#253749':l.color;
 const m=air?new THREE.MeshPhysicalMaterial({color:'#aed8eb',transparent:true,opacity:.65,metalness:0,roughness:.12,clearcoat:1}):new THREE.MeshPhysicalMaterial({color:physicalColor,roughness:carbon?.28:foam?.77:.46,metalness:carbon?.12:.01,clearcoat:carbon?.6:0,clearcoatRoughness:.25});
 materials.push(m);r.push(m);if(carbon){const t=surfaceTexture(true);m.map=t;m.bumpMap=t;m.bumpScale=.004;r.push(t);}if(foam){const t=surfaceTexture(false);m.side=THREE.DoubleSide;m.bumpMap=t;m.bumpScale=.009;r.push(t);}
 const add=(g,mat=m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);r.push(g);return o;};
 const zone=l.zone??'full',depth=l.visualDepth??.16;
 if(air){
  const full=zone==='full',heel=zone==='heel',len=full?2.72:heel?.72:1.08,w=full?.76:heel?.52:.8,x=full?.02:heel?-1.04:.82;
  const o=add(extrude(outline(p),.075));o.scale.set(len/3.1,1,w/.91);o.position.x=x;
  const mat=new THREE.LineBasicMaterial({color:0xa9eaff,transparent:true,opacity:.72});materials.push(mat);r.push(mat);const pts=[];
  for(let a=-len/2+.08;a<len/2-.07;a+=.07)for(let z=-w*.32;z<w*.32;z+=.1)pts.push(a+x,.008,z,a+x,.073,z);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));group.add(new THREE.LineSegments(g,mat));r.push(g);
 }else if(l.type==='carbon'||l.type==='plate'){
  if(zone==='forefoot'){const s=new THREE.Shape();s.moveTo(.4,-.42);s.lineTo(1.18,-.37);s.lineTo(1.26,-.29);s.lineTo(.43,-.32);s.closePath();add(extrude(s,.19));}
  else add(extrude(plate(zone),.022));
  if(zone==='forefoot-arch')add(new THREE.BoxGeometry(.75,.3,.05),m,.83,.14,-.37).rotation.z=.12;
 }else if(['wing','frame'].includes(l.type)){
  const x=zone==='forefoot'?.88:zone==='heel'?-1.03:-.18,len=zone==='heel'?.72:zone==='forefoot'?.83:1.4,s=new THREE.Shape();
  s.moveTo(-len/2,0);s.bezierCurveTo(-len*.33,.22,-len*.22,.38,0,.31);s.bezierCurveTo(len*.25,.46,len*.36,.18,len/2,.02);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.045,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2});add(g,m,x,0,-.35);if(l.type==='frame'||zone==='heel')add(g.clone(),m,x,0,.32);
 }else if(zone==='heel'){
  const o=add(extrude(outline(p),depth));o.scale.set(.3,1,.66);o.position.x=-1.02;
 }else if(l.type==='outsole'){
  add(extrude(outline(p),.085));const mat=new THREE.MeshStandardMaterial({color:0xb7c6dc,roughness:.9});materials.push(mat);r.push(mat);
  for(let i=0;i<20;i++)add(new THREE.BoxGeometry(.025,.025,i<7?.45:i<12?.35:.65),mat,-1.35+i*.14,-.022,0).rotation.y=i%2?.23:-.23;
 }else{
  const shape=outline(p);if(l.cavity){const hole=new THREE.Path();hole.absellipse(l.cavity==='heel'?-1.02:.88,0,l.cavity==='heel'?.34:.4,.25,0,Math.PI*2,false);shape.holes.push(hole);}
  if(l.surfaceDimples){for(const x of [-.38,.02,.4]){const h=new THREE.Path();h.absellipse(x,0,.09,.065,0,Math.PI*2,false);shape.holes.push(h);}}
  add(extrude(shape,depth,true));
  if(l.surfaceDimples){for(const x of [-.38,.02,.4]){const g=new THREE.SphereGeometry(1,24,16,0,Math.PI*2,Math.PI/2,Math.PI/2);g.scale(.089,.026,.064);g.translate(x,depth+camber(x)-.003,0);add(g);}}
  if(l.rim){add(cupWall(p,depth));}
  if(l.archInset){const side=new THREE.Shape();side.moveTo(-.75,0);side.lineTo(.35,.05);side.lineTo(.1,.24);side.lineTo(-.58,.16);side.closePath();const g=new THREE.ExtrudeGeometry(side,{depth:.025,bevelEnabled:true,bevelSize:.013,bevelThickness:.01,bevelSegments:2});const mat=new THREE.MeshStandardMaterial({color:0xa79a70,roughness:.5,metalness:.25});materials.push(mat);r.push(mat);add(g,mat,0,.04,-.34);}
 }
 return {group,materials};
}
