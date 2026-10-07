import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';

const indexUrl=new URL('../index.html',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('../src/catalog2026.json',import.meta.url),'utf8'));
const dataSource=await readFile(new URL('../src/data.js',import.meta.url),'utf8');
const importLine="import catalog from './catalog2026.json';";
assert(dataSource.includes(importLine),'The catalog import has changed; update this renderer before generating the fallback.');
const moduleSource=dataSource.replace(importLine,'const catalog='+JSON.stringify(catalog)+';');
const {shoes,styleLabels,positionLabels}=await import('data:text/javascript;base64,'+Buffer.from(moduleSource).toString('base64'));
assert.equal(shoes.length,17,'Expected the current 17-shoe archive.');
assert.equal(new Set(shoes.map(shoe=>shoe.id)).size,17,'Every fallback shoe must have a unique identity.');

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const sourceLink=url=>/^https:\/\//.test(url??'')?`<a href="${escape(url)}" target="_blank" rel="noreferrer">原始资料 ↗</a>`:'';
const cards=shoes.map((shoe,index)=>{
 assert(shoe.name&&shoe.specs?.length&&shoe.positions?.length,'A shoe is missing verified archive fields: '+shoe.id);
 const roles=shoe.positions.map(position=>{assert(positionLabels[position],'Unknown position: '+position);return positionLabels[position];}).join(' / ');
 const plays=shoe.plays.map(style=>{assert(styleLabels[style],'Unknown playing style: '+style);return styleLabels[style];}).join(' · ');
 const weight=shoe.weight?`约 ${shoe.weight.grams} g · ${shoe.weight.label}`:'暂无已核实的同尺码称重';
 return `<article class="static-shoe" data-static-shoe="${escape(shoe.id)}">
  <p class="static-eyebrow">${String(index+1).padStart(2,'0')} / ${escape(shoe.brand)}</p>
  <h3>${escape(shoe.name)}</h3>
  <p class="static-subtitle">${escape(shoe.subtitle)}</p>
  <p class="static-release">${escape(shoe.releaseNote)}</p>
  <dl>${shoe.specs.map(spec=>`<div><dt>${escape(spec.label)}</dt><dd>${escape(spec.value)}</dd></div>`).join('')}<div><dt>重量</dt><dd>${escape(weight)}</dd></div></dl>
  <p class="static-roles"><strong>建议位置</strong>${escape(roles)}</p>
  <p class="static-plays"><strong>适合打法</strong>${escape(plays)}</p>
  <p class="static-advice">${escape(shoe.roleReason)}</p>
  <p class="static-caution">${escape(shoe.caution)}</p>
  ${sourceLink(shoe.releaseSource)}
 </article>`;
}).join('\n');

const content=`<main class="static-preview">
 <header class="static-header"><a href="#static-home" class="static-logo">COURTSIDE <span>/ 球鞋顾问</span></a><a href="#static-rotation">阅读球鞋档案 ↓</a></header>
 <section class="static-hero" id="static-home"><div><p class="static-eyebrow">PERSONAL SNEAKER ADVISOR</p><h1>你的私人<br/>球鞋<span>顾问。</span></h1><p>读懂球鞋科技，也读懂你的打法。<br/>真实配置、建议位置与试穿重点，都从这里开始。</p><a class="static-action" href="#static-rotation">看看球鞋阵容 ↓</a></div><figure><img src="/shoes/gtcut1-hero-clean.webp" width="1200" height="600" alt="Nike G.T. Cut 1 粉色封面球鞋实拍" fetchpriority="high"/><figcaption>封面之选 / NIKE G.T. CUT 1</figcaption></figure></section>
 <noscript><p class="static-note">互动对比、3D与问答需启用JavaScript，仍可阅读配置。</p></noscript>
 <section class="static-archive" id="static-rotation"><p class="static-eyebrow">THE 2026 ROTATION</p><h2>本季球鞋档案<span> / ${shoes.length} 款</span></h2><p class="static-intro">以 2026 新款与本赛季旗舰为主。建议打法与位置用于选鞋初筛，具体脚感、包覆与尺码仍需试穿。</p><div class="static-grid">${cards}</div></section>
 <footer class="static-footer"><strong>COURTSIDE</strong><p>资料核验：${escape(catalog.verifiedAt)}。配置取自本站已核实档案，不套用不同版本；建议位置与打法属于配置分析。</p><a href="#static-home">返回封面 ↑</a></footer>
</main>`;

