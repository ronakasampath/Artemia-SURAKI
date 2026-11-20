import { MessageSquare, ShieldCheck } from 'lucide-react';
import { useApp } from '../lib/store';
import { CATEGORY, ago, pick, useT } from '../lib/i18n';
import { Pill, cx } from '../components/ui';

/** All secure conversations, one per complaint, newest first. */
export default function Inbox() {
  const { t, tb, lang } = useT();
  const cases = useApp((s) => s.cases);
  const orgs = useApp((s) => s.orgs);
  const openCase = useApp((s) => s.openCase);
  const go = useApp((s) => s.go);
  const threads = cases
    .filter((c) => c.mine && c.messages.length)
    .map((c) => ({ c, last: c.messages[c.messages.length - 1] }))
    .sort((a, b) => b.last.at - a.last.at);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <h1 className="text-[28px] font-bold leading-tight">{t('Messages', 'පණිවිඩ')}</h1>
      <p className="text-muted">{t('Private conversations with your independent reviewer. They disappear from the screen when you exit.', 'ඔබේ ස්වාධීන සමාලෝචකයා සමඟ පෞද්ගලික සංවාද. ඔබ පිටවූ විට ඒවා තිරයෙන් අතුරුදහන් වේ.')}</p>
      {threads.length === 0 ? (
        <div className="mt-6 rounded-card border-2 border-dashed border-line bg-surface p-10 text-center">
          <MessageSquare size={30} className="mx-auto text-muted" />
          <p className="font-bold mt-2">{t('No messages yet', 'තවම පණිවිඩ නැත')}</p>
        </div>
      ) : (
        <ul className="mt-6 rounded-card bg-surface border border-line divide-y divide-line overflow-clip">
          {threads.map(({ c, last }) => (
            <li key={c.id}>
              <button onClick={() => { openCase(c.ref, c.code); go('messages'); }} className={cx('w-full text-left px-5 py-4 flex gap-4 items-start hover:bg-mist', c.reporterUnread > 0 && 'bg-teal-50/50')}>
                <span className="h-11 w-11 rounded-full bg-teal-50 text-teal-deep grid place-items-center shrink-0"><ShieldCheck size={21} /></span>
                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className={cx('font-semibold', c.reporterUnread > 0 && 'font-bold')}>{tb(CATEGORY[c.category])}</span>
                    <span className="text-muted text-[14px]">· {tb(orgs.find((o) => o.id === c.orgId)?.name) || t('Not named', 'නම් කර නැත')}</span>
                  </span>
                  <span className="block text-[15px] text-muted truncate mt-0.5">
                    {last.from === 'reporter' ? t('You: ', 'ඔබ: ') : last.from === 'reviewer' ? t('Reviewer: ', 'සමාලෝචක: ') : ''}{pick(last.text, lang)}
                  </span>
                  <span className="block text-[12px] text-muted font-mono mt-0.5">{c.ref}</span>
                </span>
                <span className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[13px] text-muted">{ago(last.at, lang)}</span>
                  {c.reporterUnread > 0 && <Pill tone="teal">{c.reporterUnread}</Pill>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
