import { criteria, defaultProfile, dimensions } from './data.js';
import { rankShoes, playerTemplate, recommendationReasons } from './advisor.js';

const aliases={
 'wade-wow-12':['wow12','韦德之道12','韦德12','wade12'],
 'nike-kobe6':['kobe6','科比6'], 'nike-sabrina4':['sabrina4','萨布丽娜4','萨布里娜4'],
 'nike-ja4':['ja4','莫兰特4'], 'nike-book2':['book2','布克2'],
 'lining-gamma-2':['gamma2','伽马2'], 'nike-kd19':['kd19','杜兰特19'],
 'air-jordan-41':['airjordan41','jordan41','aj41','乔丹41'],
 'anta-kai-3':['kai3','欧文3'], 'wade-808-6-ultra':['8086','8086ultra'],
 'adidas-harden-vol-10':['hardenvol.10','harden10','哈登10'],
 'jordan-luka5':['luka5','东契奇5','卢卡5'], 'nike-lebron23':['lebron23','勒布朗23','詹姆斯23'], 'nike-freak8':['freak8','字母哥8','giannis8'],
 'nike-gt-cut1':['gtcut1','g.t.cut1','gtcut一代'],
 'puma-mb06':['mb.06','mb06','mb6','三球','拉梅洛','lamelo'],
 'adidas-ae2':['ae2','anthonyedwards2','爱德华兹','华子','安东尼爱德华兹']
};
const compact=s=>s.toLowerCase().replace(/[\s·_-]/g,'');
const matches=(question,shoe)=>[shoe.name,shoe.short,...(aliases[shoe.id]||[])].some(a=>{
 const q=compact(question),alias=compact(a);let start=q.indexOf(alias);
 while(start>=0){if(!/\d/.test(q[start+alias.length]||''))return true;start=q.indexOf(alias,start+1);}return false;
});
const topicDefs=[
 {key:'weight',pattern:/重量|多重|克数|轻重|哪个轻|更轻|weight|grams?|lighter|lightest/i},
 {key:'price',pattern:/多少钱|价格|预算|price|cost|budget/i},
 {key:'size',pattern:/尺码|脚型|足弓|埃及脚|希腊脚|罗马脚|宽脚|宽足|脚宽|脚.*宽|前掌.*宽|码数|偏码|size|toe.shape|arch|wide\s*(feet|foot)|fit\s*width/i},
 {key:'carbon',pattern:/碳板|碳纤|carbon/i},
 {key:'air',pattern:/气垫|zoom|air\s*unit/i},
 {key:'traction',pattern:/抓地|耐磨|外底|橡胶|traction|outsole|rubber|durability/i},
 {key:'support',pattern:/支撑|抗扭|稳定|support|stability|torsion/i},
 {key:'cushion',pattern:/缓震|泡棉|中底|cushion|foam|midsole/i}
];
const playerReferenceQuestion=question=>/打球像谁|(?:我|打法|风格|打球).{0,18}(?:像|类似|接近|相似).{0,10}(?:谁|球星|球员)|(?:哪[个位]|什么).{0,6}(?:球星|球员).{0,8}(?:像我|类似我|适合我)|(?:球星|球员|nba|打法).{0,8}(?:模板|风格参考)|\bwho\b.{0,20}\b(?:play|playing)\b.{0,10}\blike\b|\b(?:style|game|playstyle)\b.{0,30}\b(?:similar|like|resembles?)\b.{0,20}\b(?:player|nba|who)\b|\b(?:which|what)\b.{0,12}\b(?:nba\s*)?player\b.{0,25}\b(?:similar|like|template|reference|style)\b|\b(?:nba|player)\b.{0,8}\b(?:template|style reference)\b/i.test(question);
const playerDescriptions={
 kyrie:'Your profile emphasizes changes of direction and creating space. Look at stopping traction, lateral containment and court feel.',
 curry:'Your profile emphasizes moving into shots and playing off the ball. Look at traction, forefoot response and lightweight feel.',
 durant:'Your profile emphasizes shooting from different areas. Look at landing cushioning, take-off response and midfoot support.',
 lebron:'Your profile emphasizes switching between attack, passing and defense. Look at support, lateral stability and impact cushioning.',
 giannis:'Your profile emphasizes attacking the basket and finishing through contact. Look at torsional support, lateral stability and landing protection.',
 jokic:'Your profile emphasizes post play and creating chances for teammates. Look at a stable base, cushioning and sustained comfort.',
 luka:'Your profile emphasizes controlling the pace and creating shots or passes. Look at stopping control, support and rearfoot cushioning.',
 harden:'Your profile emphasizes on-ball scoring and creating space for shots. Look at stopping control, lateral stability and landing cushioning.',
 shai:'Pace changes, controlled drives and pull-up shots are the movement reference. Check stopping grip, forefoot lockdown and comfort.',
 edwards:'On-ball drives and perimeter shooting are the movement reference. Check lateral containment, landing comfort and heel lockdown.',
 kawhi:'Wing defense, midrange shots and post footwork are the movement reference. Check lateral stability and containment.',
 klay:'Off-ball screen navigation and catch-and-shoot stops are the movement reference. Check grip and in-shoe movement.',
 davis:'Rebounding, interior defense and mobile finishing are the movement reference. Check stability and repeated-landing comfort.',
 rodman:'Boxing out and repeated rebound efforts are the movement reference. Check lateral stability and heel lockdown.',
 brunson:'On-ball contact and pace-changing footwork are the movement reference. Check braking grip and lateral containment.'
};
export function profileFromQuestion(question,base=defaultProfile){
 const p={...defaultProfile,...base};delete p.budget;
 const weight=question.match(/(\d{2,3}(?:\.\d+)?)\s*(?:kg|公斤|千克|(?:千)?克)/i);
 if(weight){const w=Number(weight[1]);if(w>=45&&w<=120)p.weight=w;else return {profile:p,error:'weight'};}
 if(/水泥|cement|concrete/i.test(question))p.court='outdoor';
 else if(/塑胶|rubber\s*court/i.test(question))p.court='rubber';
 else if(/室外|outdoor/i.test(question))p.court='outdoor';
 else if(/木地板|室内|indoor|hardwood/i.test(question))p.court='indoor';
 if(/锋卫摇摆|swingman/i.test(question))p.style='wing';
 else if(/篮板狂魔|rebound/i.test(question))p.style='rebound';
 else if(/小钢炮|bulldog|power.guard/i.test(question))p.style='bulldog';
 else if(/无球|off.ball/i.test(question))p.style='offball';
 else if(/低位|post.play|post.technician/i.test(question))p.style='post';
 else if(/突破|变向|crossover|cutting|drive|quick/i.test(question))p.style='quick';
 else if(/跳投|投射|起跳|shoot|jump/i.test(question))p.style='jump';
 else if(/力量|对抗|power|contact/i.test(question))p.style='power';
 else if(/全能|攻防|all.round/i.test(question))p.style='all';
 const role=question.match(/\b(PG|SG|SF|PF|C)\b/i);
 if(role)p.position=role[1].toUpperCase();
 else if(/控球后卫/.test(question))p.position='PG';
 else if(/得分后卫/.test(question))p.position='SG';
 else if(/小前锋/.test(question))p.position='SF';
 else if(/大前锋/.test(question))p.position='PF';
 else if(/中锋|center/.test(question))p.position='C';
 const height=question.match(/(\d{2,3}(?:\.\d+)?)\s*(?:cm|厘米|公分)/i);
 if(height){const h=Number(height[1]);if(h>=130&&h<=230)p.height=h;else return {profile:p,error:'height'};}
 if(/埃及脚|egyptian/i.test(question))p.footShape='egyptian';else if(/希腊脚|greek/i.test(question))p.footShape='greek';else if(/罗马脚|roman/i.test(question))p.footShape='roman';
 if(/低足弓|low\s*arch/i.test(question))p.arch='low';else if(/高足弓|high\s*arch/i.test(question))p.arch='high';else if(/常规足弓|normal\s*arch|regular\s*arch/i.test(question))p.arch='normal';
 if(/宽脚|脚.*宽|前掌.*宽|wide\s*(feet|foot)/i.test(question))p.width='wide';
 if(/缓震优先|cushioning.first/i.test(question))p.feel='cushion';
 else if(/贴地|court.feel/i.test(question))p.feel='court';
 return {profile:p};
}

