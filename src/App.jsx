import ComparePanel from './ComparePanel';
import ProfileForm from './ProfileForm';
import {readExperience,saveExperience} from './session';
import {Reveal,JourneyNav,ShoeShelf,SectionMotion} from './CampaignMotion';
import {useSiteMotion as useReducedMotion} from './MotionPreferences';
import BroAdvisor from './BroAdvisor';
import Community,{FeedbackContact} from './Community';
import { useLocale } from "./Locale";
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { ArrowUp, Layers3, RotateCcw, Check, Move3D, Info } from 'lucide-react';
import { shoes as rawShoes, dimensions as rawDimensions, styleLabels as rawStyleLabels, courtLabels as rawCourtLabels, positionLabels as rawPositionLabels, analysisFor, validateProfile, criteria } from './data';
import Cover from './Cover';
import AdvisorResult from './AdvisorResult';
import { playerTemplate, rankShoes } from './advisor';
import { PositionMap, LayerDetails, OfficialFigures } from './StructureDetails';
const TechView = lazy(() => import('./TechView'));
import { ClickFeedback, ParticleField } from './Interactions';
export default function App() {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  const reduce=useReducedMotion();
  const [shoes, dimensions, styleLabels, courtLabels, positionLabels] = useMemo(() => localize([rawShoes,rawDimensions,rawStyleLabels,rawCourtLabels,rawPositionLabels]),[lang]);
  const [restored] = useState(readExperience);
  const [left, setLeft] = useState(restored.left), [right, setRight] = useState(restored.right);
  const [profile, setProfile] = useState(restored.profile), [applied, setApplied] = useState(restored.applied);
  const [saved,setSaved] = useState(true);
  const [showTech,setShowTech]=useState(false),techHost=useRef(null);
  useEffect(()=>{if(!('IntersectionObserver' in window)){setShowTech(true);return;}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setShowTech(true);observer.disconnect();}},{rootMargin:'420px'});if(techHost.current)observer.observe(techHost.current);return()=>observer.disconnect();},[]);
  useEffect(()=>{setSaved(saveExperience({left,right,profile,applied}));},[left,right,profile,applied]);
  const [active, setActive] = useState('left'),
    [explode, setExplode] = useState(85),
    [focus, setFocus] = useState(null),
    [reset, setReset] = useState(0),
    [toast, setToast] = useState(''),
    [revision, setRevision] = useState(0),
    [error, setError] = useState('');
  const timer = useRef(),
    a = shoes.find(s => s.id === left) || shoes[0],
    b = shoes.find(s => s.id === right) || shoes[2],
    current = active === 'left' ? a : b;
  const selectedLayer = current.layers.find(l => l.id === focus) || current.layers[0];
  const dirty = JSON.stringify(profile) !== JSON.stringify(applied);
  const notify = text => {
    setToast(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {clearTimeout(timer.current);setToast('');},[lang]);
  const choose = (side, id) => {
    if (side === 'left') {
      if (id === right) setRight(left);
      setLeft(id);
    } else {
      if (id === left) setLeft(right);
      setRight(id);
    }
    setFocus(null);
    notify(t("\u5DF2\u66F4\u65B0\u7403\u978B\u5BF9\u6BD4"));
  };
  const explore = side => {
    setShowTech(true);
    setActive(side);
    setFocus(null);
    setExplode(85);
    document.getElementById('tech-lab')?.scrollIntoView({
      behavior: reduce ? 'instant' : 'smooth',
      block: 'start'
    });
  };
  const generate = () => {
    try {
      setApplied(validateProfile(profile));
      setError('');
      setRevision(x => x + 1);
      notify(t("\u4F60\u7684\u9002\u914D\u5EFA\u8BAE\u5DF2\u66F4\u65B0"));
      document.getElementById('your-match')?.scrollIntoView({
        behavior: reduce ? 'instant' : 'smooth',
        block: 'start'
      });
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    const ctx = document.modelContext;
    if (!ctx?.registerTool) return;
    const life = new AbortController();
    const tool = {
      name: 'configure_sneaker_battle',
      description: 'Compare two distinct real basketball shoes and update the visible player fit advice. Indices are editorial estimates, not measured performance.',
      inputSchema: {
        type: 'object',
        properties: {
          left: {
            type: 'string',
            enum: shoes.map(s => s.id)
          },
          right: {
            type: 'string',
            enum: shoes.map(s => s.id)
          },
          weight: {
            type: 'number',
            minimum: 45,
            maximum: 120
          },
          style: {
            type: 'string',
            enum: Object.keys(styleLabels)
          },
          court: {
            type: 'string',
            enum: Object.keys(courtLabels)
          },
          position: {
            type: 'string',
            enum: Object.keys(positionLabels)
          },
          feel:{type:'string',enum:['balanced','cushion','court']},
          width:{type:'string',enum:['regular','wide','unknown']},
          height:{type:'number',minimum:130,maximum:230},
          footShape:{type:'string',enum:['unknown','egyptian','greek','roman']},
          arch:{type:'string',enum:['unknown','normal','low','high']}
        },
        required: ['left', 'right', 'weight', 'style', 'court'],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false
      },
      async execute(input) {
        if (!input || !shoes.some(s => s.id === input.left) || !shoes.some(s => s.id === input.right) || input.left === input.right) throw new Error('Choose two distinct valid basketball shoes');
        const p = validateProfile({
          weight: input.weight,
          style: input.style,
          court: input.court,
          position: input.position,
          feel:input.feel,
          width:input.width,
          height:input.height,
          footShape:input.footShape,
          arch:input.arch
        });
        setLeft(input.left);
        setRight(input.right);
        setProfile(p);
        setApplied(p);
        setError('');
        setFocus(null);
        setRevision(x => x + 1);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const r = analysisFor(shoes.find(s => s.id === input.left), shoes.find(s => s.id === input.right), p);
        return {
          left: input.left,
          right: input.right,
          scoreA: r.scoreA,
          scoreB: r.scoreB,
          recommendation: r.winner.name,
          primaryRecommendation: rankShoes(p, shoes, criteria(p))[0].shoe.name,
          playerTemplate: playerTemplate(p).name,
          priorities: r.priorities,
          scoreType: 'editorial preference index'
        };
      }
    };
    try {
      Promise.resolve(ctx.registerTool(tool, {
        signal: life.signal
      })).catch(() => {});
    } catch {}
    return () => life.abort();
  }, []);
  return <><ParticleField /><ClickFeedback /><SectionMotion/><Cover />
 <main className="advisor-main" id="comparison"><JourneyNav/>
  <Reveal className="section-intro"><div><p className="eyebrow">01 / THE 2026 ROTATION</p><h2>{t("\u8BA9\u65B0\u4E00\u4EE3\u597D\u978B\uFF0C")}<span>{t("\u6B63\u9762\u4EA4\u950B\u3002")}</span></h2><p>{t("\u4EE5 2026 \u65B0\u6B3E\u4E3A\u4E3B\uFF0C\u770B\u914D\u7F6E\uFF0C\u4E5F\u770B\u5B83\u9002\u5408\u600E\u6837\u7684\u4F60\u3002")}</p></div><span className="section-side-note"><span className="year-chip">{t("2026 \u7403\u978B\u6863\u6848")}</span>{shoes.length}{t("\u6B3E\u7CBE\u9009")}</span></Reveal>
  <ShoeShelf shoes={shoes} left={left} right={right} onChoose={choose}/>
  <ComparePanel a={a} b={b} shoes={shoes} dimensions={dimensions} onChoose={choose} onExplore={explore}/>
  <section className="tech-lab" id="tech-lab" ref={techHost}><div className="tech-intro"><div><p className="eyebrow">02 / INSIDE THE SNEAKER</p><h2>{t("\u597D\u811A\u611F\uFF0C")}<span>{t("\u6709\u8FF9\u53EF\u5FAA\u3002")}</span></h2><p>{t("\u6C14\u57AB\u5728\u54EA\uFF0C\u6CE1\u68C9\u600E\u4E48\u53E0\uFF0C\u652F\u6491\u4ECE\u54EA\u91CC\u53D1\u529B\u3002")}</p></div><span className="tech-label"><Move3D size={15} />{t("\u4E2D\u5E95\u914D\u7F6E \xB7 3D \u91CD\u5EFA")}</span></div>
   <div className="tech-toolbar"><div className="segmented" aria-label={t("\u9009\u62E9\u79D1\u6280\u5C55\u793A\u7403\u978B")}>{[['left', a], ['right', b]].map(([side, s]) => <button key={side} className={active === side ? 'on' : ''} onClick={() => {
              setActive(side);
              setFocus(null);
            }} aria-pressed={active === side}>{s.short}</button>)}</div><div className="explode-control"><button onClick={() => {
              setExplode(explode ? 0 : 100);
              setFocus(null);
            }}><Layers3 size={15} />{explode ? t("\u6536\u62E2\u7ED3\u6784") : t("\u5C55\u5F00\u7ED3\u6784")}</button><label className="sr-only" htmlFor="explode">{t("\u5206\u89E3\u7A0B\u5EA6")}</label><input id="explode" type="range" min="0" max="100" value={explode} onChange={e => setExplode(Number(e.target.value))} /><output>{explode}%</output><button className="icon-button" onClick={() => {
              setFocus(null);
              setReset(x => x + 1);
            }} aria-label={t("\u91CD\u7F6E\u4E09\u7EF4\u89C6\u89D2")}><RotateCcw size={17} /></button></div></div>
   <p className="structure-summary">{current.structureSummary}</p><div className="tech-workbench"><div className="tech-model-column"><div className="tech-visual"><span className="schematic-caption">{current.short.toUpperCase()}<small>MIDSOLE CONFIGURATION</small></span>{showTech?<Suspense fallback={<div className="tech-scene" />}><TechView shoe={current} explode={explode} focus={focus} reset={reset} /></Suspense>:<div className="tech-scene"/>}<span className="scene-hint">{lang==="en"?"Scroll to read · Explore to rotate":"滚动浏览页面 · 点击操作模型"}</span></div><PositionMap layer={selectedLayer} /><p className="model-component-note">{t("\u70B9\u9009\u90E8\u4EF6\uFF0C\u67E5\u770B\u5206\u5E03\u4E0E\u5B98\u65B9\u4F9D\u636E\u3002\u672A\u516C\u5F00\u5177\u4F53\u4F4D\u7F6E\u7684\u90E8\u4EF6\u53EA\u4FDD\u7559\u8BF4\u660E\u3002")}</p></div><div className="tech-inspector"><div className="tech-layers">{current.layers.map((l, i) => <button key={l.id} className={focus === l.id ? 'on' : ''} onClick={() => {
                setFocus(focus === l.id ? null : l.id);
                setExplode(100);
              }} aria-pressed={focus === l.id}><span className="layer-index">{String(i + 1).padStart(2, '0')}</span><span><strong>{l.title}</strong><small>{l.location}</small></span><i style={{
                  background: l.color
                }} /></button>)}</div><LayerDetails layer={selectedLayer} /></div></div><OfficialFigures shoe={current} />
   <div className="schematic-note"><Info size={13} /><p>{current.structureAccuracy}</p></div>
  </section>
  <Reveal className="section-intro profile-intro" id="player-profile"><div><p className="eyebrow">03 / MADE FOR YOUR GAME</p><h2>{t("\u7403\u978B\u7684\u7B54\u6848\uFF0C")}<span>{t("\u85CF\u5728\u4F60\u7684\u6253\u6CD5\u91CC\u3002")}</span></h2><p>{t("\u544A\u8BC9\u6211\u4F60\u7684\u7403\u573A\u4E60\u60EF\uFF0C\u8BA9\u9009\u62E9\u66F4\u6709\u65B9\u5411\u3002")}</p></div></Reveal>
  <div className="fit-grid"><ProfileForm profile={profile} onChange={setProfile} onGenerate={generate} dirty={dirty} error={error} saved={saved}/>
   <AdvisorResult dirty={dirty} onUpdate={generate} profile={applied} a={a} b={b} revision={revision} onChoose={(side, id) => {
          choose(side, id);
          document.getElementById("comparison")?.scrollIntoView({
            behavior: reduce ? "instant" : "smooth",
            block: "start"
          });
        }} /></div>
  <BroAdvisor pool={shoes} profile={applied} onChoose={(side,id)=>{choose(side,id);document.getElementById("comparison")?.scrollIntoView({behavior:reduce?"instant":"smooth",block:"start"});}} />
  <Community shoes={shoes}/><FeedbackContact/>
  <footer className="site-footer"><div><a className="court-logo" href="#home"><span>C</span> COURTSIDE</a><p>{t("\u597D\u7403\u978B\uFF0C\u4ECE\u61C2\u4F60\u5F00\u59CB\u3002")}</p></div><p>{t("\u7403\u978B\u53C2\u6570\u9644\u539F\u59CB\u6765\u6E90 \xB7 \u56FE\u7247\u7248\u6743\u5F52\u5404\u54C1\u724C\u53CA\u539F\u6743\u5229\u4EBA \xB7 \u6253\u6CD5\u53C2\u8003 NBA")}<br />{t("\u9002\u914D\u5EFA\u8BAE\u7528\u4E8E\u9009\u978B\u521D\u7B5B\uFF0C\u8BF7\u7ED3\u5408\u811A\u578B\u3001\u5C3A\u7801\u4E0E\u8BD5\u7A7F\u611F\u53D7\u3002")}<span>{t("\u8D44\u6599\u6838\u9A8C\uFF1A2026.10 \xB7 2026 \u65B0\u6B3E\u4E0E\u8D5B\u5B63\u6863\u6848")}</span></p><button className="back-top" onClick={() => document.getElementById('home').scrollIntoView({
          behavior: reduce ? 'instant' : 'smooth'
        })}><ArrowUp size={16} />{t("\u56DE\u5230\u5C01\u9762")}</button></footer>
 </main>{toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}</>;
}
