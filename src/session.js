import {shoes,defaultProfile,validateProfile} from './data.js';
const experienceKey='courtside-experience-v2',chatKey='courtside-chat-v2';
const known=id=>shoes.some(s=>s.id===id);
function getStorage(){try{return globalThis.localStorage;}catch{return null;}}
const validProfile=p=>{try{return validateProfile(p);}catch{return {...defaultProfile};}};
function read(key,storage){try{return JSON.parse(storage?.getItem(key)||'null');}catch{return null;}}
export function saveLocal(key,value,storage=getStorage()){try{if(!storage)return false;storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function readExperience(storage=getStorage()){
 const saved=read(experienceKey,storage),value=saved?.version===2?saved:{};
 const left=known(value.left)?value.left:shoes[0].id;
 const right=known(value.right)&&value.right!==left?value.right:shoes.find(s=>s.id!==left&&s.id===shoes[2].id)?.id||shoes.find(s=>s.id!==left).id;
 return {left,right,profile:validProfile(value.profile),applied:validProfile(value.applied)};
}
export const saveExperience=value=>saveLocal(experienceKey,{version:2,...value});
export function readChat(storage=getStorage()){
 const saved=read(chatKey,storage);
 if(saved?.version!==2||!Array.isArray(saved.entries))return [];
 return saved.entries.slice(-40).filter(e=>typeof e.question==='string'&&e.question.trim()&&e.question.length<=400&&Array.isArray(e.context)).map(e=>({question:e.question,profile:validProfile(e.profile),context:e.context.filter(known).slice(0,3)}));
}
export const saveChat=entries=>saveLocal(chatKey,{version:2,entries:entries.slice(-40)});
