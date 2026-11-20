import { ChevronRight, MessageSquare, PenLine, Phone, VenetianMask } from 'lucide-react';
import { useApp } from '../lib/store';
import { CATEGORY, STATUS_PLAIN, ago, useT } from '../lib/i18n';
import { coverById } from '../covers/meta';
import { Pill } from '../components/ui';
import MiniThread from './MiniThread';

export default function UserHome() {
  const { t, tb, lang } = useT();
  const go = useApp((s) => s.go);
  const openCase = useApp((s) => s.openCase);
  const cases = useApp((s) => s.cases);
  const orgs = useApp((s) => s.orgs);
  const disguise = useApp((s) => s.settings.disguise);
  const mine = cases.filter((c) => c.mine).sort((a, b) => b.createdAt - a.createdAt);
  const waiting = mine.filter((c) => c.status === 'awaiting_reporter' || c.reporterUnread > 0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? t('Good morning', 'සුභ උදෑසනක්') : hour < 18 ? t('Good afternoon', 'සුභ දහවලක්') : t('Good evening', 'සුභ සන්ධ්‍යාවක්');
  const open = (ref: string, code: string, screen: 'case' | 'messages' = 'case') => { openCase(ref, code); go(screen); };
  const cover = coverById(disguise);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
      <section>
        <p className="text-muted">{greet}</p>
        <h1 className="text-[28px] md:text-[32px] font-bold leading-tight">{t('You’re in a private space.', 'මෙය ඔබේ පෞද්ගලික අවකාශයයි.')}</h1>
        <p className="text-muted mt-1 max-w-[60ch]">{t('Nothing here is shared unless you choose to send it. Exit at the top hides everything instantly.', 'ඔබ යවන්න තීරණය නොකරන තුරු මෙහි කිසිවක් බෙදා නොගැනේ. ඉහළ ඇති “පිටවන්න” සියල්ල ක්ෂණිකව සඟවයි.')}</p>
      </section>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <button onClick={() => go('report')} className="text-left rounded-card bg-navy text-white p-6 flex items-start gap-4 shadow-lift hover:bg-navy-700 transition-colors">
          <span className="h-12 w-12 rounded-full bg-white/15 grid place-items-center shrink-0"><PenLine size={22} /></span>
          <span className="flex-1">
            <span className="block text-[21px] font-bold leading-snug">{t('Make a confidential complaint', 'රහසිගත පැමිණිල්ලක් කරන්න')}</span>
            <span className="block text-white/80 mt-1">{t('About 5 minutes. No name needed. Nothing is sent until you press Send.', 'මිනිත්තු 5ක් පමණ. නම අවශ්‍ය නැහැ. “යවන්න” ඔබන තුරු කිසිවක් යන්නේ නැහැ.')}</span>
          </span>
          <ChevronRight className="mt-3 shrink-0" />
        </button>
        <section aria-labelledby="danger" className="rounded-card bg-surface border border-line hc-border p-5 relative overflow-clip">
          <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-sos" />
          <h2 id="danger" className="font-bold text-[17px]">{t('In danger right now?', 'දැන් අනතුරක සිටිනවාද?')}</h2>
          <p className="text-sm text-muted">{t('Calls go straight from your phone and are not recorded here.', 'ඇමතුම් ඔබේ දුරකථනයෙන් කෙලින්ම යන අතර මෙහි සටහන් නොවේ.')}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <a href="tel:119" className="min-h-12 rounded-btn bg-sos text-white font-bold flex items-center justify-center gap-2"><Phone size={18} /> {t('Police 119', 'පොලිසිය 119')}</a>
            <a href="tel:1938" className="min-h-12 rounded-btn bg-surface border border-line text-navy font-bold flex items-center justify-center gap-2"><Phone size={18} /> {t('Helpline 1938', 'සහාය 1938')}</a>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <section className="rounded-card bg-surface border border-line">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
            <h2 className="font-bold text-[17px]">{t('Your complaints', 'ඔබේ පැමිණිලි')}</h2>
            <button onClick={() => go('complaints')} className="text-sm font-semibold text-teal-deep flex items-center hover:underline">{t('See all', 'සියල්ල')} <ChevronRight size={16} /></button>
          </div>
          {mine.length === 0 ? (
            <p className="px-5 py-8 text-muted text-center">{t('You haven’t made a complaint yet.', 'ඔබ තවම පැමිණිල්ලක් කර නැත.')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {mine.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button onClick={() => open(c.ref, c.code)} className="w-full text-left px-5 py-3.5 hover:bg-mist flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="flex-1 min-w-[200px]">
                      <span className="block font-semibold leading-snug">{tb(CATEGORY[c.category])} <span className="text-muted font-normal">· {tb(orgs.find((o) => o.id === c.orgId)?.name) || t('Not named', 'නම් කර නැත')}</span></span>
                      <span className="block text-[13px] text-muted"><span className="font-mono">{c.ref}</span> · {ago(c.createdAt, lang)}</span>
                    </span>
                    <span className="flex flex-col items-start gap-1">
                      <MiniThread status={c.status} label={tb(STATUS_PLAIN[c.status])} />
                      <span className="text-[13px] text-ink">{tb(STATUS_PLAIN[c.status])}</span>
                    </span>
                    {c.reporterUnread > 0 && <Pill tone="teal">{c.reporterUnread} {t('new', 'නව')}</Pill>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-card bg-surface border border-line p-5">
            <h2 className="font-bold text-[17px] flex items-center gap-2"><MessageSquare size={18} className="text-teal-deep" /> {t('Waiting for you', 'ඔබ බලාපොරොත්තුවෙන්')}</h2>
            {waiting.length === 0 ? (
              <p className="text-muted text-[15px] mt-2">{t('No new messages.', 'නව පණිවිඩ නැත.')}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {waiting.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => open(c.ref, c.code, 'messages')} className="w-full text-left rounded-xl bg-teal-50 px-3.5 py-2.5 hover:brightness-[.98]">
                      <span className="block font-semibold text-[15px]">{c.status === 'awaiting_reporter' ? t('Your reviewer asked a question', 'ඔබේ සමාලෝචකයා ප්‍රශ්නයක් ඇසුවා') : t('New update on your complaint', 'ඔබේ පැමිණිල්ලට නව යාවත්කාලීනයක්')}</span>
                      <span className="block text-[13px] text-muted font-mono">{c.ref}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-card bg-surface border border-line p-5 flex items-center gap-4">
            <img src={cover.favicon} alt="" className="h-12 w-12 rounded-[12px]" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-muted font-semibold flex items-center gap-1.5"><VenetianMask size={14} /> {t('Secret view', 'රහස් පෙනුම')}</p>
              <p className="font-bold">{tb(cover.name)}</p>
            </div>
            <button onClick={() => go('secret')} className="text-sm font-semibold text-teal-deep px-3 py-2 rounded-lg hover:bg-teal-50">{t('Change', 'වෙනස් කරන්න')}</button>
          </section>
        </div>
      </div>
    </div>
  );
}
