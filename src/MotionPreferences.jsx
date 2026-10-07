import {createContext,useContext,useEffect,useState} from 'react';
import {MotionConfig} from 'motion/react';

const MotionSettings=createContext({reduced:false,manual:false,toggle:()=>{}});
export function MotionPreferences({children}){
 const [system,setSystem]=useState(()=>typeof window!=='undefined'&&typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)').matches:false);
 const [manual,setManual]=useState(()=>{try{return localStorage.getItem('courtside-reduce-motion')==='true';}catch{return false;}});
 useEffect(()=>{
  if(typeof window.matchMedia!=='function')return;
  const query=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setSystem(query.matches);
  change();
  if(query.addEventListener)query.addEventListener('change',change);else query.addListener(change);
  return()=>{if(query.removeEventListener)query.removeEventListener('change',change);else query.removeListener(change);};
 },[]);
 const reduced=Boolean(system||manual);
 useEffect(()=>{
  document.documentElement.dataset.motion=reduced?'reduced':'full';
  try{localStorage.setItem('courtside-reduce-motion',String(manual));}catch{}
 },[reduced,manual]);
 return <MotionSettings.Provider value={{reduced,manual,toggle:()=>setManual(v=>!v)}}><MotionConfig reducedMotion={reduced?'always':'never'}>{children}</MotionConfig></MotionSettings.Provider>;
}
export function useMotionSettings(){return useContext(MotionSettings);}
export function useSiteMotion(){return useMotionSettings().reduced;}
