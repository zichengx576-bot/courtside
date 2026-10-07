import {useEffect,useRef,useState} from 'react';
import {motion,useScroll,useMotionValue,useMotionValueEvent} from 'motion/react';
import {ArrowLeft,ArrowRight,Check,Accessibility} from 'lucide-react';
import {useLocale} from './Locale';
import {useSiteMotion,useMotionSettings} from './MotionPreferences';

const chapters=['comparison','tech-lab','player-profile','ask-bro'];
export function Reveal({children,className='',id}){
 const reduce=useSiteMotion();
 return <motion.div id={id} className={className} initial={reduce?false:{opacity:.85,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.45,ease:[.22,1,.36,1]}}>{children}</motion.div>;
}
export function JourneyNav(){
 const {lang}=useLocale(),en=lang==='en',settings=useMotionSettings();
 const [active,setActive]=useState('comparison'),activeRef=useRef(active),host=useRef(null),bounds=useRef([]);
 const progress=useMotionValue(0),{scrollY}=useScroll();
 const items=chapters.map((id,i)=>[id,[en?'Rotation':'球鞋阵容',en?'Technology':'科技解构',en?'Your game':'你的打法','X-dragon'][i]]);
 const update=value=>{
  const ranges=bounds.current;if(!ranges.length)return;
  let i=0;while(i<ranges.length-1&&value>=ranges[i+1])i++;
  if(activeRef.current!==chapters[i]){activeRef.current=chapters[i];setActive(chapters[i]);}
  const end=ranges[i+1]??Math.max(ranges[i]+1,document.documentElement.scrollHeight-innerHeight);
  progress.set(Math.max(0,Math.min(1,(value-ranges[i])/Math.max(1,end-ranges[i]))));
 };
 useMotionValueEvent(scrollY,'change',update);
 useEffect(()=>{
  const measure=()=>{
   const y=scrollY.get(),offset=(host.current?.offsetHeight||68)+16,padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
   bounds.current=chapters.map(id=>{
    const element=document.getElementById(id);if(!element)return 0;
    let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;
    const margin=parseFloat(getComputedStyle(element).scrollMarginTop)||0;
    return Math.max(0,top-Math.max(offset,padding+margin)-1);
   });
   update(y);
  };
  const observer=new ResizeObserver(measure);observer.observe(document.querySelector('.advisor-main'));observer.observe(host.current);
  window.addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[lang,scrollY]);
 return <nav ref={host} className="journey-nav" aria-label={en?'Explore the advisor':'探索球鞋顾问'}><a href="#home" className="journey-brand">COURTSIDE <span>/ LAB</span></a><div>{items.map(([id,name],i)=><button key={id} className={active===id?'on':''} aria-current={active===id?'location':undefined} onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:settings.reduced?'instant':'smooth'})}><small>0{i+1}</small>{name}{active===id&&<motion.i layoutId="chapter-line" transition={settings.reduced?{duration:0}:{type:'spring',stiffness:310,damping:30}}><motion.b style={{scaleX:settings.reduced?1:progress}}/></motion.i>}</button>)}</div><span className="journey-season">2026 SEASON</span><button className="motion-toggle" onClick={settings.toggle} aria-pressed={settings.manual} aria-label={en?(settings.manual?'Restore system motion preference':'Reduce animations'):(settings.manual?'恢复系统动效偏好':'减少动效')} title={en?'Motion preference':'动效偏好'}><Accessibility size={17}/><span>{en?(settings.reduced?'Reduced':'Motion'):(settings.reduced?'低动效':'动效')}</span></button></nav>;
}
export function ShoeShelf({shoes,left,right,onChoose}){
 const {lang}=useLocale(),en=lang==='en',reduce=useSiteMotion(),track=useRef(null),[side,setSide]=useState('left'),[edges,setEdges]=useState([true,false]);
 const {scrollXProgress}=useScroll({container:track});
 const update=()=>{const n=track.current;if(n){const a=n.scrollLeft<2,b=n.scrollLeft+n.clientWidth>=n.scrollWidth-2;setEdges(old=>old[0]===a&&old[1]===b?old:[a,b]);}};
 useEffect(()=>{const observer=new ResizeObserver(update);observer.observe(track.current);update();return()=>observer.disconnect();},[]);
 const scroll=direction=>track.current.scrollBy({left:direction*track.current.clientWidth*.8,behavior:reduce?'instant':'smooth'});
 return <div className="rotation-rail"><div className="rotation-toolbar"><div className="segmented"><button className={side==='left'?'on':''} aria-pressed={side==='left'} onClick={()=>setSide('left')}>{en?'Choose A':'选择 A'}</button><button className={side==='right'?'on':''} aria-pressed={side==='right'} onClick={()=>setSide('right')}>{en?'Choose B':'选择 B'}</button></div><span>{en?'Find your matchup.':'选两双，开始你的对决。'}</span><div className="rail-controls"><button onClick={()=>scroll(-1)} disabled={edges[0]} aria-label={en?'Previous shoes':'上一组球鞋'}><ArrowLeft size={18}/></button><button onClick={()=>scroll(1)} disabled={edges[1]} aria-label={en?'More shoes':'更多球鞋'}><ArrowRight size={18}/></button></div></div>
 <div className="shoe-shelf" ref={track} onScroll={update} aria-label={en?'Choose a basketball shoe':'选择球鞋阵容'}>{shoes.map((s,i)=>{const selected=(side==='left'?left:right)===s.id;return <motion.button key={s.id} initial={reduce||i>3?false:{opacity:.7,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.18}} transition={{duration:.38,delay:i>3?0:i*.04,ease:[.22,1,.36,1]}} onClick={()=>onChoose(side,s.id)} className={selected?'on':''} aria-pressed={selected}><div className="shelf-image"><span>{String(i+1).padStart(2,'0')}</span><img src={s.photos[s.coverIndex||0]} alt="" loading="lazy"/>{(left===s.id||right===s.id)&&<b>{left===s.id?'A':'B'}</b>}</div><span className="shelf-name"><small>{s.brand.split(' / ')[0]}</small><strong>{s.short}</strong></span>{selected&&<Check className="shelf-check" size={16}/>}</motion.button>;})}</div><div className="rail-progress" aria-hidden="true"><motion.i style={{scaleX:scrollXProgress}}/></div></div>;
}
export function SectionMotion(){
 const reduce=useSiteMotion();
 useEffect(()=>{
  if(reduce||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('motion-arrived');observer.unobserve(entry.target);}},{threshold:.15});
  document.querySelectorAll('.section-intro,.tech-intro,.bro-intro,.site-footer,.bro-persona,.player-template').forEach(el=>observer.observe(el));
  return()=>observer.disconnect();
 },[reduce]);
 return null;
}
