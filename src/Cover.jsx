import {useState,useRef,useEffect} from 'react';
import {motion,AnimatePresence,useScroll,useTransform,useMotionValueEvent} from 'motion/react';
import {useSiteMotion as useReducedMotion} from './MotionPreferences';
import {Plus,X,Layers3,ArrowUpRight} from 'lucide-react';
import {useLocale} from './Locale';
import HeroShoe from './HeroShoe';
import VisitorCount from './VisitorCount';
import './cover.css';
import './cover-refinements.css';
export default function Cover({onBegin}){
 const {t,lang,setLang}=useLocale(),[focus,setFocus]=useState(null),host=useRef(null),reduce=useReducedMotion();
 const begin=onBegin??(()=>document.getElementById('comparison')?.scrollIntoView({behavior:reduce?'instant':'smooth'}));
 const [compact,setCompact]=useState(()=>matchMedia('(max-width:760px)').matches),[started,setStarted]=useState(false);
 useEffect(()=>{const q=matchMedia('(max-width:760px)'),change=()=>setCompact(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change);},[]);
 const {scrollYProgress}=useScroll({target:host,offset:['start start','end start']});
 const y=useTransform(scrollYProgress,[0,1],[0,reduce?0:compact?16:48]);
 const ghostY=useTransform(scrollYProgress,[0,1],[0,reduce?0:compact?-10:-30]);
 const scale=useTransform(scrollYProgress,[0,1],[1,reduce?1:.975]);
 useMotionValueEvent(scrollYProgress,'change',v=>{if(!started&&v>.03)setStarted(true);});
 const intro={initial:reduce?false:{opacity:.75,y:16},animate:{opacity:1,y:0},transition:{duration:.55,ease:[.22,1,.36,1]}};
 const tech=()=>document.getElementById('tech-lab')?.scrollIntoView({behavior:reduce?'instant':'smooth'});
 const findFit=()=>document.getElementById('player-profile')?.scrollIntoView({behavior:reduce?'instant':'smooth'});
 return <section className="cover-page" id="home" ref={host}>
  <div className="cover-nav"><a className="court-logo" href="#home"><span>C</span> COURTSIDE</a><nav aria-label={t('主导航')}><button className="active" onClick={()=>host.current.scrollIntoView({behavior:reduce?'instant':'smooth'})}>{t('首页')}</button><button onClick={begin}>{t('球鞋 Battle')}</button><button onClick={tech}>{t('科技解构')}</button></nav><div className="cover-nav-actions"><div className="language-toggle" aria-label="Language"><button className={lang==='zh'?'on':''} onClick={()=>setLang('zh')} aria-pressed={lang==='zh'}>中文</button><button className={lang==='en'?'on':''} onClick={()=>setLang('en')} aria-pressed={lang==='en'}>EN</button></div><button className="nav-action" onClick={findFit}>{t('开始选鞋')}<ArrowUpRight size={16}/></button></div></div>
  <div className="cover-content"><motion.div className="cover-copy" {...intro}>
   <p className="cover-kicker"><span/> PERSONAL SNEAKER ADVISOR</p><h1>{t('你的私人')}<br/>{t('球鞋')}<span>{t('顾问。')}</span></h1>
   <p className="cover-subtitle">{t('读懂球鞋科技，也读懂你的打法。')}<br/>{t('把每一次选择，交给更适合你的脚感。')}</p>
   <div className="cover-ctas"><button className="primary-button" onClick={findFit}>{t('帮我挑鞋')}<ArrowUpRight size={20}/></button><button className="text-button" onClick={begin}><Layers3 size={18}/>{t('两双对比')}<ArrowUpRight size={16}/></button></div>
   <div className="cover-trust"><span>NIKE</span><span>LI-NING</span><span>ANTA</span><span>ADIDAS</span></div>
  </motion.div>
  <motion.div className="cover-stage" style={{y,scale}} initial={reduce?false:{opacity:.7}} animate={{opacity:1}} transition={{duration:.7}}>
   <motion.div className="cover-ghost" style={{y:ghostY}} aria-hidden="true">CUT<br/>01</motion.div><div className="shoe-aura"/><HeroShoe>
    <div className={'hero-pin pin-foam '+(focus==='foam'?'on':'')}><button className={'hero-hotspot '+(focus==='foam'?'on':'')} aria-label={t('查看 React 泡棉')} aria-expanded={focus==='foam'} aria-controls="hero-tech-detail" onClick={()=>setFocus(focus==='foam'?null:'foam')}><Plus size={16}/><span>{t('React 泡棉')}</span></button></div>
    <div className={'hero-pin pin-zoom '+(focus==='zoom'?'on':'')}><button className={'hero-hotspot '+(focus==='zoom'?'on':'')} aria-label={t('查看 Air Zoom')} aria-expanded={focus==='zoom'} aria-controls="hero-tech-detail" onClick={()=>setFocus(focus==='zoom'?null:'zoom')}><Plus size={16}/><span>Air Zoom Strobel</span></button></div>
   </HeroShoe>
  </motion.div></div>
  <div className="cover-tech-dock"><div className="hero-shoe-caption"><div><span>{t('封面之选 / 01')}</span><h2>NIKE G.T. CUT 1</h2><p>Pinksicle / Hyper Pink · CZ0175-600</p></div></div><div className="hero-tech-detail" id="hero-tech-detail">
   <AnimatePresence mode="wait" initial={false}>{focus&&<motion.div key={focus} className="hero-callout" role="status" initial={reduce?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.2}} onAnimationComplete={()=>{if(focus)document.getElementById('hero-tech-detail')?.scrollIntoView({block:'nearest',behavior:reduce?'instant':'smooth'});}}><div><strong>{focus==='foam'?t('抽取式 React 泡棉'):t('全掌 Strobel + 后跟 Zoom')}</strong><p>{focus==='foam'?t('React 抽取式中底位于全掌 Air Zoom Strobel 上方，形成贴近足底的缓震层。'):t('全掌 Air Zoom Strobel 配合后跟 Air Zoom 单元；气垫尺寸与压力未公开。')}</p><a href="https://www.nike.com/us/es/t/tenis-de-basquetbol-para-hombre-nike-gt-cut-nike-nationals-kVHOVa1l/IX5226-001" target="_blank" rel="noreferrer">{t('官方配置')}<ArrowUpRight size={12}/></a></div><button className="hero-detail-close" aria-label={t('关闭科技说明')} onClick={()=>setFocus(null)}><X size={17}/></button></motion.div>}</AnimatePresence>
  </div></div>
  <VisitorCount/>
  <div className={'cover-bottom '+(started?'has-scrolled':'')}><span>{t('好球鞋，从懂你开始。')}</span><button onClick={begin}><span className="scroll-pill"/>{t('下滑，遇见你的主场')}</button><span>THE COURT IS YOURS.</span></div>
 </section>;
}
