import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, SendHorizontal, ShieldCheck } from 'lucide-react';
import { useApp } from '../lib/store';
import { ago, useT } from '../lib/i18n';
import { cx } from '../components/ui';

export default function Messages() {
  const { t, tb, lang } = useT();
  const active = useApp((s) => s.session.activeCase ?? s.saved);
  const c = useApp((s) => s.cases.find((x) => x.ref === active?.ref));
  const reply = useApp((s) => s.reporterReply);
  const read = useApp((s) => s.markReporterRead);
  const back = useApp((s) => s.back);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (c?.reporterUnread) read(c.id);
  }, [c?.reporterUnread, c?.id, read]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [c?.messages.length]);

  if (!c) return null;
  const quick = [
    t('It happened about three times this month.', 'මේ මාසයේ තුන් වතාවක් පමණ සිදු වුණා.'),
    t('I am safe right now.', 'මම දැන් ආරක්ෂිතයි.'),
    t('Please don’t contact my workplace yet.', 'කරුණාකර තවම මගේ සේවා ස්ථානය හා සම්බන්ධ වෙන්න එපා.'),
  ];
  const send = (v: string) => {
    if (!v.trim()) return;
    reply(c.id, v.trim());
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-10 bg-surface border-b border-line px-2 py-2 flex items-center gap-2">
        <button onClick={back} aria-label={t('Back', 'ආපසු')} className="h-11 w-11 grid place-items-center rounded-full hover:bg-mist text-navy"><ArrowLeft size={22} /></button>
        <span className="h-10 w-10 rounded-full bg-teal-50 text-teal-deep grid place-items-center"><ShieldCheck size={20} /></span>
        <div className="leading-tight">
          <p className="font-bold">{t('Independent reviewer', 'ස්වාධීන සමාලෝචක')} R-07</p>
          <p className="text-[13px] text-muted">{t('Replies within 2 working days', 'වැඩ කරන දින 2ක් ඇතුළත පිළිතුරු දෙයි')}</p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-3" aria-live="polite">
        <p className="mx-auto max-w-[85%] text-center text-[13px] text-muted flex items-start justify-center gap-1.5">
          <Lock size={13} className="mt-1 shrink-0" />
          {t('Messages are encrypted and disappear from this screen when you exit.', 'පණිවිඩ සංකේතනය කර ඇති අතර ඔබ පිටවූ විට මෙම තිරයෙන් අතුරුදහන් වේ.')}
        </p>
        {c.messages.map((m) => (
          <div key={m.id} className={cx('flex', m.from === 'reporter' ? 'justify-end' : 'justify-start')}>
            <div className={cx(
              'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[15px] animate-rise',
              m.from === 'reporter' && 'bg-navy text-white rounded-br-md',
              m.from === 'reviewer' && 'bg-surface border border-line rounded-bl-md',
              m.from === 'system' && 'bg-teal-50 text-ink rounded-bl-md',
            )}>
              {m.from === 'system' && <p className="text-[12px] font-bold text-teal-deep mb-0.5">{t('Suraki', 'සුරැකි')}</p>}
              <p className="whitespace-pre-wrap">{tb(m.text)}</p>
              <p className={cx('text-[11px] mt-1', m.from === 'reporter' ? 'text-white/70 text-right' : 'text-muted')}>{ago(m.at, lang)}</p>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="sticky bottom-0 bg-surface border-t border-line px-3 pt-2 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {quick.map((q) => (
            <button key={q} onClick={() => setText(q)} className="shrink-0 h-9 px-3 rounded-full border border-line text-sm text-navy font-medium bg-mist">{q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2">
          <label htmlFor="msg" className="sr-only">{t('Message', 'පණිවිඩය')}</label>
          <textarea id="msg" rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Write a message…', 'පණිවිඩයක් ලියන්න…')}
            className="flex-1 min-h-12 max-h-32 rounded-3xl border border-line bg-mist px-4 py-3 text-[16px] resize-none focus:outline-none focus:border-navy" />
          <button type="submit" aria-label={t('Send', 'යවන්න')} disabled={!text.trim()} className="h-12 w-12 rounded-full bg-navy text-white grid place-items-center disabled:bg-line disabled:text-muted shrink-0">
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
