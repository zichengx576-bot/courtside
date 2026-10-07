import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rankShoes,playerTemplate,recommendationReasons} from '../src/advisor.js';
const catalog=JSON.parse(readFileSync(new URL('../src/catalog2026.json',import.meta.url)));
const actualData=readFileSync(new URL('../src/data.js',import.meta.url),'utf8').replace("import catalog from './catalog2026.json';",'const catalog='+JSON.stringify(catalog)+';');
const {criteria,validateProfile,fitScore,shoes,styleLabels}=await import('data:text/javascript;base64,'+Buffer.from(actualData).toString('base64'));
assert.equal(shoes.length,17);assert.equal(new Set(shoes.map(s=>s.id)).size,17);assert(!shoes.some(s=>s.id==='nike-kobe10'));
let checked=0;const templates=new Set(),picks=new Set();
for(const weight of [45,65,75,85,120])for(const style of Object.keys(styleLabels))for(const court of ['indoor','outdoor','rubber'])for(const position of ['any','PG','SG','SF','PF','C']){
 const p=validateProfile({weight,style,court,position}),ranking=rankShoes(p,shoes,criteria(p));
 assert.equal(ranking.length,shoes.length);assert.equal(new Set(ranking.map(r=>r.shoe.id)).size,shoes.length);
 ranking.forEach(r=>{assert.equal(r.score,fitScore(r.shoe,p));assert(r.score>=0&&r.score<=100);});
 for(let i=1;i<ranking.length;i++)assert(ranking[i-1].rankValue>=ranking[i].rankValue);
 assert.deepEqual(rankShoes(p,[...shoes].reverse(),criteria(p)).map(r=>r.shoe.id),ranking.map(r=>r.shoe.id));
 const template=playerTemplate(p);assert(template.source.startsWith('https://www.nba.com/'));assert.equal(playerTemplate({...p,weight:45,court:'indoor'}).key,template.key);
 templates.add(template.key);picks.add(ranking[0].shoe.id);checked++;
}
assert.equal(playerTemplate({style:'quick',position:'PG'}).key,'kyrie');
assert.equal(playerTemplate({style:'jump',position:'SG'}).key,'durant');
assert.equal(playerTemplate({style:'jump',position:'SF'}).key,'durant');
assert.equal(playerTemplate({style:'power',position:'C'}).key,'jokic');
assert.equal(playerTemplate({style:'wing',position:'SG'}).key,'edwards');
assert.equal(playerTemplate({style:'rebound',position:'PF'}).key,'rodman');
assert.equal(playerTemplate({style:'bulldog',position:'PG'}).key,'brunson');
assert.equal(playerTemplate({style:'offball',position:'SG'}).key,'klay');
assert.equal(playerTemplate({style:'post',position:'C'}).key,'jokic');
assert.equal(new Set(Object.keys(styleLabels).map(style=>JSON.stringify(criteria({weight:75,style,court:'indoor',position:'any'})))).size,9);
assert.equal(templates.size,15);assert(picks.size>1);
for(const weight of [NaN,44,121])assert.throws(()=>validateProfile({weight,style:'quick',court:'indoor',position:'any'}));
const center=validateProfile({weight:95,style:'rebound',court:'outdoor',position:'C'}),centerPick=rankShoes(center,shoes,criteria(center))[0].shoe;
assert.equal(recommendationReasons(centerPick,center).evidence.conflicts.length,0,'Known conflicts come before editorial position labels; position alone does not establish shoe suitability');
assert.equal(playerTemplate(center).key,'davis');
const explained=recommendationReasons(centerPick,{...center,width:'wide',height:200,footShape:'greek',arch:'high'},'zh');assert(explained.position.includes('C'));assert(explained.surface.includes('水泥'));assert(explained.constraints.some(s=>s.includes('楦宽')));assert(explained.constraints.some(s=>s.includes('第二脚趾')));assert(explained.constraints.some(s=>s.includes('脚背')));assert(explained.constraints.some(s=>s.includes('不凭身高加分')));
assert(criteria({...center,feel:'cushion'})[0]>criteria({...center,feel:'balanced'})[0]);
assert(criteria({...center,feel:'court'})[4]>criteria({...center,feel:'balanced'})[4]);
for(const p of [{...center,height:129},{...center,height:231},{...center,height:NaN},{...center,footShape:'fictional'},{...center,arch:'fictional'},{...center,width:'fictional'},{...center,feel:'fictional'}])assert.throws(()=>validateProfile(p));
console.log(`${checked} profile combinations passed; ${templates.size} templates, ${picks.size} distinct picks. Role, style, feel, height and foot-shape validation and stable ranking verified.`);

assert.deepEqual(criteria({...center,height:150}),criteria({...center,height:220}),'Unvalidated height-to-performance mapping must not alter rank');
assert(!Object.hasOwn(validateProfile({...center,budget:800}),'budget'),'Legacy budget must be stripped');
const restricted=['nike-gt-cut1','adidas-ae2','adidas-harden-vol-10'];
for(const style of Object.keys(styleLabels))for(const weight of [45,75,120]){const p={...center,weight,style};const ranked=rankShoes(p,shoes,criteria(p));assert(!ranked.slice(0,4).some(r=>restricted.includes(r.shoe.id)));}
const wide={...center,court:'indoor',width:'wide'},wideRanking=rankShoes(wide,shoes,criteria(wide));assert(wideRanking.find(r=>r.shoe.id==='adidas-harden-vol-10').evidence.conflicts.some(c=>c.includes('宽前掌')));
const light={...wide,width:'regular',feel:'court'};assert(!rankShoes(light,shoes,criteria(light)).slice(0,4).some(r=>['adidas-ae2','adidas-harden-vol-10'].includes(r.shoe.id)));
assert(rankShoes({...wide,width:'regular'},shoes,criteria({...wide,width:'regular'})).find(r=>r.shoe.id==='puma-mb06').evidence.level.includes('待实穿'));
console.log('Evidence guard QA passed: concrete, wide forefoot, lightweight conflicts; unknown is not confirmed; height and old budgets never create performance points.');
