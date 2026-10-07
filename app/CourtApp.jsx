'use client';
import {useEffect,useState} from 'react';
import App from '../src/App';
import {LocaleProvider} from '../src/Locale';
import {MotionPreferences} from '../src/MotionPreferences';
import '../src/style.css';
import '../src/readability.css';
import '../src/dark.css';
import '../src/cover-clip.css';
import '../src/structure.css';
import '../src/advisor.css';
import '../src/premium.css';
import '../src/campaign.css';
import '../src/precision.css';
import '../src/experience.css';
import '../src/scroll-experience.css';
export default function CourtApp({fallbackHtml}){
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 return ready?<MotionPreferences><LocaleProvider><App/></LocaleProvider></MotionPreferences>:<div dangerouslySetInnerHTML={{__html:fallbackHtml}}/>;
}
