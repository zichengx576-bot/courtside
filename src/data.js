import catalog from './catalog2026.json';
export const shoes=catalog.shoes;
export const dimensions=['缓震','抓地','支撑','耐磨','轻量'];
export const styleLabels={quick:'突破变向',all:'全能攻防',power:'力量对抗',jump:'跳投起跳',wing:'锋卫摇摆人',rebound:'篮板狂魔',bulldog:'球场小钢炮',offball:'无球跑位射手',post:'低位技术流'};
export const courtLabels={indoor:'室内木地板',outdoor:'室外水泥地',rubber:'室外塑胶地'};
export const positionLabels={any:'按打法判断，不限定位置',PG:'控球后卫 · PG',SG:'得分后卫 · SG',SF:'小前锋 · SF',PF:'大前锋 · PF',C:'中锋 · C'};
export const feelLabels={balanced:'均衡脚感',cushion:'缓震优先',court:'贴地灵活'};
export const widthLabels={regular:'常规脚宽',wide:'前掌偏宽',unknown:'暂不确定'};
export const footShapeLabels={unknown:'暂不确定',egyptian:'埃及脚 · 大脚趾最长',greek:'希腊脚 · 第二脚趾较长',roman:'罗马脚 · 前三趾长度接近'};
export const archLabels={unknown:'暂不确定',normal:'常规足弓',low:'低足弓',high:'高足弓'};
export const defaultProfile={weight:75,height:0,style:'quick',court:'indoor',position:'any',feel:'balanced',width:'unknown',footShape:'unknown',arch:'unknown'};
export function validateProfile(p){
 const position=p.position??'any';
 if(!Number.isFinite(p.weight)||p.weight<45||p.weight>120||!Object.hasOwn(styleLabels,p.style)||!Object.hasOwn(courtLabels,p.court)||!Object.hasOwn(positionLabels,position))throw new Error('体重应为 45–120 kg，并选择有效的打法、场地和位置。');
 const feel=p.feel??'balanced',width=p.width??'unknown',height=p.height??0,footShape=p.footShape??'unknown',arch=p.arch??'unknown';
 if(!Number.isFinite(height)||(height!==0&&(height<130||height>230)))throw new Error('身高应为 130–230 cm，也可以留空。');
 if(!Object.hasOwn(feelLabels,feel)||!Object.hasOwn(widthLabels,width)||!Object.hasOwn(footShapeLabels,footShape)||!Object.hasOwn(archLabels,arch))throw new Error('请选择有效的脚感、脚宽、脚型和足弓。');
 return {weight:p.weight,height,style:p.style,court:p.court,position,feel,width,footShape,arch};
}
export function criteria(profile){
 validateProfile(profile);
 const w={quick:[1.1,1.7,1.3,.5,1.5],all:[1.3,1.3,1.3,1,1],power:[1.5,1.1,2,1.1,.5],jump:[2,1.2,1.4,.7,.8],wing:[1.5,1.5,1.5,.8,1.2],rebound:[2.1,1.1,2,.9,.5],bulldog:[1.5,1.7,1.9,.8,1],offball:[1.3,1.9,1.1,.6,1.8],post:[1.7,1.3,2.1,1,.5]}[profile.style].slice();
 // Smooth editorial preference adjustment, not a body-weight safety threshold.
 const load=Math.max(0,Math.min(1,(profile.weight-75)/45)),light=Math.max(0,Math.min(1,(75-profile.weight)/30));
 w[0]+=.9*load;w[2]+=.65*load;w[4]=w[4]*(1-.35*load)+.55*light;
 if(profile.court==='outdoor'){w[3]+=2.1;w[1]+=.3;}if(profile.court==='rubber')w[3]+=1.1;
 if(profile.position==='PG'){w[1]+=.25;w[4]+=.25;}if(profile.position==='SG'){w[0]+=.15;w[1]+=.15;}if(profile.position==='PF'||profile.position==='C'){w[0]+=.35;w[2]+=.35;}
 if(profile.feel==='cushion')w[0]+=1.5;if(profile.feel==='court'){w[1]+=.7;w[4]+=.9;}
 // Height is recorded only: no validated height-to-shoe performance mapping.
 return w;
}
export function fitScore(shoe,profile){const w=criteria(profile);return Math.round(shoe.scores.reduce((sum,s,i)=>sum+s*w[i],0)/w.reduce((a,b)=>a+b,0)*10);}
export function analysisFor(a,b,profile,lang='zh'){
 const w=criteria(profile),scoreA=fitScore(a,profile),scoreB=fitScore(b,profile),winner=scoreA>=scoreB?a:b;
 const priorities=w.map((value,index)=>({value,index})).sort((x,y)=>y.value-x.value).slice(0,3).map(x=>dimensions[x.index]);
 const courtNote=profile.court==='outdoor'?'水泥地增加耐磨权重；这里比较的是配置建议，仍需留意具体配色的外底材料和损耗。':profile.court==='rubber'?'塑胶地增加耐磨权重；有灰尘或潮湿时，抓地感可能改变。':'木地板更关注急停抓地；积灰情况与擦底频率也会影响体验。';
 const weightNote=profile.weight>=85?'较高体重增加了缓震和支撑的权重。':profile.weight<=65?'较低体重增加了轻量脚感的权重。':'当前体重采用常规缓震与支撑权重。';
 const roleNames=winner.positions.map(p=>positionLabels[p].split(' · ')[0]).join('、');
 const positions={PG:'point guards',SG:'shooting guards',SF:'small forwards',PF:'power forwards',C:'centers'};
 const roles=winner.positions.map(p=>positions[p]).join(', ');
 const positionNote=lang==='en'?(profile.position==='any'?`Based on its configuration, ${roles} should consider trying this shoe first.`:winner.positions.includes(profile.position)?`Your position (${profile.position}) is among its suggested roles. Your playing style and foot shape matter more than a position label.`:`Its configuration favors ${roles}. As a ${profile.position}, compare cushioning, torsional support and containment in person.`):(profile.position==='any'?`按配置建议，它更值得${roleNames}优先试穿。`:winner.positions.includes(profile.position)?`你选择的${positionLabels[profile.position]}在这款的建议位置中；位置只作参考，具体打法与脚型更关键。`:`这款更偏向${roleNames}的配置需求；你选择了${positionLabels[profile.position]}，建议重点比较缓震、抗扭与包覆是否够用。`);
 return {scoreA,scoreB,winner,priorities,close:Math.abs(scoreA-scoreB)<=2,reason:winner.advice,caution:winner.caution,courtNote,weightNote,positionNote};
}
