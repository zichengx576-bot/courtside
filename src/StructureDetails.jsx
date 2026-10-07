import { useLocale } from "./Locale";
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Expand, X, MapPin } from 'lucide-react';
const foot = 'M36 63 C20 52 23 27 44 23 C90 12 126 33 164 20 C221 0 300 10 319 36 C342 75 300 98 248 89 C181 74 158 69 104 77 C77 84 45 80 36 63Z';
const zoneLabels = {
  full: '全长分布',
  forefoot: '前掌',
  heel: '后跟',
  midfoot: '中足',
  'forefoot-arch': '前掌 → 足弓',
  longitudinal: '纵向延伸',
  midsole: '中底 · 范围待公开',
  unknown: '具体位置待公开'
};
export function PositionMap({
  layer
}) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  const known = layer.type !== 'upper' && ['full', 'forefoot', 'heel', 'midfoot', 'forefoot-arch', 'longitudinal'].includes(layer.zone);
  const regions = {
    full: [19, 0, 310, 102],
    forefoot: [196, 0, 136, 102],
    heel: [20, 0, 83, 102],
    midfoot: [92, 0, 112, 102],
    'forefoot-arch': [107, 0, 225, 102],
    longitudinal: [53, 39, 245, 24]
  };
  const rect = regions[layer.zone] || [0, 0, 0, 0];
  return <div className="position-map"><div><span><MapPin size={14} /> {layer.type === 'upper' ? t("\u978B\u9762\u9501\u5B9A\u533A") : t(zoneLabels[layer.zone]) || t("\u5177\u4F53\u4F4D\u7F6E\u5F85\u516C\u5F00")}</span><small>{t("\u533A\u57DF\u793A\u610F \xB7 \u975E\u5C3A\u5BF8\u56FE")}</small></div><svg viewBox="0 0 350 126" role="img" aria-label={layer.title + t("\u7684\u4F4D\u7F6E\uFF1A") + layer.location}><defs><clipPath id="foot-zone"><path d={foot} /></clipPath></defs><path d={foot} fill="#101f33" stroke="#375681" strokeWidth="1.5" />{known && <rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} rx="8" fill={layer.color} opacity=".35" clipPath="url(#foot-zone)" />}<path d="M104 10 V95 M194 8 V91" stroke="#7198cf" strokeDasharray="3 5" opacity=".3" /><text x="60" y="118">{t("\u540E\u8DDF")}</text><text x="142" y="118">{t("\u4E2D\u8DB3")}</text><text x="252" y="118">{t("\u524D\u638C")}</text></svg></div>;
}
export function LayerDetails({
  layer
}) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  return <article className="layer-details" aria-live="polite"><div className="layer-detail-heading"><span style={{
        background: layer.color
      }} /><h3>{layer.title}</h3><a href={layer.source} target="_blank" rel="noreferrer" aria-label={layer.title + t("\u5B98\u65B9\u53C2\u6570\u6765\u6E90")}>{t("\u5B98\u65B9\u4F9D\u636E")}<ExternalLink size={13} /></a></div><dl>{[[t("\u4F4D\u7F6E"), layer.location], [t("\u5C42\u95F4\u5173\u7CFB"), layer.relationship], [t("\u4F5C\u7528"), layer.function], [t("\u5C1A\u672A\u516C\u5F00"), layer.unknown]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>;
}
export function OfficialFigures({
  shoe
}) {
  const {
    t,
    localize,
    lang,
    setLang
  } = useLocale();
  const [selected, setSelected] = useState(null),
    dialog = useRef(null),
    trigger = useRef(null);
  useEffect(() => setSelected(null), [shoe.id]);
  useEffect(() => {
    if (!selected) return;
    const previous = trigger.current,
      old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = e => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'Tab') {
        const nodes = dialog.current?.querySelectorAll('button,a[href]');
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [selected]);
  if (!shoe.techImages?.length) return <div className="official-text-link"><span>{t("\u5B98\u65B9\u8D44\u6599\u76EE\u524D\u4EE5\u6587\u5B57\u4E0E\u4EA7\u54C1\u5B9E\u62CD\u4E3A\u4E3B\uFF0C\u672A\u63D0\u4F9B\u5C3A\u5BF8\u5256\u9762\u3002")}</span><a href={shoe.layers[0].source} target="_blank" rel="noreferrer">{t("\u67E5\u770B\u8FD9\u6B3E\u7684\u5B98\u65B9\u914D\u7F6E")}<ExternalLink size={13} /></a></div>;
  return <div className="official-figures"><div className="official-heading"><h3>{t("\u5BF9\u7167\u5B98\u65B9\u914D\u7F6E\u56FE")}</h3><span>{shoe.short}{t("\xB7 \u54C1\u724C\u53D1\u5E03\u8D44\u6599")}</span></div><div className="figure-grid">{shoe.techImages.map(f => <button key={f.src} className="official-figure" onClick={e => {
        trigger.current = e.currentTarget;
        setSelected(f);
      }} aria-label={t("\u653E\u5927 ") + f.title}><img src={f.src} alt={f.title} loading="lazy" /><span><strong>{f.title}</strong><small>{f.kind}{shoe.id === 'lining-gamma-2' ? t(" \xB7 \u539F\u56FE\u5206\u8FA8\u7387\u8F83\u4F4E") : ''}</small></span><Expand size={17} /></button>)}</div>{selected && <div className="technical-modal" ref={dialog} role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}><button autoFocus className="modal-close icon-button" aria-label={t("\u5173\u95ED\u5B98\u65B9\u914D\u7F6E\u56FE")} onClick={() => setSelected(null)}><X /></button><figure onClick={e => e.stopPropagation()}><img src={selected.src} alt={selected.title} /><figcaption><span>{selected.title} · {selected.kind}</span><a href={selected.source} target="_blank" rel="noreferrer">{t("\u67E5\u770B\u54C1\u724C\u539F\u59CB\u6765\u6E90")}<ExternalLink size={14} /></a></figcaption></figure></div>}</div>;
}
