import {useEffect,useState} from 'react';
import {Users,ArrowUpRight,RotateCcw} from 'lucide-react';
import {useLocale} from './Locale';
import {Reveal} from './CampaignMotion';
import './visitor-count.css';

let pending;
function browserId(){
 try{
  const key='courtside-visitor-v1';let id=localStorage.getItem(key);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||'')){id=crypto.randomUUID();localStorage.setItem(key,id);}
  return id;
 }catch{return null;}
}
function loadCount(){
 if(pending)return pending;
 const id=browserId();
 pending=fetch('/api/visitors',id?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:id}),signal:AbortSignal.timeout(8000),cache:'no-store'}:{cache:'no-store',signal:AbortSignal.timeout(8000)})
  .then(async response=>{if(!response.ok)throw new Error('unavailable');const data=await response.json();if(!Number.isSafeInteger(data.count)||data.count<0)throw new Error('invalid_count');return {count:data.count,counted:!!id};})
  .finally(()=>{pending=undefined;});
 return pending;
}
export default function VisitorCount(){
 const {lang}=useLocale(),en=lang==='en',say=(zh,english)=>en?english:zh;
 const [state,setState]=useState({status:'loading'}),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setState({status:'loading'});loadCount().then(result=>{if(active)setState({status:'ready',...result});}).catch(()=>{if(active)setState({status:'error'});});return()=>{active=false;};},[retry]);
 const preview=typeof location!=='undefined'&&['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 return <Reveal className="visitor-strip"><div className="visitor-copy"><span className="visitor-kicker">THE COURT GROWS</span><h2><Users size={19}/>{say('累计鞋友','Sneaker friends')}</h2><p>{say('同一浏览器重复来访，只计一次。','One browser. One visitor. Return as often as you like.')}</p></div><div className="visitor-total" role="status" aria-live="polite" aria-atomic="true"><span className={'visitor-live '+(state.status==='ready'?'ready':'')}>{preview?say('本地预览统计','Local preview count'):say('网站累计统计','Site visitor count')}</span><strong>{state.status==='ready'?new Intl.NumberFormat(en?'en-US':'zh-CN').format(state.count):'—'}<span>{say('位鞋友','court friends')}</span></strong><small>{state.status==='loading'?say('正在读取访客统计…','Loading visitor count…'):state.status==='error'?say('统计暂不可用，不影响选鞋。','Count unavailable. You can still explore the shoes.'):!state.counted?say('无法保存浏览器标识，仅展示已统计访客。','Browser storage unavailable; showing the existing total.'):say('场边碰个拳，一起读懂好鞋。','A courtside fist bump. Find your next pair together.')}</small>{state.status==='error'&&<button onClick={()=>setRetry(value=>value+1)} aria-label={say('重试访客统计','Retry visitor count')}><RotateCcw size={13}/>{say('重新连接','Try again')}<ArrowUpRight size={13}/></button>}</div><p className="visitor-note">{say('按浏览器去重统计；更换设备或清除浏览器数据会重新计数。','Deduplicated by browser; a different device or cleared browser data counts as a new visitor.')}</p></Reveal>;
}