const css=`.static-preview{margin:0;background:#070c14;color:#c5dff7;font:16px/1.75 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;overflow-x:clip}.static-preview *{box-sizing:border-box}.static-preview a{color:#90c9f6;text-decoration:none}.static-preview a:focus-visible{outline:2px solid #8ae5d0;outline-offset:5px}.static-preview .static-header,.static-preview .static-hero,.static-preview .static-archive,.static-preview .static-footer,.static-preview .static-note{max-width:1320px;margin:0 auto;padding-left:40px;padding-right:40px}.static-preview .static-header{display:flex;justify-content:space-between;align-items:center;gap:20px;min-height:86px;border-bottom:1px solid #223b53;font-size:13px}.static-preview .static-logo{font-weight:750;letter-spacing:.05em;font-size:20px}.static-preview .static-logo span{font-size:12px;font-weight:400;color:#82a2c4}.static-preview .static-hero{display:grid;grid-template-columns:1fr 1.2fr;align-items:center;min-height:650px;padding-top:60px;padding-bottom:60px;gap:30px}.static-preview .static-eyebrow{font-size:11px;letter-spacing:.15em;color:#72aaf0}.static-preview h1{font-size:clamp(52px,5.7vw,88px);line-height:1.15;letter-spacing:-.055em;margin:24px 0 32px;color:#d8e9f9}.static-preview h1 span{color:#5b9eff}.static-preview .static-hero>div>p:last-of-type{color:#8eafcc;font-size:16px}.static-preview .static-action{display:inline-block;margin-top:22px;background:#2878e8;padding:13px 22px;border-radius:8px;color:#e1efff;font-weight:600}.static-preview figure{margin:0;min-width:0}.static-preview figure img{display:block;width:115%;height:auto;max-height:480px;object-fit:contain;transform:rotate(-12deg);filter:drop-shadow(0 30px 24px #0008)}.static-preview figcaption{padding-top:28px;color:#9fe6d9;font-size:12px;letter-spacing:.05em}.static-preview .static-note{padding-top:18px;padding-bottom:18px;background:#102438;color:#ace1e3;border-top:1px solid #284c64;border-bottom:1px solid #284c64}.static-preview .static-archive{padding-top:65px;padding-bottom:65px}.static-preview h2{font-size:clamp(28px,3vw,42px);line-height:1.25;letter-spacing:-.03em;margin:18px 0 20px;color:#d0e7fb}.static-preview h2 span{color:#7fa9d1;font-size:.5em;font-weight:400;white-space:nowrap}.static-preview .static-intro{max-width:720px;color:#91acc6;margin-bottom:32px}.static-preview .static-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.static-preview .static-shoe{border:1px solid #29435e;border-radius:12px;padding:26px;background:linear-gradient(145deg,#11263c,#0b1726);min-width:0}.static-preview h3{font-size:24px;line-height:1.35;margin:16px 0 10px;letter-spacing:-.02em}.static-preview .static-subtitle{color:#9fe6d9;font-size:14px;margin:0 0 10px}.static-preview .static-release{font-size:11px;color:#83a2bf;line-height:1.6}.static-preview dl{margin:22px 0;border-top:1px solid #29435e}.static-preview dl>div{display:grid;grid-template-columns:55px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px solid #29435e;font-size:13px}.static-preview dt{color:#78a1c7}.static-preview dd{margin:0;overflow-wrap:anywhere}.static-preview .static-roles,.static-preview .static-plays{font-size:12px;color:#92d5e8}.static-preview .static-roles strong,.static-preview .static-plays strong{display:block;color:#78a5cc;font-size:11px;font-weight:500;margin-bottom:4px}.static-preview .static-advice{font-size:13px;color:#9ebbd4}.static-preview .static-caution{font-size:11px;color:#91a8bd;border-left:2px solid #7c6c4b;padding-left:12px;margin-top:20px}.static-preview .static-shoe>a{display:inline-block;margin-top:8px;font-size:12px}.static-preview .static-footer{border-top:1px solid #29435e;padding-top:30px;padding-bottom:36px;display:flex;align-items:flex-start;gap:26px;font-size:12px;color:#7f9fbb}.static-preview .static-footer p{margin:0;max-width:700px}.static-preview .static-footer>a{margin-left:auto;white-space:nowrap}@media(max-width:760px){.static-preview .static-header,.static-preview .static-hero,.static-preview .static-archive,.static-preview .static-footer,.static-preview .static-note{padding-left:22px;padding-right:22px}.static-preview .static-logo{font-size:17px}.static-preview .static-logo span{display:none}.static-preview .static-header{min-height:72px}.static-preview .static-hero{grid-template-columns:1fr;min-height:0;gap:20px;padding-top:38px;padding-bottom:40px}.static-preview h1{font-size:58px;margin-bottom:25px}.static-preview .static-hero figure img{width:100%;height:auto;max-height:300px}.static-preview .static-grid{grid-template-columns:1fr;gap:16px}.static-preview .static-archive{padding-top:42px;padding-bottom:44px}.static-preview .static-shoe{padding:22px}.static-preview .static-footer{flex-wrap:wrap;gap:18px}.static-preview .static-footer p{order:3;width:100%}.static-preview .static-header>a:last-child{font-size:11px}}`;

