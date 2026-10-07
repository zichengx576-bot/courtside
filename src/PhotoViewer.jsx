import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Hand, Pause, Play, Expand, X } from 'lucide-react';
import { useLocale } from './Locale';
import './interaction-controls.css';
export default function PhotoViewer(props) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  return <PhotoViewerSession key={props.shoe.id} {...props} />;
}
function PhotoViewerSession({
  shoe,
  large = false
}) {
  const {
    t
  } = useLocale();
  const [index, setIndex] = useState(shoe.coverIndex || 0),
    [playing, setPlaying] = useState(false),
    [zoom, setZoom] = useState(false);
  const [shown, setShown] = useState(shoe.coverIndex || 0),
    [failed, setFailed] = useState([]),
    [status, setStatus] = useState('loading');
  const start = useRef(null), dialog = useRef(null), expandButton = useRef(null);
  const multiple = shoe.photos.length > 1,
    label = shoe.mediaKind || t("\u591A\u89D2\u5EA6\u5B9E\u62CD");
  useEffect(() => {
    setIndex(shoe.coverIndex || 0);
    setPlaying(false);
    setZoom(false);
  }, [shoe.id]);
  useEffect(() => {
    let alive = true;
    const im = new Image();
    setStatus('loading');
    im.onload = () => {
      if (alive) {
        setShown(index);
        setStatus('ready');
      }
    };
    im.onerror = () => {
      if (alive) {
        setFailed(f => [...new Set([...f, index])]);
        setStatus('error');
        setPlaying(false);
      }
    };
    im.src = shoe.photos[index];
    return () => {
      alive = false;
    };
  }, [index, shoe.photos]);
  useEffect(() => {
    shoe.photos.forEach(src => {
      const im = new Image();
      im.src = src;
    });
  }, [shoe.photos]);
  useEffect(() => {
    if (!playing || status !== 'ready') return;
    const timer = setTimeout(() => setIndex(i => {
      for (let n = 1; n < shoe.photos.length; n++) {
        const next = (i + n) % shoe.photos.length;
        if (!failed.includes(next)) return next;
      }
      setPlaying(false);
      return i;
    }), 2100);
    return () => clearTimeout(timer);
  }, [playing, index, status, failed, shoe.photos.length]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  useEffect(() => {
    if (!zoom) return;
    const modal = dialog.current;
    if (!modal) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.showModal();
    return () => {
      if (modal.open) modal.close();
      document.body.style.overflow = old;
      if (expandButton.current?.isConnected) expandButton.current.focus({preventScroll:true});
    };
  }, [zoom]);
  const step = n => {
    setPlaying(false);
    setIndex(i => {
      for (let k = 1; k <= shoe.photos.length; k++) {
        const next = (i + n * k + shoe.photos.length * 2) % shoe.photos.length;
        if (!failed.includes(next)) return next;
      }
      return i;
    });
  };
  const drag = e => {
    if (start.current === null) return;
    const delta = e.clientX - start.current;
    if (Math.abs(delta) > 42) {
      step(delta < 0 ? 1 : -1);
      start.current = e.clientX;
    }
  };
  return <div className={'photo-viewer ' + (large ? 'large' : '')}>
  <div className="photo-stage" tabIndex={0} role="group" aria-label={shoe.short + ' ' + label + (multiple ? t("\uFF0C\u5DE6\u53F3\u65B9\u5411\u952E\u5207\u6362") : '')} onKeyDown={e => {
      if (multiple && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        step(e.key === 'ArrowRight' ? 1 : -1);
      }
    }} onPointerDown={e => {
      if (!multiple) return;
      start.current = e.clientX;
      e.currentTarget.setPointerCapture(e.pointerId);
    }} onPointerMove={drag} onPointerUp={() => start.current = null} onPointerCancel={() => start.current = null}>
   <img key={shoe.id + '-' + shown} src={shoe.photos[shown]} alt={`${shoe.name} ${shoe.colorway} ${t(label)} ${shown + 1}`} draggable="false" onError={() => {
        setStatus('error');
        setPlaying(false);
      }} />
   {status === 'loading' && <span className="photo-loading" role="status">{t('正在载入角度…')}</span>}
   {status === 'error' && <div className="photo-error" role="status"><span>{t('这个角度暂时无法加载，当前实拍已保留。')}</span><button onPointerDown={e => e.stopPropagation()} onClick={() => step(1)}>{t('查看下一角度')}</button></div>}
   <span className="photo-badge">{label}</span><button ref={expandButton} className="photo-expand icon-button" onPointerDown={e => e.stopPropagation()} onClick={() => {setPlaying(false);setZoom(true);}} aria-label={t("\u653E\u5927 ") + shoe.short + t(" \u56FE\u7247")}><Expand size={16} /></button>
  </div>
  <div className="photo-controls"><span><Hand size={13} /> {multiple ? t("\u62D6\u52A8\u5207\u6362\u89D2\u5EA6") : t("\u5B98\u65B9\u53D1\u5E03\u7D20\u6750")}</span><div><button className="icon-button" disabled={!multiple} onClick={() => step(-1)} aria-label={t("\u4E0A\u4E00\u89D2\u5EA6 ") + shoe.short}><ChevronLeft size={17} /></button><output aria-label={t("\u56FE\u7247\u5E8F\u53F7")}>{String(index + 1).padStart(2, '0')} <em>/ {String(shoe.photos.length).padStart(2, '0')}</em></output><button className="icon-button" disabled={!multiple} onClick={() => step(1)} aria-label={t("\u4E0B\u4E00\u89D2\u5EA6 ") + shoe.short}><ChevronRight size={17} /></button><button className="icon-button" disabled={!multiple} onClick={() => setPlaying(!playing)} aria-label={(playing ? t("\u6682\u505C") : t("\u81EA\u52A8\u64AD\u653E")) + ' ' + shoe.short}>{playing ? <Pause size={14} /> : <Play size={14} />}</button></div></div>
  {large && <div className="photo-thumbnails" aria-label={t("\u5B9E\u62CD\u89D2\u5EA6")}>{shoe.photos.map((url, i) => <button key={url} className={index === i ? 'on' : ''} onClick={() => {
        setIndex(i);
        setPlaying(false);
      }} aria-label={t("\u67E5\u770B\u7B2C ") + (i + 1) + t(" \u4E2A\u89D2\u5EA6")} aria-pressed={index === i}><img src={url} alt="" loading="lazy" /></button>)}</div>}
  {zoom && <dialog ref={dialog} className="photo-modal" aria-label={shoe.name + t(" \u5B9E\u62CD\u56FE\u7247")} onCancel={e => {e.preventDefault();setZoom(false);}} onClose={() => setZoom(false)} onClick={e => {if(e.target===e.currentTarget)setZoom(false);}} onKeyDown={e => {if(multiple&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}}}><button autoFocus className="modal-close icon-button" aria-label={t("\u5173\u95ED\u56FE\u7247")} onClick={() => setZoom(false)}><X /></button><img src={shoe.photos[shown]} alt={shoe.name + t(" \u653E\u5927\u5B9E\u62CD")} /><div className="modal-controls"><button className="icon-button" disabled={!multiple} aria-label={t("\u4E0A\u4E00\u5F20\u653E\u5927\u56FE")} onClick={() => step(-1)}><ChevronLeft /></button><span>{shoe.short} · {shown + 1} / {shoe.photos.length}</span><button className="icon-button" disabled={!multiple} aria-label={t("\u4E0B\u4E00\u5F20\u653E\u5927\u56FE")} onClick={() => step(1)}><ChevronRight /></button></div></dialog>}
 </div>;
}
