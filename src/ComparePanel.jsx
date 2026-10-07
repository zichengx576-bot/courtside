import {useLocale} from './Locale';
import {motion} from 'motion/react';
import {useSiteMotion as useReducedMotion} from './MotionPreferences';
import {RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,ResponsiveContainer} from 'recharts';
import {ChevronDown,ArrowUpRight,Layers3,Activity,ExternalLink} from 'lucide-react';
import PhotoViewer from './PhotoViewer';

export default function ComparePanel({a,b,shoes,dimensions,onChoose,onExplore}){
 const {t,lang}=useLocale(),en=lang==='en',say=(zh,english)=>en?english:zh,reduce=useReducedMotion();
 const chart=dimensions.map((name,i)=>({name,a:a.scores[i],b:b.scores[i]}));
 const differences=dimensions.map((name,i)=>({name,delta:a.scores[i]-b.scores[i]})).filter(x=>x.delta).sort((x,y)=>Math.abs(y.delta)-Math.abs(x.delta)).slice(0,2);
 return <section className="compare-experience" aria-label={say('两双球鞋对比','Compare two shoes')}>
  <div className="compare-selection-bar"><span>IN YOUR BATTLE</span><p><b>A</b> {a.short}<i>×</i><b>B</b> {b.short}</p><a href="#player-profile">{say('按我的打法筛选','Find my fit')}<ArrowUpRight size={14}/></a></div>
  <div className="battle-grid"><section className="shoe-pair">{[[a,'left','A'],[b,'right','B']].map(([shoe,side,letter])=><article className="shoe-card compact-shoe-card" key={side} style={{'--accent':side==='left'?'#508bff':'#39cce7'}}>
   <div className="card-eyebrow"><span><b>{letter}</b>{shoe.brand.split(' / ')[0]}</span><span>{shoe.year}</span></div>
   <div className="shoe-select"><label className="sr-only" htmlFor={side+'-shoe'}>{t('选择球鞋')}{letter}</label><select id={side+'-shoe'} value={shoe.id} onChange={e=>onChoose(side,e.target.value)}>{shoes.map(s=><option value={s.id} key={s.id}>{s.short}</option>)}</select><ChevronDown size={18}/></div>
   <motion.div className="compare-product" key={shoe.id} initial={reduce?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.35}}><img src={shoe.photos[shoe.coverIndex||0]} alt={shoe.name} loading="lazy"/></motion.div>
   <p className="shoe-subtitle">{shoe.subtitle}</p><p className="compact-role">{say('建议位置','Suggested roles')} <strong>{shoe.positions.join(' / ')}</strong></p>
   <button className="compare-tech" onClick={()=>onExplore(side)}><Layers3 size={14}/>{t('探索科技')}<ArrowUpRight size={14}/></button>
  </article>)}</section>
  <section className="panel radar-panel"><div className="section-head"><h3><Activity size={17}/>{t('五维配置参考')}</h3><span>01—10</span></div>
   <p className="score-trust">{say('编辑配置参考 · 相近分数优先看试穿差异','Editorial references · Close scores call for a fit comparison')}</p>
   <div className="radar-wrap" role="img" aria-label={dimensions.map((d,i)=>`${d}: ${a.short} ${a.scores[i]}, ${b.short} ${b.scores[i]}`).join('; ')}><ResponsiveContainer width="100%" height="100%"><RadarChart data={chart} outerRadius="72%"><PolarGrid stroke="#2a4366"/><PolarAngleAxis dataKey="name" tick={{fill:'#9fbbdb',fontSize:13}}/><PolarRadiusAxis domain={[0,10]} tick={false} axisLine={false}/><Radar dataKey="a" stroke="#508bff" fill="#508bff" fillOpacity={.13} strokeWidth={2} isAnimationActive={!reduce} animationDuration={650}/><Radar dataKey="b" stroke="#39cce7" fill="#39cce7" fillOpacity={.1} strokeWidth={2} isAnimationActive={!reduce} animationDuration={650}/></RadarChart></ResponsiveContainer></div>
   <div className="chart-legend"><span><i/>A · {a.short}</span><span><i/>B · {b.short}</span></div>
   <div className="battle-differences"><span>{say('先看这两点','Start with these differences')}</span>{differences.length?differences.map(d=><p key={d.name}><strong>{d.delta>0?a.short:b.short}</strong> · {d.name}{say('参考更高',' has a higher reference')}</p>):<p>{say('五维配置参考相同，重点比较楦型、包覆和实际脚感。','The five references are equal; compare shape, containment and feel in person.')}</p>}</div>
   <details className="score-method"><summary>{say('展开评分与计算说明','Scores and methodology')}<span>+</span></summary><table className="score-table"><caption className="sr-only">{t('编辑建议分对比')}</caption><thead><tr><th>{t('配置维度')}</th><th>A</th><th>B</th></tr></thead><tbody>{dimensions.map((d,i)=><tr key={d}><th>{d}</th><td>{a.scores[i]}</td><td>{b.scores[i]}</td></tr>)}</tbody></table><p>{say('1–10 分由公开配置与编辑判断形成，未经统一实测。轻量分不等于克数；这些分数用于初筛，不代表性能差异的实测幅度。','Scores from 1–10 reflect public specifications and editorial judgment, without standardized testing. Lightweight scores are not grams. Differences are screening references, not measured performance margins.')}</p></details>
  </section></div>
  <div className="compare-dossiers">{[[a,'left','A'],[b,'right','B']].map(([shoe,side,letter])=><details className="shoe-dossier" key={side+'-'+shoe.id}><summary><span><b>{letter}</b> {shoe.short}</span>{say('实拍与完整档案','Photos and full profile')}<span className="disclosure-plus">+</span></summary><div className="dossier-body"><PhotoViewer shoe={shoe}/><p className="shoe-colorway">{shoe.colorway}<small>{shoe.styleCode}</small></p><p className="release-note"><a href={shoe.releaseSource} target="_blank" rel="noreferrer">{shoe.releaseNote}<ExternalLink size={11}/></a></p><p>{shoe.roleReason}</p><dl className="spec-list">{shoe.specs.map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.value}<a href={s.source} target="_blank" rel="noreferrer" aria-label={`${shoe.short} ${s.label} ${t('参数来源')}`}><ExternalLink size={12}/></a></dd></div>)}<div><dt>{t('重量')}</dt><dd>{shoe.weight?<><strong>{say('约','About ')}{shoe.weight.grams} g</strong><small>{shoe.weight.label}</small><a href={shoe.weight.source} target="_blank" rel="noreferrer" aria-label={shoe.short+t(' 重量来源')}><ExternalLink size={12}/></a></>:t('暂无已核实的同尺码称重')}</dd></div></dl><p className="fit-caution">{shoe.caution}</p><a href={shoe.imageSource} target="_blank" rel="noreferrer">{t('图片来源')} ↗</a></div></details>)}</div>
 </section>;
}
