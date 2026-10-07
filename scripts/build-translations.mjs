import fs from 'node:fs';
const entries=fs.readFileSync('scripts/translation-pairs.txt','utf8').split(/\r?\n/).filter(Boolean).map(line=>{const i=line.indexOf('|');if(i<0)throw Error('Missing separator: '+line);return [line.slice(0,i),line.slice(i+1)];});
const map=Object.fromEntries(entries);
if(Object.keys(map).length!==entries.length)throw Error('Duplicate translation keys');
fs.writeFileSync('src/translations.json',JSON.stringify(map,null,2)+'\n');
console.log(`Built ${entries.length} Chinese/English translation entries.`);
