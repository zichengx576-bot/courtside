import {useRef,useEffect} from 'react';
import {useSiteMotion} from './MotionPreferences';
import {useLocale} from './Locale';
export default function HeroShoe({children}){
 const host=useRef(),frame=useRef(0),pointer=useRef({x:0,y:0}),{t}=useLocale(),reduce=useSiteMotion();
 const move=e=>{if(e.pointerType==='touch'||reduce)return;pointer.current={x:e.clientX,y:e.clientY};if(frame.current)return;frame.current=requestAnimationFrame(()=>{frame.current=0;const r=host.current.getBoundingClientRect(),x=(pointer.current.x-r.left)/r.width-.5,y=(pointer.current.y-r.top)/r.height-.5;host.current.style.setProperty('--px',x*28+'px');host.current.style.setProperty('--py',y*20+'px');host.current.style.setProperty('--tilt',x*6+'deg');});};
 const reset=()=>{cancelAnimationFrame(frame.current);frame.current=0;for(const [k,v] of [['--px','0px'],['--py','0px'],['--tilt','0deg']])host.current.style.setProperty(k,v);};
 useEffect(()=>{if(reduce)reset();return()=>cancelAnimationFrame(frame.current);},[reduce]);
 return <div className="hero-photo-scene" ref={host} onPointerMove={move} onPointerLeave={reset}><div className="hero-orbit" aria-hidden="true"/><div className="hero-photo-shadow" aria-hidden="true"/><div className="hero-product-plane"><img className="hero-product-photo" src="/shoes/gtcut1-hero-clean.webp" alt={t('Nike G.T. Cut 1 实拍辅助抠图 · 交互视差')} fetchPriority="high" draggable="false"/>{children}</div><div className="hero-light-streak" aria-hidden="true"/></div>;
}
