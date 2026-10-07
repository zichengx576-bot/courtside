import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import translations from './translations.json';
const Context=createContext(null);
const fragments=Object.keys(translations).filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
const cache=new Map();
export function translate(value,lang='zh'){
 if(lang==='zh'||typeof value!=='string')return value;
 if(translations[value]!==undefined)return translations[value];
 if(translations[value.trim()]!==undefined)return value.replace(value.trim(),translations[value.trim()]);
 // Dynamic labels retain shoe names and numbers while translating known fragments.
 if(cache.has(value))return cache.get(value);
 const result=fragments.reduce((s,k)=>s.includes(k)?s.split(k).join(translations[k]):s,value);
 cache.set(value,result);return result;
}
export function localize(value,lang){
 if(typeof value==='string')return translate(value,lang);
 if(Array.isArray(value))return value.map(v=>localize(v,lang));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v,lang)]));
 return value;
}
export function LocaleProvider({children}){
 const [lang,setLang]=useState(()=>{try{return localStorage.getItem('courtside-language')==='en'?'en':'zh';}catch{return 'zh';}});
 useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=lang==='zh'?'COURTSIDE · 你的私人球鞋顾问':'COURTSIDE · Your personal sneaker advisor';try{localStorage.setItem('courtside-language',lang);}catch{}},[lang]);
 const value=useMemo(()=>({lang,setLang,t:text=>translate(text,lang),localize:value=>localize(value,lang)}),[lang]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLocale(){return useContext(Context);}
