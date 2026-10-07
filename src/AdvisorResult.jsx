import { useLocale } from "./Locale";
import { useMemo } from 'react';
import {motion} from 'motion/react';
import {useSiteMotion as useReducedMotion} from './MotionPreferences';
import playerPhotos from './playerPhotos.json';
import { Check, ArrowUpRight, ExternalLink, Sparkles, Info } from 'lucide-react';
import { shoes as rawShoes, criteria, analysisFor, styleLabels as rawStyleLabels, courtLabels as rawCourtLabels } from './data';
import { rankShoes, playerTemplate, marketPicks, recommendationReasons } from './advisor';
const emphasis = /((?:双层|全掌|前掌|后掌)?\s*(?:超䨻|SUPER BOOM|Cushlon 3\.0|ReactX|Zoom Air|Air Zoom|碳纤维板|纵向支撑|双层缓震|抗扭支撑|侧向稳定|落地缓震|缓震承载|急停抓地|轻量脚感|耐磨橡胶|TPU 侧墙))/gi;
export function KeyCopy({
  text
}) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  const pattern=lang==='en'?/(dual-layer cushioning|longitudinal support|torsional support|lateral stability|landing cushioning|cushioning capacity|stopping traction|lightweight feel|durable rubber|TPU sidewalls|SUPER BOOM|Cushlon 3\.0|ReactX|Zoom Air|Air Zoom)/gi:emphasis;
  return <>{t(text).split(pattern).map((part, i) => i % 2 ? <strong key={i}>{part}</strong> : part)}</>;
}
export function PlayerCard({
  profile
}) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  const player = localize(playerTemplate(profile));
  const photo = playerPhotos.find(p => p.key === player.key);
  return <section className="player-template" aria-label={t('NBA 打法模板')}>
   <div className="player-template-copy"><span className="eyebrow">YOUR GAME DNA · 15</span><p className="template-title">{t('你的 NBA 打法模板')}</p><h3>{player.name}</h3><span className="player-en">{player.en}</span><div className="template-tags">{player.tags.map(tag=><span key={tag}>{tag}</span>)}</div><p className="template-description"><KeyCopy text={player.description}/></p><a href={player.source} target="_blank" rel="noreferrer">{t('NBA 打法参考')}<ExternalLink size={11}/></a></div>
   <div className="player-photo" style={{'--player-position':photo.position}}><img key={player.key} src={photo.file} alt={player.en+' · '+photo.year} loading="lazy"/><div className="player-photo-credit"><a href={photo.page} target="_blank" rel="noreferrer">{photo.credit} · {photo.year}</a><br/><a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a> · <span>{t('裁切、调色')}</span></div></div>
   <p className="template-note">{t('按你的打法与位置选择的风格参照；不代表能力、身体条件或相似度测评。')}</p>
  </section>;
}
export default function AdvisorResult({
  profile,
  a,
  b,
  revision,
  onChoose,
  dirty,
  onUpdate
}) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  const [shoes,styleLabels,courtLabels]=useMemo(()=>localize([rawShoes,rawStyleLabels,rawCourtLabels]),[lang]);
  const reduce=useReducedMotion(),say=(zh,en)=>lang==='en'?en:zh;
  const ranked = rankShoes(profile, shoes, criteria(profile)),
    pick = ranked[0],
    main = pick.shoe,
    pair = analysisFor(a, b, profile, lang),
    result = analysisFor(main, main, profile, lang);
  const reasons=recommendationReasons(main,profile,lang);
  const extra = localize(marketPicks).filter(p => p.styles.includes(profile.style) || profile.court === 'outdoor');
  return <div className="advisor-results" id="your-match" aria-live="polite" key={revision}>
  {dirty&&<div className="result-pending" role="status"><div><strong>{say('档案变了，先更新这份建议','Your profile changed. Update these picks.')}</strong><span>{say('下方仍是上次生成的结果。','The results below still use your previous profile.')}</span></div><button onClick={onUpdate}>{say('更新建议','Update picks')}<ArrowUpRight size={14}/></button></div>}
  <motion.section className="recommendation main-pick" initial={reduce?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.5,ease:[.22,1,.36,1]}}><div className="recommend-top"><span className="eyebrow"><Sparkles size={15} /> YOUR PERSONAL PICK</span><span className="result-profile">{profile.height>0&&`${profile.height} cm · `}{profile.weight} kg · {styleLabels[profile.style]} · {courtLabels[profile.court]}</span></div>
   <div className="recommend-hero"><div><p className="pick-lead">{reasons.evidence.surfacePending?say('场地适配待核实 · 从','Court suitability unverified · from'):say('配置候选 · 从','Configuration candidate · from')}{shoes.length}{t("\u6B3E\u7403\u978B\u6863\u6848\u4E2D\u7B5B\u9009")}</p><h3>{main.short}</h3><span>{main.brand} · {main.subtitle}</span></div><img src={main.photos[main.coverIndex || 0]} alt={main.name} loading="lazy" /></div>
   <div className="priorities">{result.priorities.map(p => <span key={p}><Check size={12} /><strong>{t(p)}{' '}{t("\u4F18\u5148")}</strong></span>)}</div>
   <p className="evidence-level">{reasons.evidence.level} · {say('试穿候选，不是合脚保证','Trial candidate, not a fit guarantee')}</p>
   <div className="pick-reason"><span>{t('为什么推荐给你')}</span><p><KeyCopy text={reasons.movement}/></p><p><KeyCopy text={reasons.position}/></p></div>
   <div className="pick-tradeoff"><span>{say('先知道这个取舍','Know this tradeoff first')}</span><p>{reasons.surface}</p></div>
   {reasons.constraints.length>0&&<div className="preference-notes">{reasons.constraints.map(note=><p key={note}><Info size={14}/>{note}</p>)}</div>}
   <details className="recommend-evidence"><summary>{say('推荐依据与已知限制','Evidence and known limits')}<span>+</span></summary><strong>{reasons.evidence.level}</strong>{reasons.evidence.notes.map(note=><p key={note}>{note}</p>)}<p>{say('先避开已知场地、楦型与重量冲突，再按配置与动作偏好初筛；体重分段和打法权重属于编辑规则，未验证为大众适配率。身高、趾形和足弓不被当成鞋款性能加分。','Known court, width and weight conflicts are checked before configuration and movement preferences. Weight bands and style weights are editorial rules, not validated population fit rates. Height, toe shape and arch do not add performance points.')}</p><p>{say('目前没有代表大众球员的调查样本；个体穿着反馈用于发现取舍，不自动变成推荐分数。不同尺码、版本、配色和场地的结果不能直接互换。','No representative player survey is available. Individual wear reports reveal tradeoffs and do not automatically become ranking scores. Sizes, versions, colorways and courts are not interchangeable.')}</p>{reasons.evidence.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</details>
   <details className="recommend-config"><summary>{say('配置依据与体重影响','Configuration and weight context')}<span>+</span></summary><p><KeyCopy text={main.advice}/></p><p>{t(result.weightNote)}</p><a href={main.releaseSource} target="_blank" rel="noreferrer">{t('官方配置')} ↗</a></details>
   <div className="pair-evidence-notes">{[a,b].flatMap(shoe=>recommendationReasons(shoe,profile,lang).evidence.conflicts.map(note=><p key={shoe.id+note}><Info size={14}/>{shoe.short} · {note}</p>))}</div><div className="current-battle"><p>{pair.close?say('这两双配置指数接近，适配需试穿','These configuration indices are close; verify fit in person'):say('当前两双的配置偏好参考','Configuration preference for your current pair')}<small>{say('全库推荐另计入打法与位置；这里仅比较五维配置权重','Full-catalog ranking also considers style and position; these indices use the five weighted references')}</small></p><div className="fit-bars">{[[a, pair.scoreA, 'A'], [b, pair.scoreB, 'B']].map(([s, score, letter]) => <div key={s.id}><div><span><b>{letter}</b> {s.short}</span><strong>{score}<small> / 100</small></strong></div><div className="fit-track"><i style={{
                width: score + '%',
                background: letter === 'A' ? '#508bff' : '#39cce7'
              }} /></div></div>)}</div></div>
   <p className="index-note">{say('编辑参考，未经统一实测；1–2 分的差距不能解释成性能优势。','Editorial references without standardized testing; a 1–2 point gap does not establish a performance advantage.')}</p><p className="fit-caution"><Info size={14} />{main.caution}</p><button className="pick-compare" onClick={() => onChoose('left', main.id)}>{t('把主推款加入 Battle')}<ArrowUpRight size={14} /></button>
  </motion.section>
  <section className="other-picks"><div className="alternatives-heading"><span className="eyebrow">ALSO IN YOUR ROTATION</span><h3>{t("\u4F60\u7684\u5176\u4ED6\u8BD5\u7A7F\u9009\u62E9")}</h3><p>{t("\u4ECE\u5DF2\u6838\u5B9E\u6863\u6848\u4E2D\uFF0C\u518D\u7ED9\u4F60\u4E09\u79CD\u9009\u62E9\u3002")}</p></div><div className="alternative-list">{ranked.slice(1, 4).map(({
          shoe,
          score
        }, i) => <article key={shoe.id}><span className="alternative-number">0{i + 2}</span><div><div className="alternative-title"><h4>{shoe.name}</h4><span>{say('备选','Alternative')}</span></div><p><KeyCopy text={shoe.subtitle}/></p><p className="alternative-fit">{recommendationReasons(shoe,profile,lang).position}</p><p className="alternative-fit">{recommendationReasons(shoe,profile,lang).surface}</p><div className="alternative-actions"><a href={shoe.releaseSource} target="_blank" rel="noreferrer">{t('官方配置')}<ExternalLink size={11} /></a><button onClick={() => onChoose('right', shoe.id)}>{t('加入 B 对比')}<ArrowUpRight size={13} /></button></div></div></article>)}</div></section>
  <PlayerCard profile={profile} />
  {extra.length > 0 && <section className="market-notes"><h3>{t("\u518D\u628A\u8BD5\u7A7F\u6E05\u5355\uFF0C\u62D3\u5BBD\u4E00\u70B9\u3002")}</h3><p>{t("\u4EE5\u4E0B\u4E3A\u6863\u6848\u4E4B\u5916\u7684\u54C1\u724C\u65B0\u54C1\uFF0C\u6309\u516C\u5F00\u914D\u7F6E\u8865\u5145\u63A8\u8350\uFF0C\u5C1A\u672A\u7EB3\u5165\u8BC4\u5206\u3002")}</p>{extra.map(p => <article key={p.name}><div><span>{p.tag}</span><h4>{p.name}</h4><p><KeyCopy text={p.reason} /></p></div><a href={p.source} target="_blank" rel="noreferrer" aria-label={p.name + t("\u5B98\u65B9\u4FE1\u606F")}><ArrowUpRight size={19} /></a></article>)}</section>}
 </div>;
}
