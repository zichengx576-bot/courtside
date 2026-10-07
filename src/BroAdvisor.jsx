import {Reveal} from './CampaignMotion';
import {useEffect,useLayoutEffect,useRef,useState,useMemo} from 'react';
import {ArrowUpRight,ArrowUp,ArrowDown,RotateCcw,MessageCircle,Send} from 'lucide-react';
import {useLocale} from './Locale';
import {answerArchive} from './broKnowledge';
import {readChat,saveChat} from './session';
import './interaction-controls.css';

export default function BroAdvisor({pool,profile,onChoose}){
 const {lang}=useLocale(),en=lang==='en',say=(zh,english)=>en?english:zh;
 const [entries,setEntries]=useState(readChat),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[saved,setSaved]=useState(true),[unread,setUnread]=useState(false);
 const messages=useMemo(()=>entries.flatMap((entry,i)=>[{id:i+'-user',role:'user',text:entry.question},{id:i+'-bro',role:'bro',...answerArchive({question:entry.question,pool,profile:entry.profile,context:entry.context,lang})}]),[entries,pool,lang]);
 const context=useRef([]),chatProfile=useRef(profile),timer=useRef(null),thread=useRef(null),previousProfile=useRef(JSON.stringify(profile)),followLatest=useRef(true),previousEntries=useRef(entries),resolvedEntries=useRef(entries);
 useEffect(()=>{if(previousProfile.current!==JSON.stringify(profile)){chatProfile.current=profile;previousProfile.current=JSON.stringify(profile);}},[profile]);
 useEffect(()=>{setSaved(saveChat(entries));const last=messages.at(-1);if(last){context.current=last.context;if(resolvedEntries.current!==entries)chatProfile.current=last.profile;}resolvedEntries.current=entries;},[entries]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const showLatest=()=>{const box=thread.current;followLatest.current=true;setUnread(false);if(box)box.scrollTo({top:box.scrollHeight,behavior:'instant'});};
 const recordScroll=()=>{const box=thread.current;if(!box)return;const nearBottom=box.scrollHeight-box.clientHeight-box.scrollTop<=48;followLatest.current=nearBottom;if(nearBottom)setUnread(false);};
 useLayoutEffect(()=>{const hasReply=previousEntries.current!==entries&&entries.length>0;previousEntries.current=entries;const box=thread.current;if(!box)return;if(followLatest.current){box.scrollTo({top:box.scrollHeight,behavior:'instant'});setUnread(false);}else if(hasReply)setUnread(true);},[entries,busy]);
 const send=(question=input)=>{
  const text=question.trim().slice(0,400);if(!text||busy)return;
  const entry={question:text,profile:{...chatProfile.current},context:[...context.current]};showLatest();setInput('');setBusy(true);
  timer.current=setTimeout(()=>{setEntries(m=>[...m,entry].slice(-40));setBusy(false);},340);
 };
 const reset=()=>{clearTimeout(timer.current);followLatest.current=true;setUnread(false);setBusy(false);setEntries([]);setInput('');context.current=[];chatProfile.current=profile;};
 const questions=messages.length?(en?['Is it suitable for concrete courts?','Any other recommendations?','Sabrina 4 vs Ja 4: which is lighter?']:['这双适合水泥地吗？','还有其他推荐吗？','Sabrina 4 和 Ja 4 哪个更轻？']):(en?['Where is the WOW 12 carbon plate?','Sabrina 4 vs Ja 4: which is lighter?','85 kg, concrete court, quick drives: recommend a shoe.']:['WOW 12 的碳板在哪里？','Sabrina 4 和 Ja 4 哪个更轻？','85 kg，水泥地突破，推荐什么？']);
 return <section className="bro-section" id="ask-bro" aria-labelledby="bro-heading">
  <Reveal className="bro-intro"><span className="eyebrow">04 / MEET X-DRAGON</span><h2 id="bro-heading">{say('还有疑问？','Still deciding?')}<span>{say('和 X-dragon 聊聊。','Talk to X-dragon.')}</span></h2><p>{say('配置有出处，选鞋有方向。','Real sources. A clearer direction.')}</p></Reveal>
  <div className="bro-workbench"><aside className="bro-persona"><span className="bro-status"><i/>{say('球鞋档案顾问','Sneaker archive advisor')}</span><img src="/mascot/bro-v1.webp" alt={say('身穿蓝色球衣、抱着篮球的 X-dragon 顾问','X-dragon, your basketball advisor in a blue jersey')} loading="lazy"/><div><span>MEET X-DRAGON</span><h3>{say('场边搭子，','Your courtside')}<br/>{say('懂鞋也懂你。','sneaker buddy.')}</h3><p>{say('bro，我是 X-dragon。说说你平时怎么打，咱们一起把鞋挑明白。','bro, I’m X-dragon. Tell me how you play, and let’s find a shoe that fits your game.')}</p></div></aside>
   <div className="bro-chat"><header><div><MessageCircle size={18}/><strong>{say('X-dragon','X-dragon')}</strong><span>{say('档案问答','Archive answers')}</span></div><button onClick={reset} aria-label={say('清空对话','Clear conversation')}><RotateCcw size={16}/></button></header>
    <div className="bro-history"><div className="bro-thread" ref={thread} tabIndex={0} onScroll={recordScroll} role="log" aria-live="polite" aria-relevant="additions" aria-label={say('与 X-dragon 的对话','Conversation with X-dragon')}>
     {!messages.length&&<div className="bro-welcome"><span>HEY, BRO.</span><h3>{say('从你的下一个问题开始。','Start with your next question.')}</h3><p>{say(`bro，想聊缓震、气垫、碳板，还是想挑双适合自己的鞋？这儿有 ${pool.length} 双鞋的档案可以一起看，没查到的我会直接告诉你。`,`bro, want to talk cushioning, air units, carbon plates or your next pair? We have ${pool.length} shoe profiles to look through together. I’ll tell you when I don’t have a verified detail.`)}</p></div>}
     {messages.map(m=><article key={m.id} className={'bro-message '+m.role}><span className="bro-speaker">{m.role==='user'?say('你','YOU'):'X-DRAGON'}</span>{m.role==='user'?<p>{m.text}</p>:<><div>{m.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div>{m.sources.length>0&&<div className="bro-sources"><span>{say('核对来源','CHECK THE SOURCES')}</span>{m.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title}<ArrowUpRight size={12}/></a>)}</div>}{m.shoeIds.length>0&&<div className="bro-picks">{m.shoeIds.slice(0,2).map(id=><button key={id} onClick={()=>onChoose('right',id)}>{pool.find(s=>s.id===id)?.short} · {say('加入 B 对比','Compare as B')}<ArrowUpRight size={12}/></button>)}</div>}</>}</article>)}
     {busy&&<div className="bro-typing" role="status" aria-label={say('正在查阅球鞋档案','Looking through the shoe archive')}><span>X-DRAGON</span><i/><i/><i/></div>}
    </div>{unread&&<button type="button" className="bro-new-replies" onClick={showLatest}><ArrowDown size={14}/>{say('有新回复','New replies')}</button>}</div>
    <div className="bro-questions">{questions.map(q=><button key={q} disabled={busy} onClick={()=>send(q)}>{q}<ArrowUp size={12}/></button>)}</div>
    <form onSubmit={e=>{e.preventDefault();send();}}><label className="sr-only" htmlFor="bro-question">{say('向 X-dragon 提问','Your question for X-dragon')}</label><input id="bro-question" value={input} onChange={e=>setInput(e.target.value)} maxLength={400} placeholder={say('bro，我想问…','bro, I’m wondering…')} autoComplete="off"/><button type="submit" disabled={busy||!input.trim()} aria-label={say('发送问题','Send question')}><Send size={18}/></button></form>
    <p className="bro-footnote">{say('档案问答 · 未接入 AI 模型 · ','Archive answers · AI model not connected · ')}{saved?say('对话保存在本机，切换语言不会丢失','Conversation saved on this device and kept across languages'):say('浏览器未允许保存对话','This browser did not allow saving the conversation')}</p>
   </div>
  </div>
 </section>;
}