// Pure archive resolver; a future model adapter can reuse this response contract.
export function answerArchive({question,pool,profile=defaultProfile,context=[],lang='zh'}){
 const en=lang==='en',say=(zh,english)=>en?english:zh;
 const explicit=pool.filter(s=>matches(question,s));
 const mentionsModel=/(?:kobe|科比|kd|杜兰特|sabrina|ja|book|布克|韦德|wow|gamma|伽马|harden|哈登|jordan|aj|欧文|anta|安踏|gt\s*cut|luka|卢卡|东契奇|lebron|詹姆斯|勒布朗|freak|字母哥|mb|ae|X)[\s._-]*\d+/i.test(question);
 const topic=topicDefs.find(t=>t.pattern.test(question))?.key;
 const playerQuestion=playerReferenceQuestion(question);
 const courtQuestion=/水泥|室外|室内|木地板|塑胶|concrete|outdoor|indoor|hardwood|rubber\s*court/i.test(question);
 const generalSpecs=/配置|科技|介绍|怎么样|什么特点|technology|specs?|configuration|features|tell me about|what.{0,15}like/i.test(question);
 const modelOnly=explicit.some(s=>[s.name,s.short,...(aliases[s.id]||[])].some(alias=>compact(question.replace(/[?？!！。.,，]/g,''))===compact(alias)));
 const inheritShoeContext=topic||courtQuestion||generalSpecs||/推荐|适合|recommend|suit/i.test(question);
 const selected=playerQuestion?[]:explicit.length?explicit:mentionsModel||!inheritShoeContext?[]:context.map(id=>pool.find(s=>s.id===id)).filter(Boolean);
 const parsed=profileFromQuestion(question,profile),p=parsed.profile;
 const sources=[],paragraphs=[];
 const addSource=(title,url)=>{if(url&&!sources.some(s=>s.url===url))sources.push({title,url});};
 const result=()=>({paragraphs,sources,context:selected.map(s=>s.id),shoeIds:selected.map(s=>s.id),profile:p});
 if(/^(你好|哈喽|嗨|在吗|hello|hey|hi|yo)[!！,.，。\s]*$/i.test(question.trim())){paragraphs.push(say('在呢，bro！我是 X-dragon。今天想看哪双鞋？或者说说你多重、打什么场地，我帮你挑几双一起看看。','Right here, bro! I’m X-dragon. Got a shoe in mind? Or tell me your weight and court—we’ll find a few worth trying.'));return result();}
 if(parsed.error){paragraphs.push(parsed.error==='height'?say('bro，身高可以填 130–230 cm，也可以留空。先确认一下单位，咱们再继续选。','bro, height can be 130–230 cm, or left blank. Check the unit and we can continue.'):say('bro，本站档案的适配范围为 45–120 kg。请在这个范围内填写体重，再一起选鞋。','bro, this archive supports profiles from 45 to 120 kg. Enter a weight in that range and we can narrow down the shoes.'));return result();}
 if(playerQuestion){
  const player=playerTemplate(p);
  paragraphs.push(say(`bro，按你现在的球场档案，我会用 ${player.name} 作为打法参考。`,`bro, based on your current player profile, your style reference is ${player.en}.`));
  paragraphs.push(say(player.description,playerDescriptions[player.key]));
  paragraphs.push(say('主要依据你填写的打法和位置，不是看你刚才聊了谁的签名鞋。我没看过你的实战，所以这不是球技或身体能力测评；改好球场档案再来问，模板也会跟着变。','This comes from your playing style and position, not the signature shoe we just discussed. I haven’t seen you play, so it isn’t a rating of skill or physique. Update your player profile to explore a different reference.'));
  addSource(say('NBA 打法参考','NBA play-style source'),player.source);
  return result();
 }
 const recommend=/推荐|选一双|帮我选|挑一双|适合我|适配|适合.*位置|打什么位置|打法|球星|模板|锋卫摇摆|篮板狂魔|小钢炮|无球跑位|低位技术|nba|recommend|suit|position|playing\s*style|swingman|rebounder|power.guard|post.technician|pick|which\s*shoe/i.test(question)||(!selected.length&&/kg|公斤|千克|\d\s*cm|身高|水泥|木地板|indoor|outdoor|concrete/i.test(question));
 if(selected.length&&courtQuestion&&!/推荐|帮我选|选一双|recommend|which\s*shoe/i.test(question)){
  paragraphs.push(say(`bro，${selected.map(s=>s.short).join(' / ')} ${p.court==='outdoor'?'先别急着当外场鞋，咱们核对已知限制。':'可以按你说的场地进一步比较。'}`,`bro, ${selected.map(s=>s.short).join(' / ')} ${p.court==='outdoor'?'needs its known limitations checked before an outdoor trial.':'can be considered for the court you mentioned.'}`));
  selected.forEach(s=>{const reasons=recommendationReasons(s,p,lang);paragraphs.push(reasons.surface,...reasons.evidence.notes);reasons.evidence.sources.forEach(source=>addSource(source.title,source.url));const outsole=s.layers.find(l=>l.type==='outsole');if(outsole){paragraphs.push(`${outsole.title}: ${outsole.function}`);addSource(`${s.short} · ${outsole.title}`,outsole.source);}paragraphs.push(s.caution);addSource(s.short,s.releaseSource);});
  return result();
 }
 if(topic==='price'&&!recommend){
  paragraphs.push(say('bro，本站不按价格推荐，也没有核实实时售价。咱们先看配置、场地和合脚程度；需要查价格可以看下面的品牌页面。','bro, recommendations do not use price, and live prices are unverified. We focus on configuration, court and fit; check the brand pages below if you need a price.'));
  (selected.length?selected:pool.slice(0,3)).forEach(s=>addSource(s.name,s.releaseSource));return result();
 }
 if(topic==='size'&&!recommend){
  paragraphs.push(say('bro，档案的楦型实测还没覆盖所有鞋款，不保证宽脚都适合。先按品牌尺码表选参考尺码，再穿比赛袜试穿：确认脚趾留有空间、变向不滑动、足弓与前掌不受挤压。不能仅按球场位置判断尺码。','bro, verified width and sizing tests do not cover every model, so wide-foot fit is not guaranteed. Start with the brand size chart, then try the shoe with game socks: check toe room, lateral containment and pressure around your arch and forefoot. A playing position does not determine shoe size.'));
  const shapeNotes=recommendationReasons(selected[0]||pool[0],p,lang).constraints;paragraphs.push(...shapeNotes);
  selected.forEach(s=>{const ev=recommendationReasons(s,p,lang).evidence;paragraphs.push(...ev.notes);ev.sources.forEach(source=>addSource(source.title,source.url));addSource(s.name,s.releaseSource);});return result();
 }
 if(topic==='weight'&&selected.length){
  paragraphs.push(say('bro，重量只引用注明尺码与来源的品牌约值或独立称重，轻量评分不当作克数。','bro, these are attributed brand estimates or independent measurements with stated sizes. The lightweight score is not a measured weight.'));
  selected.forEach(s=>{paragraphs.push(s.weight?`${s.name}: ${say('约','about ')}${s.weight.grams} g · ${s.weight.label}`:say(`${s.name}：暂无已核实的同尺码重量。`,`${s.name}: no verified same-size weight in the archive.`));addSource(s.name,s.weight?.source||s.releaseSource);});
  if(selected.length===2){if(selected.every(s=>s.weight)&&selected[0].weight.label===selected[1].weight.label){const diff=Math.abs(selected[0].weight.grams-selected[1].weight.grams),light=selected[0].weight.grams<=selected[1].weight.grams?selected[0]:selected[1];paragraphs.push(say(`${light.short} 的已记录重量低 ${diff} g。配色、尺码和称重差异会影响结果，微小差值不宜当作决定性优势。`,`${light.short} has a reported weight ${diff} g lower. Colorway, size and measurement variation matter; a small difference is not a decisive advantage.`));}else paragraphs.push(say('尺码或称重口径不同，不能直接判断哪双更轻；暂不按这些克数做跨款排序。','Sizes or measurement conventions differ, so these figures cannot establish which shoe is lighter or rank models by mass.'));}
  return result();
 }
 if(recommend){
  const followSpecific=/它|这双|这款|\bits?\b|this shoe|that shoe/i.test(question);
  const wantsAlternatives=/其他|别的|another|other|else|alternative/i.test(question);
  const scope=explicit.length?explicit:followSpecific&&!wantsAlternatives&&selected.length?selected:pool;
  const ranked=rankShoes(p,scope,criteria(p)),main=ranked[0].shoe;
  const player=playerTemplate(p);
  const reasons=recommendationReasons(main,p,lang);
  if(reasons.evidence.surfacePending&&!reasons.evidence.conflicts.length)paragraphs.push(say('bro，这里还没有足够的同版本外场证据，不能把下面这双说成已经适合你的场地。咱们先把它当配置核对候选。','bro, same-version outdoor evidence is insufficient. Treat this as a configuration candidate, not a confirmed court match.'));
  paragraphs.push(say(reasons.evidence.conflicts.length?'bro，这双与你的需求有已知冲突，不把它当优先候选。先看看下面的限制。':`bro，按${p.height>0?` ${p.height} cm、`:''} ${p.weight} kg 的当前档案，可以先核对 ${main.name} 的配置与试穿条件。`,reasons.evidence.conflicts.length?'bro, this shoe has known conflicts with your needs, so it is not a priority candidate. Check these limitations first.':`bro, for your ${p.height>0?`${p.height} cm, `:''}${p.weight} kg profile, consider checking ${main.name} and its fit conditions.`));
  paragraphs.push(`${reasons.movement} ${reasons.position}`);
  paragraphs.push(reasons.surface,...reasons.evidence.notes);reasons.evidence.sources.forEach(source=>addSource(source.title,source.url));
  paragraphs.push(...reasons.constraints);
  const priorities=criteria(p).map((w,i)=>({w,i})).sort((a,b)=>b.w-a.w).slice(0,3).map(x=>say(dimensions[x.i],['cushioning','traction','support','durability','lightweight feel'][x.i]));
  paragraphs.push(say(`重点看：${priorities.join('、')}。NBA 打法参考为 ${player.name}；这是打法风格参照，不是身体能力评估。`,`Prioritize ${priorities.join(', ')}. Your NBA style reference is ${player.en}; this is a style analogy, not an assessment of athletic ability.`));
  if(ranked.length>1)paragraphs.push(say(`也可以比较：${ranked.slice(1,3).map(x=>x.shoe.name).join('、')}。先避开已知冲突，再按配置偏好初筛；资料不足的仍需实穿验证，不是适配概率。`,`Also compare ${ranked.slice(1,3).map(x=>x.shoe.name).join(' and ')}. Known conflicts come before configuration preferences; unverified candidates need wear testing, and ranks are not fit probabilities.`));
  ranked.slice(0,3).forEach(x=>addSource(x.shoe.name,x.shoe.releaseSource));
  return {...result(),context:[main.id],shoeIds:ranked.slice(0,3).map(x=>x.shoe.id)};
 }
 if(selected.length&&(topic||generalSpecs||modelOnly)){
  paragraphs.push(say(selected.length===1?`bro，${selected[0].short} 这块我帮你捋一下。`:'bro，这两双咱们分开看，配置区别就清楚了。',selected.length===1?`bro, let’s break down the ${selected[0].short}.`:'bro, let’s take these one at a time and see where they differ.'));
  const filters={carbon:l=>l.type==='carbon'||/carbon|碳/i.test(l.title),air:l=>l.type==='air'||/zoom|气垫/i.test(l.title),traction:l=>l.type==='outsole',support:l=>['carbon','plate','frame'].includes(l.type),cushion:l=>['insole','foam','carrier','air'].includes(l.type)};
  selected.forEach(s=>{
   paragraphs.push(`${s.name} — ${s.subtitle}`);
   const layers=topic&&filters[topic]?s.layers.filter(filters[topic]):s.layers.filter(l=>l.type!=='upper');
   if(topic&&filters[topic]&&!layers.length){
    paragraphs.push(say(`档案未确认这款的${{carbon:'碳纤维板',air:'气垫',support:'独立支撑件',traction:'外底细节',cushion:'缓震层'}[topic]}配置；没有资料不能推断为“有”或“没有”。`,`The archive does not confirm this shoe's ${topic} details. Missing documentation does not prove that a component is present or absent.`));
    if(topic==='carbon')s.specs.filter(spec=>/支撑|结构|support|structure/i.test(spec.label)).forEach(spec=>{paragraphs.push(`${spec.label}: ${spec.value}`);addSource(s.short,spec.source);});
   }
   layers.slice(0,topic?4:3).forEach(l=>{paragraphs.push(en?`${l.title}: ${l.location}. ${l.relationship}. It helps with ${l.function.toLowerCase()}. Not disclosed: ${l.unknown}`:`${l.title}在${l.location}。${l.relationship}，主要负责${l.function}。有一点别搞混：${l.unknown}。`);addSource(`${s.short} · ${l.title}`,l.source);});
   if(!topic)paragraphs.push(s.roleReason);
   addSource(s.short,s.releaseSource);
  });
  return result();
 }
 paragraphs.push(say(mentionsModel&&!explicit.length?'bro，这双我还没收进档案，暂时没有可靠资料，先不瞎说。换一双鞋名，或者聊聊你打球的习惯？':`bro，这个问题我还不能可靠回答，先不拿上一双鞋的配置硬凑。咱们可以聊 ${pool.length} 双鞋的配置、选鞋建议或你的 NBA 打法模板；你想看哪一项？`,`bro, ${mentionsModel&&!explicit.length?'I don’t have verified details for that shoe yet. Try another model, or tell me how you play.':`I can’t reliably answer that yet, and the last shoe’s specs wouldn’t answer your question. We can explore ${pool.length} shoe profiles, shoe recommendations or your NBA play-style reference. Which would help?`}`));
 return {...result(),context:[],shoeIds:[]};
}
