// Source-specific observations, not a population survey or fit probability.
export const reviewedEvidence={
 'nike-gt-cut1':{roughOutdoorConcern:true,sources:[{title:'WearTesters · G.T. Cut 1',url:'https://weartesters.com/nike-air-zoom-gt-cut-performance-review/'}],notes:[['原版实穿评测的外场抓地不及室内；水泥地不优先，不能套用 EP 或复刻鞋结论。','A firsthand review found weaker outdoor than indoor grip in the original version. It is not prioritized on concrete; EP and replica results are not interchangeable.']]},
 'adidas-ae2':{roughOutdoorConcern:true,heavy:true,sources:[{title:'RunRepeat · Anthony Edwards 2',url:'https://runrepeat.com/adidas-anthony-edwards-2'}],notes:[['测试样鞋男 US 9 单鞋 428 g；粗糙外场不优先。实验室耐磨较好，不等于外场抓地好。','The tested men’s US 9 shoe weighed 428 g. It is not prioritized on rough outdoor courts; good lab abrasion resistance does not establish outdoor grip.']]},
 'adidas-harden-vol-10':{roughOutdoorConcern:true,heavy:true,narrow:true,sources:[{title:'RunRepeat · Harden Volume 10',url:'https://runrepeat.com/adidas-harden-volume-10'}],notes:[['测试样鞋男 US 9 单鞋 434 g、楦型偏窄；宽前掌与轻量偏好不优先，粗糙外场需另选。','The tested men’s US 9 shoe weighed 434 g and had a narrow interior. It is not prioritized for a wide forefoot, lightweight preferences or rough outdoor play.']]}
};
export function recommendationEvidence(shoe,profile,lang='zh'){
 const reviewed=reviewedEvidence[shoe.id],en=lang==='en',say=(zh,english)=>en?english:zh;
 const conflicts=[];
 // These remove known conflicts before editorial preference ranking. Unknown is never a pass.
 if(profile.court==='outdoor'&&reviewed?.roughOutdoorConcern)conflicts.push(say('实穿/测试提示粗糙外场风险，水泥地不优先','Testing flags rough outdoor limitations; not prioritized on concrete'));
 if(profile.width==='wide'&&reviewed?.narrow)conflicts.push(say('测试楦型偏窄，不优先推荐给宽前掌','The tested interior is narrow; not prioritized for a wide forefoot'));
 if(profile.width==='wide'&&shoe.fit?.snug)conflicts.push(say('官方标注紧贴包覆，宽前掌需先核对，不作为优先候选；这不等于已实测楦型偏窄','The brand lists a snug fit. A wide forefoot needs a fit check before priority consideration; this is not a measured last-width result'));
 if(profile.feel==='court'&&reviewed?.heavy)conflicts.push(say('实测偏重，不优先用于轻量脚感需求','The tested shoe is heavy; not prioritized for lightweight preferences'));
 const notes=reviewed?reviewed.notes.map(n=>n[en?1:0]):[say('目前以品牌配置初筛；缺少本站版本、同尺码与同场地的统一性能测试。资料不足不等于已经适合你。','Screened from brand specifications; standardized tests of this version, size and court are unavailable. Missing evidence does not establish suitability.')];
 if(shoe.configurationIncomplete)notes.unshift(say('完整销售版本与关键配置尚未核实，降低候选优先级；发布图片不等于可验证的实战性能。','The retail version and key configurations are not fully verified, reducing candidate priority. Release imagery does not establish court performance.'));
 if(shoe.fit?.runsSmall)notes.push(say('官方提示尺码偏小；先看对应地区尺码表并试穿，不统一建议所有人加码。','The brand flags a small fit. Check the regional size guide and try it on rather than sizing everyone up.'));
 const surface=profile.court==='outdoor'?(reviewed?.roughOutdoorConcern?say('水泥地不优先考虑这款。已知实穿或测试提示外场抓地/纹路寿命取舍，建议比较其他候选。','Not prioritized on concrete. Wear or lab testing flags outdoor grip or tread-life tradeoffs; compare other candidates.'):say('水泥地适配尚未充分核实：品牌“耐磨”描述与编辑分数不能证明外场抓地或寿命。先核对具体外底配色，并在干燥场地试穿。','Concrete suitability is not fully verified. Brand abrasion claims and editorial scores do not establish outdoor grip or lifespan. Check the exact outsole colorway and try it on a dry court.')):profile.court==='rubber'?say('塑胶地仍需核对场地粗糙程度与积灰；不能把木地板测试直接外推为所有塑胶地都适合。','Check roughness and dust on rubber courts. Hardwood tests do not establish suitability for every rubber court.'):say('室内也要检查积灰后的急停抓地与包覆；不同外底配色和个人脚型会改变体验。','Indoors, check stopping grip on dust and containment. Outsole colorways and individual foot shape can change the experience.');
 const sources=[...(reviewed?.sources||[]),...(shoe.fit?.source?[{title:say('官方尺码与包覆说明','Official sizing and fit notes'),url:shoe.fit.source}]:[])];
 const surfacePending=profile.court!=='indoor';
 return {conflicts,notes,surface,surfacePending,sources,level:reviewed?say('有独立测试/实穿参考','Independent test / wear reference'):say('官方配置初筛 · 待实穿验证','Brand specification screening · wear verification pending')};
}