const contentMarkers=['<!-- COURTSIDE_STATIC_PREVIEW_START -->','<!-- COURTSIDE_STATIC_PREVIEW_END -->'];
const styleMarkers=['<!-- COURTSIDE_STATIC_STYLE_START -->','<!-- COURTSIDE_STATIC_STYLE_END -->'];
const replaceMarked=(html,markers,replacement)=>{
 const begin=html.indexOf(markers[0]),end=html.indexOf(markers[1]);
 assert(begin>=0&&end>begin&&html.indexOf(markers[0],begin+1)<0&&html.indexOf(markers[1],end+1)<0,'Static markers must appear exactly once and in order.');
 return html.slice(0,begin)+replacement+html.slice(end+markers[1].length);
};
let html=await readFile(indexUrl,'utf8');
const original=html;
const markedContent=contentMarkers[0]+'\n'+content+'\n'+contentMarkers[1];
const markedStyle=styleMarkers[0]+'\n<style>\n'+css+'\n.static-preview{min-height:100svh;box-shadow:0 0 0 16px #070c14}\n</style>\n'+styleMarkers[1];
if(html.includes(contentMarkers[0]))html=replaceMarked(html,contentMarkers,markedContent);
else{
 assert(/<div id="root">\s*<\/div>/.test(html),'Expected an empty React root or an existing marked preview.');
 html=html.replace(/<div id="root">\s*<\/div>/,'<div id="root">\n'+markedContent+'\n</div>');
}
if(html.includes(styleMarkers[0]))html=replaceMarked(html,styleMarkers,markedStyle);
else{
 assert(html.includes('</head>'),'The existing head must be retained.');
 html=html.replace('</head>',markedStyle+'\n</head>');
}
assert.equal((html.match(/data-static-shoe=/g)||[]).length,17);
assert.equal((html.match(/src="\/src\/main\.jsx"/g)||[]).length,1,'Keep the original React entry.');
assert(html.includes('<title>COURTSIDE · 你的私人球鞋顾问</title>'),'Keep the existing site identity.');
await writeFile(indexUrl,html,'utf8');
console.log(`Rendered ${shoes.length} real shoe profiles with scoped static styles; ${html===original?'unchanged':'index.html updated'}.`);
