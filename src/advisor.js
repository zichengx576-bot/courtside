import {recommendationEvidence} from './recommendationEvidence.js';
export const athletes={
 kyrie:{name:'凯里·欧文',en:'KYRIE IRVING',id:'202681',title:'变向创造者',tags:['控球变向','创造空间','变化终结'],description:'用节奏和变向打开空间，再选择终结路线。选鞋先关注急停抓地、侧向包覆与贴地感。',source:'https://www.nba.com/news/film-study-how-kyrie-irving-fits-with-dallas'},
 curry:{name:'斯蒂芬·库里',en:'STEPHEN CURRY',id:'201939',title:'移动投射手',tags:['无球移动','外线投射','持球组织'],description:'跑动接球与持球投射交替，连续起停是关键。选鞋先关注抓地、前掌反馈和轻量脚感。',source:'https://www.nba.com/news/stephen-curry-driven-do-more-pursue-title'},
 durant:{name:'凯文·杜兰特',en:'KEVIN DURANT',id:'201142',title:'全域得分手',tags:['中距离','外线投射','多区域得分'],description:'通过投射与持球得分解决回合。选鞋先关注落地缓震、起跳反馈与中足支撑。',source:'https://www.nba.com/news/kevin-durant-james-harden-top-10-scoring'},
 lebron:{name:'勒布朗·詹姆斯',en:'LEBRON JAMES',id:'2544',title:'攻防发动机',tags:['转换进攻','推进分球','对抗终结'],description:'在推进、分球和终结之间切换。选鞋先关注缓震承载、侧向稳定与足部包覆。',source:'https://www.nba.com/news/film-study-lakers-transition-lebron-james-anthony-davis'},
 giannis:{name:'扬尼斯·阿德托昆博',en:'GIANNIS ANTETOKOUNMPO',id:'203507',title:'冲筐终结者',tags:['转换冲击','突破攻筐','篮下终结'],description:'把突破和冲击篮下作为进攻主线。选鞋先关注抗扭支撑、侧向稳定和落地保护。',source:'https://www.nba.com/news/film-study-giannis-antetokounmpo-offensive-skills'},
 jokic:{name:'尼古拉·约基奇',en:'NIKOLA JOKIĆ',id:'203999',title:'内线策应者',tags:['低位处理','策应分球','错位进攻'],description:'通过低位处理和策应带动队友。选鞋先关注稳定底盘、缓震承载和长时间穿着舒适度。',source:'https://www.nba.com/nuggets/news/film-study-nuggets-carved-up-heat-defense'},
 luka:{name:'卢卡·东契奇',en:'LUKA DONČIĆ',id:'1629029',title:'节奏组织者',tags:['持球节奏','进攻组织','创造机会'],description:'用持球节奏寻找投篮和分球机会。选鞋先关注急停控制、支撑和后掌落地缓震。',source:'https://www.nba.com/news/film-study-how-kyrie-irving-fits-with-dallas'},
 harden:{name:'詹姆斯·哈登',en:'JAMES HARDEN',id:'201935',title:'后撤步得分手',tags:['后撤步投射','持球得分'],description:'通过持球调整与后撤步创造投射空间。选鞋先关注前后急停、侧向稳定和落地缓震。',source:'https://www.nba.com/watch/video/james-harden-drills-the-step-back-three'},
 shai:{name:'谢伊·吉尔杰斯-亚历山大',en:'SHAI GILGEOUS-ALEXANDER',id:'1628983',title:'节奏切入手',tags:['节奏切入','急停中投','持球处理'],description:'通过变速切入和急停创造出手机会。试穿重点是急停抓地、前掌锁定与连续移动舒适度。',source:'https://www.nba.com/news/finals-film-study-thunder-pacers-game-4'},
 edwards:{name:'安东尼·爱德华兹',en:'ANTHONY EDWARDS',id:'1630162',title:'爆发型侧翼',tags:['持球突破','冲筐终结','外线投射'],description:'在持球突破与外线投射之间切换。试穿重点是横向包覆、落地缓震与后跟锁定。',source:'https://www.nba.com/news/film-study-anthony-edwards-improvement'},
 kawhi:{name:'科怀·伦纳德',en:'KAWHI LEONARD',id:'202695',title:'攻防侧翼',tags:['中距离','侧翼攻防','低位处理'],description:'兼顾侧翼防守、中距离与低位处理。试穿重点是侧向稳定、急停抓地和长时间包覆舒适度。',source:'https://www.nba.com/news/kawhi-leonards-brilliance-helps-clippers-even-first-round-series'},
 klay:{name:'克莱·汤普森',en:'KLAY THOMPSON',id:'202691',title:'无球接投手',tags:['绕掩护','接球投射','无球起停'],description:'通过绕掩护和无球跑动寻找接投空间。试穿重点是连续起停抓地、鞋内不滑动与落地舒适度。',source:'https://www.nba.com/news/film-study-hot-shooting-thompson-gets-free'},
 davis:{name:'安东尼·戴维斯',en:'ANTHONY DAVIS',id:'203076',title:'移动型内线',tags:['篮板保护','移动终结','内线防守'],description:'在篮板、内线防守与移动终结之间切换。试穿重点是稳定底盘、连续落地舒适度与足部锁定。',source:'https://www.nba.com/pelicans/news/hes-able-get-rebounds-other-people-cant-get-anthony-davis-shattered-team-record-26-boards'},
 rodman:{name:'丹尼斯·罗德曼',en:'DENNIS RODMAN',id:'23',title:'篮板与卡位专家',tags:['卡位','篮板判断','二次起跳'],description:'以卡位和连续争抢篮板为动作参照。试穿重点是侧向稳定、后跟锁定与反复落地舒适度。',source:'https://www.nba.com/player/23/dennis-rodman'},
 brunson:{name:'杰伦·布伦森',en:'JALEN BRUNSON',id:'1628973',title:'对抗节奏后卫',tags:['持球对抗','脚步节奏','急停得分'],description:'利用脚步节奏、急停和对抗创造空间。试穿重点是前后制动、侧向包覆与足底舒适度。',source:'https://www.nba.com/news/film-study-jalen-brunson-brings-off-the-dribble-success-to-new-york'}
};
// Editorial movement analogies; position refines the analogy, not the user's ability.
export const templateRules={
 quick:{any:'kyrie',PG:'kyrie',SG:'shai',SF:'edwards',PF:'giannis',C:'davis'},
 all:{any:'lebron',PG:'luka',SG:'shai',SF:'kawhi',PF:'lebron',C:'jokic'},
 power:{any:'giannis',PG:'brunson',SG:'harden',SF:'giannis',PF:'giannis',C:'jokic'},
 jump:{any:'durant',PG:'curry',SG:'durant',SF:'durant',PF:'davis',C:'davis'},
 wing:{any:'lebron',PG:'shai',SG:'edwards',SF:'kawhi',PF:'lebron',C:'davis'},
 rebound:{any:'rodman',PG:'rodman',SG:'rodman',SF:'rodman',PF:'rodman',C:'davis'},
 bulldog:{any:'brunson',PG:'brunson',SG:'edwards',SF:'kawhi',PF:'lebron',C:'jokic'},
 offball:{any:'klay',PG:'curry',SG:'klay',SF:'klay',PF:'davis',C:'davis'},
 post:{any:'jokic',PG:'brunson',SG:'harden',SF:'kawhi',PF:'jokic',C:'jokic'}
};
export function playerTemplate(profile){
 const rules=templateRules[profile.style]||templateRules.all,key=rules[profile.position]||rules.any;
 return {...athletes[key],key};
}
export function rankShoes(profile,pool,weights){
 const total=weights.reduce((a,b)=>a+b,0);
 const baseStyle={wing:'all',rebound:'jump',bulldog:'power',offball:'quick',post:'power'}[profile.style]||profile.style;
 return pool.map(shoe=>{const raw=shoe.scores.reduce((sum,s,i)=>sum+s*weights[i],0)/total*10;
  const styleFit=shoe.plays?.includes(baseStyle)?1:0,positionFit=profile.position!=='any'&&shoe.positions?.includes(profile.position)?1:0;
  const evidence=recommendationEvidence(shoe,profile);
  const rankValue=raw-evidence.conflicts.length*200-(shoe.configurationIncomplete?20:0)+(styleFit?2:-2)+(profile.position==='any'?0:positionFit?1:0);
  return {shoe,raw,score:Math.round(raw),styleFit,positionFit,rankValue,evidence};})
 .sort((a,b)=>b.rankValue-a.rankValue||b.raw-a.raw||a.shoe.id.localeCompare(b.shoe.id));
}
// Configuration-based trial guidance, rather than claims about measured fit or durability.
export function recommendationReasons(shoe,profile,lang='zh'){
 const en=lang==='en',say=(zh,english)=>en?english:zh;
 const priorities={quick:['急停与变向','stops and cuts'],all:['攻防转换','two-way movement'],power:['对抗与落地','contact and landings'],jump:['起跳与落地','jumping and landing'],wing:['锋卫切换','wing movement'],rebound:['卡位与连续落地','boxing out and repeated landings'],bulldog:['持球对抗','contact on drives'],offball:['连续起停','repeated starts and stops'],post:['低位转身与对抗','post turns and contact']}[profile.style];
 const position=profile.position==='any'?say('不限定位置，先看你的动作需求。','With no position selected, movement needs come first.'):shoe.positions.includes(profile.position)?say(`${profile.position} 在这款的建议位置中，符合你的位置偏好。`,`${profile.position} is among this shoe’s suggested roles, matching your preference.`):say(`这款建议位置为 ${shoe.positions.join(' / ')}，与你的 ${profile.position} 有差异；试穿时更要检查包覆与稳定。`,`Its suggested roles are ${shoe.positions.join(' / ')} rather than ${profile.position}; pay extra attention to containment and stability when trying it.`);
 const movement=say(`你的打法重点是${priorities[0]}；排序同时考虑对应打法配置、${profile.weight>=85?'缓震与支撑关注点':profile.weight<=65?'灵活移动与轻量脚感':'抓地、缓震与支撑的平衡'}。`,`Your game emphasizes ${priorities[1]}; ranking considers matching configurations plus ${profile.weight>=85?'cushioning and support preferences':profile.weight<=65?'agility and lightweight feel':'a balance of traction, cushioning and support'}.`);
 const evidence=recommendationEvidence(shoe,profile,lang),surface=evidence.surface;
 const constraints=[...evidence.conflicts];
 if(profile.feel==='cushion')constraints.push(say('你偏好缓震，已提高缓震权重；评分无法代替真实软硬感。','Your cushioning preference increases its weight; a score cannot predict actual softness.'));
 if(profile.feel==='court')constraints.push(say('你偏好贴地灵活，已提高抓地与轻量权重；离地高度尚无统一实测。','Your court-feel preference increases traction and lightweight weights; stack heights have not been measured consistently.'));
 if(profile.width==='wide')constraints.push(say('前掌偏宽：部分鞋款缺少可靠楦宽实测，不能保证宽脚适配；带比赛袜检查前掌压迫和横向包覆。','Wide forefoot: verified last-width measurements are incomplete. Try with game socks and check forefoot pressure and lateral containment.'));
 if(profile.height>0)constraints.push(say(`身高 ${profile.height} cm 已记录；没有可靠的身高与鞋款性能映射，不凭身高加分或推断位置。`,`Height ${profile.height} cm is recorded; no validated height-to-shoe performance mapping is available, so it does not add points or infer position.`));
 if(profile.footShape==='egyptian')constraints.push(say('埃及脚：检查大脚趾前方的余量，急停时不要顶到鞋头；趾形不代表脚宽。','Egyptian toes: check room ahead of the big toe so it does not hit the toe box during stops. Toe shape does not determine foot width.'));
 if(profile.footShape==='greek')constraints.push(say('希腊脚：按最长的第二脚趾检查鞋头余量，别只看大脚趾；不直接建议加码，先检查锁定与前滑。','Greek toes: check toe room against the longer second toe, not only the big toe. Do not automatically size up; check lockdown and forward sliding.'));
 if(profile.footShape==='roman')constraints.push(say('罗马脚：前三趾接近齐平，重点检查鞋头横向空间，避免小趾或第二、第三趾受挤压。','Roman toes: with the first three toes similar in length, check toe-box width and pressure on the smaller toes.'));
 if(profile.arch==='low')constraints.push(say('低足弓：试穿时检查中足承托是否舒适、侧墙是否顶脚；不能仅靠足弓外形保证某双鞋适合。','Low arch: check comfortable midfoot support and whether sidewalls press into the foot. Arch shape alone cannot establish shoe fit.'));
 if(profile.arch==='high')constraints.push(say('高足弓：关注脚背容积与中足压迫，系紧后仍应舒适；不把“支撑分高”直接等同于合脚。','High arch: check instep volume and midfoot pressure after lacing. A higher support score does not guarantee comfortable fit.'));
 if(profile.arch==='normal')constraints.push(say('常规足弓：仍要确认足弓位置贴合，变向时后跟与前掌不滑动。','Regular arch: still check arch alignment and that the heel and forefoot do not slide during cuts.'));
 if(profile.width==='unknown'&&(!profile.footShape||profile.footShape==='unknown')&&(!profile.arch||profile.arch==='unknown'))constraints.push(say('脚型尚未填写：不影响配置推荐，试穿时先确认鞋头余量、中足压迫和后跟锁定。','Foot shape is unspecified: configuration recommendations still work. Check toe room, midfoot pressure and heel lockdown when trying shoes.'));
 return {position,movement,surface,constraints,evidence};
}
export const marketPicks=[]; // MB.06 is now part of the comparison catalog.
