import {useEffect,useRef,useState} from 'react';
import {useSiteMotion} from './MotionPreferences';

export function ClickFeedback(){
 const [rings,setRings]=useState([]),timers=useRef(new Set()),reduced=useSiteMotion();
 useEffect(()=>{
  if(reduced){setRings([]);return;}
  const click=e=>{
   if(e.pointerType==='touch'||!e.target.closest?.('button:not(:disabled),a,summary'))return;
   const id=performance.now();setRings(r=>[...r.slice(-3),{id,x:e.clientX,y:e.clientY}]);
   const timer=setTimeout(()=>{setRings(r=>r.filter(x=>x.id!==id));timers.current.delete(timer);},500);timers.current.add(timer);
  };
  addEventListener('pointerdown',click);
  return()=>{removeEventListener('pointerdown',click);timers.current.forEach(clearTimeout);timers.current.clear();};
 },[reduced]);
 return <div className="click-feedback" aria-hidden="true">{rings.map(r=><i key={r.id} style={{left:r.x,top:r.y}}/>)}</div>;
}
export function ParticleField(){
 const ref=useRef(),reduced=useSiteMotion();
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas.getContext('2d');if(!ctx||reduced){ctx?.clearRect(0,0,canvas.width,canvas.height);return;}
  const fine=matchMedia('(pointer:fine)').matches;
  let w=0,h=0,raf=0,last=0;const pointer={x:-999,y:-999};
  const dots=Array.from({length:fine?36:18},()=>({x:Math.random(),y:Math.random(),v:(Math.random()-.5)*.00009}));
  const resize=()=>{w=canvas.width=innerWidth;h=canvas.height=innerHeight;};resize();
  const move=e=>{pointer.x=e.clientX;pointer.y=e.clientY;};
  const draw=t=>{
   raf=0;if(document.hidden)return;raf=requestAnimationFrame(draw);
   if(t-last<40)return;last=t;ctx.clearRect(0,0,w,h);
   for(const dot of dots){dot.y=(dot.y+dot.v+1)%1;const x=dot.x*w,y=dot.y*h,d=Math.hypot(x-pointer.x,y-pointer.y);
    ctx.fillStyle=d<180?'rgba(86,147,255,.5)':'rgba(98,153,229,.2)';ctx.beginPath();ctx.arc(x,y,d<180?1.5:1,0,Math.PI*2);ctx.fill();
    if(fine&&d<180){ctx.strokeStyle='rgba(75,147,255,'+((1-d/180)*.16)+')';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();}
   }
  };
  const visibility=()=>{cancelAnimationFrame(raf);raf=0;if(!document.hidden){last=0;raf=requestAnimationFrame(draw);}};
  raf=requestAnimationFrame(draw);if(fine)addEventListener('pointermove',move,{passive:true});addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
  return()=>{cancelAnimationFrame(raf);removeEventListener('pointermove',move);removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);};
 },[reduced]);
 return <canvas className="particle-field" ref={ref} aria-hidden="true"/>;
}
