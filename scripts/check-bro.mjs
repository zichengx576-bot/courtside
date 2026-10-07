import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const catalog=JSON.parse(read('../src/catalog2026.json'));
const dataCode=read('../src/data.js').replace("import catalog from './catalog2026.json';",'const catalog='+JSON.stringify(catalog)+';');
const dataUrl='data:text/javascript;base64,'+Buffer.from(dataCode).toString('base64');
const code=read('../src/broKnowledge.js').replace("'./data.js'",JSON.stringify(dataUrl)).replace("'./advisor.js'",JSON.stringify(new URL('../src/advisor.js',import.meta.url).href));
const {answerArchive,profileFromQuestion}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const pool=catalog.shoes;
const ask=(question,extra={})=>answerArchive({question,pool,...extra});
let r=ask('Sabrina 4 和 Ja 4 哪个更轻？');assert.equal(r.shoeIds.length,2);assert(r.paragraphs.join(' ').includes('391'));assert(r.paragraphs.join(' ').includes('392'));assert(r.paragraphs.join(' ').includes('1 g'));
r=ask('WOW 12 的碳板在哪？');assert(r.paragraphs.join(' ').includes('纵向'));assert(r.paragraphs.join(' ').includes('开孔'));assert(r.paragraphs.join(' ').includes('并不等于'));assert(r.sources.some(s=>s.url.includes('wayofwade')));
r=ask('Sabrina 4 气垫在哪？');assert(r.paragraphs.join(' ').includes('FlyPlate 上方'));assert.equal(r.context[0],'nike-sabrina4');
const follow=ask('它的碳板呢？',{context:r.context});assert.equal(follow.context[0],'nike-sabrina4');assert(follow.paragraphs.join(' ').includes('未确认'));
const kobe=ask('Kobe 6 有气垫吗？',{context:r.context});assert.deepEqual(kobe.shoeIds,['nike-kobe6']);assert(kobe.paragraphs.join(' ').includes('Turbo'));assert(!kobe.paragraphs.join(' ').includes('Strobel'));
for(const [question,id] of [['Luka 5 中底是什么？','jordan-luka5'],['LeBron 23 多重？','nike-lebron23'],['字母哥8 泡棉是什么？','nike-freak8']])assert.deepEqual(ask(question).shoeIds,[id]);
assert(ask('LeBron 23 多重？').paragraphs.join(' ').includes('460'));
for(const [question,style] of [['锋卫摇摆人','wing'],['篮板狂魔','rebound'],['球场小钢炮','bulldog'],['无球跑位射手','offball'],['低位技术流','post'],['Power guard','bulldog'],['Post technician','post']])assert.equal(profileFromQuestion(question).profile.style,style);
assert.equal(ask('Book 23 有气垫吗？').shoeIds.length,0);
assert(ask('Sabrina 4 气垫位置在哪？').paragraphs.join(' ').includes('FlyPlate 上方'));
assert.equal(profileFromQuestion('室外塑胶地').profile.court,'rubber');
r=ask('WOW 12 多重？');assert(r.paragraphs.join(' ').includes('330 g'));assert(r.paragraphs.join(' ').includes('US 9.5'));
r=ask('85 kg，水泥地突破，推荐什么？');assert.equal(r.profile.weight,85);assert.equal(r.profile.court,'outdoor');assert.equal(r.profile.style,'quick');assert.equal(r.shoeIds.length,3);
const more=ask('还有其他推荐吗？',{context:r.context,profile:r.profile});assert.equal(more.shoeIds.length,3);assert.equal(more.profile.weight,85);
const specific=ask('它适合我吗？',{context:r.context,profile:r.profile});assert.equal(specific.shoeIds.length,1);assert.equal(specific.shoeIds[0],r.context[0]);
const wow=ask('WOW 12 的碳板在哪？');const courtFollow=ask('那它适合水泥地吗？',{context:wow.context,profile:wow.profile});assert.equal(courtFollow.shoeIds[0],'wade-wow-12');assert.equal(courtFollow.profile.court,'outdoor');assert(courtFollow.paragraphs.join(' ').includes('耐磨'));assert(!courtFollow.paragraphs.join(' ').includes('碳板在'));
const mixed=ask('185cm，希腊脚，高足弓，预算800元，脚比较宽，85kg，主要水泥地，帮我选一双');assert(!Object.hasOwn(mixed.profile,'budget'));assert.equal(mixed.profile.height,185);assert.equal(mixed.profile.footShape,'greek');assert.equal(mixed.profile.arch,'high');assert.equal(mixed.profile.width,'wide');assert.equal(mixed.profile.weight,85);assert.equal(mixed.profile.court,'outdoor');assert.equal(mixed.shoeIds.length,3);assert(mixed.paragraphs.join(' ').includes('第二脚趾'));assert(mixed.paragraphs.join(' ').includes('楦宽'));
r=ask('121 kg，推荐什么？');assert(r.paragraphs.join(' ').includes('45–120'));
r=ask('Book 2 多少钱？');assert(r.paragraphs.join(' ').includes('没有核实'));assert(r.sources.length);
r=ask('我适合什么码数？');assert(r.paragraphs.join(' ').includes('楦型实测'));
r=ask('未知品牌 X999 中底是什么？');assert.equal(r.shoeIds.length,0);assert(r.paragraphs.join(' ').includes('暂时没有可靠资料'));
const enCode=read('../src/Locale.jsx').split('export function LocaleProvider')[0].replace(/import \{[^;]+;/,'').replace("import translations from './translations.json';",'const translations='+read('../src/translations.json')+';').replace('const Context=createContext(null);','');
const {localize}=await import('data:text/javascript;base64,'+Buffer.from(enCode).toString('base64'));
const english=localize(pool,'en');
for(const context of [[],['jordan-luka5'],['nike-lebron23']]){
 for(const question of ['你觉得我打球像谁','我的打法类似哪个NBA球员','我的球星模板是什么']){
  const template=ask(question,{context,profile:{weight:75,style:'quick',court:'indoor',position:'PG'}});
  assert(template.paragraphs[0].includes('凯里·欧文'),'Template questions must use the player profile, not the last signature shoe');
  assert.equal(template.shoeIds.length,0);assert.equal(template.context.length,0);assert(template.sources.some(s=>s.url.includes('nba.com')));
 }
 for(const question of ['Who do I play like?','Which NBA player is my style similar to?','What is my NBA template?']){
  const template=answerArchive({question,pool:english,context,profile:{weight:75,style:'post',court:'indoor',position:'C'},lang:'en'});
  assert(template.paragraphs[0].includes('NIKOLA JOKIĆ'));assert.equal(template.shoeIds.length,0);assert(!/[\u3400-\u9fff]/.test(template.paragraphs.join(' ')));
 }
}
const lukaConversation=ask('Luka 5 缓震怎么样？');
const changedTopic=ask('你觉得我打球像谁',{context:lukaConversation.context,profile:lukaConversation.profile});
assert(changedTopic.paragraphs[0].includes('凯里·欧文'));assert(!changedTopic.paragraphs.join(' ').includes('Luka 5'));
const unknownFollow=ask('帮我写一份训练计划',{context:lukaConversation.context});assert.equal(unknownFollow.shoeIds.length,0);assert(unknownFollow.paragraphs.join(' ').includes('不能可靠回答'));
const unknownEnglish=answerArchive({question:'Can you write a training plan?',pool:english,context:lukaConversation.context,lang:'en'});assert.equal(unknownEnglish.shoeIds.length,0);assert(unknownEnglish.paragraphs.join(' ').includes('can’t reliably answer'));
assert(!/[\u3400-\u9fff]/.test(JSON.stringify(english)),'Untranslated catalog text');
r=answerArchive({question:'Sabrina 4 vs Ja 4: which is lighter?',pool:english,lang:'en'});assert(r.paragraphs.join(' ').includes('1 g lower'));assert(!/[\u3400-\u9fff]/.test(r.paragraphs.join(' ')));
r=answerArchive({question:'85 kg, concrete court, quick drives: recommend a shoe.',pool:english,lang:'en'});assert.equal(r.profile.court,'outdoor');assert(!/[\u3400-\u9fff]/.test(r.paragraphs.join(' ')));
const photos=JSON.parse(read('../src/playerPhotos.json'));assert.equal(photos.length,15);for(const p of photos){assert(fs.existsSync(new URL('../public'+p.file,import.meta.url)));assert(p.credit&&p.license&&p.licenseUrl&&p.year);}
console.log('Archive QA passed: configuration, follow-up, weights, profiles, unknown details, pricing, sizing, both languages and fifteen credited athlete photos.');

for(const [q,id] of [['GT Cut 1 配置是什么？','nike-gt-cut1'],['三球中底是什么？','puma-mb06'],['华子有碳板吗？','adidas-ae2']])assert.deepEqual(ask(q).shoeIds,[id]);
assert(!ask('三球中底是什么？').paragraphs.join(' ').includes('NITRO'));
for(const id of ['GT Cut 1','AE2','Harden 10']){const r=ask(id+'适合水泥地吗？');assert(r.paragraphs.join(' ').includes('不优先'));assert(r.sources.some(s=>/runrepeat|weartesters/.test(s.url)));}
const bad=ask('GT Cut 1 适合我吗？',{profile:{weight:75,style:'quick',court:'outdoor',position:'any'}});assert(bad.paragraphs[0].includes('已知冲突'));
assert(ask('240cm 推荐什么？').paragraphs.join(' ').includes('130–230'));
assert(ask('希腊脚高足弓怎么选码？').paragraphs.join(' ').includes('第二脚趾'));
assert.equal(ask('MB999 中底？',{context:['nike-ja4']}).shoeIds.length,0);
console.log('New aliases, shape/height parsing, unknown components and conflict-aware follow-up QA passed.');
assert(ask('Harden 10 多重？').paragraphs.join(' ').includes('434 g'));
assert(ask('MB06 和 WOW12 哪个更轻？').paragraphs.join(' ').includes('不能直接判断'));
assert(ask('AE2 和 Harden 10 哪个更轻？').paragraphs.join(' ').includes('已记录重量低 6 g'));
