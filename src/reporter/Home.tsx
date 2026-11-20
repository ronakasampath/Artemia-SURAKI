import { Building2, ChevronRight, KeyRound, LifeBuoy, PenLine, Phone, ShieldCheck, VenetianMask } from 'lucide-react';
import { useApp } from '../lib/store';
import { STATUS_PLAIN, useT } from '../lib/i18n';
import { coverById } from '../covers/meta';
import { Pill, cx } from '../components/ui';

export default function Home() {
  const { t, tb } = useT();
  const go = useApp((s) => s.go);
  const active = useApp((s) => s.session.activeCase ?? s.saved);
  const cases = useApp((s) => s.cases);
  const disguise = useApp((s) => s.settings.disguise);
  const c = active ? cases.find((x) => x.ref === active.ref) : undefined;
  const hour = new Date().getHours();
  const greet = hour < 12 ? t('Good morning', 'සුභ උදෑසනක්') : hour < 18 ? t('Good afternoon', 'සුභ දහවලක්') : t('Good evening', 'සුභ සන්ධ්‍යාවක්');

  return (
    <div className="px-4 pt-5 pb-8 space-y-5">
      <section>
        <p className="text-muted text-[15px]">{greet}</p>
        <h1 className="text-[26px] font-bold leading-tight mt-0.5 text-ink">{t('You’re in a private space.', 'මෙය ඔබේ පෞද්ගලික අවකාශයයි.')}</h1>
        <p className="text-muted mt-1.5">{t('Nothing here leaves this phone unless you choose to send it.', 'ඔබ යවන්න තීරණය කරන තුරු මෙහි කිසිවක් මෙම දුරකථනයෙන් පිටතට යන්නේ නැහැ.')}</p>
      </section>

      <section aria-labelledby="danger" className="rounded-card bg-surface border border-line hc-border p-4 relative overflow-clip">
        <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-sos" />
        <h2 id="danger" className="font-bold text-[16px]">{t('In danger right now?', 'දැන් අනතුරක සිටිනවාද?')}</h2>
        <p className="text-sm text-muted">{t('Calls go straight from your phone. They are not recorded here.', 'ඇමතුම් ඔබේ දුරකථනයෙන් කෙලින්ම යයි. මෙහි සටහන් වෙන්නේ නැහැ.')}</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <a href="tel:119" className="min-h-12 rounded-btn bg-sos text-white font-bold flex items-center justify-center gap-2">
            <Phone size={18} aria-hidden /> {t('Police 119', 'පොලිසිය 119')}
          </a>
          <a href="tel:1938" className="min-h-12 rounded-btn bg-surface border border-line hc-border text-navy font-bold flex items-center justify-center gap-2 text-center leading-tight px-2">
            <Phone size={18} aria-hidden /> {t('Helpline 1938', 'සහාය 1938')}
          </a>
        </div>
      </section>

      <button
        onClick={() => go('report')}
        className="w-full text-left rounded-card bg-navy text-white p-5 flex items-start gap-4 shadow-lift active:scale-[.99] transition-transform"
      >
        <span className="h-12 w-12 rounded-full bg-white/15 grid place-items-center shrink-0">
          <PenLine size={22} aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block text-[19px] font-bold leading-snug">{t('Make a confidential report', 'රහසිගතව පැමිණිලි කරන්න')}</span>
          <span className="block text-white/80 text-[15px] mt-1">{t('About 5 minutes. No name needed. You can stop at any time.', 'මිනිත්තු 5ක් පමණ. නම අවශ්‍ය නැහැ. ඕනෑම වෙලාවක නවත්වන්න පුළුවන්.')}</span>
        </span>
        <ChevronRight className="mt-3 shrink-0" aria-hidden />
      </button>

      {c && (
        <button onClick={() => go('case')} className="w-full text-left rounded-card bg-surface border border-line hc-border p-4 flex items-center gap-3">
          <span className="relative h-11 w-11 rounded-full bg-teal-50 text-teal-deep grid place-items-center shrink-0">
            <ShieldCheck size={22} aria-hidden />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm text-muted">{t('Your report', 'ඔබේ පැමිණිල්ල')} <span className="font-mono tracking-wide">{c.ref}</span></span>
            <span className="block font-semibold leading-snug">{tb(STATUS_PLAIN[c.status])}</span>
          </span>
          {c.reporterUnread > 0 && <Pill tone="teal">{c.reporterUnread} {t('new', 'නව')}</Pill>}
          <ChevronRight className="text-muted shrink-0" aria-hidden />
        </button>
      )}

      <nav aria-label={t('More', 'තවත්')} className="rounded-card bg-surface border border-line hc-border divide-y divide-line overflow-clip">
        {[
          { i: KeyRound, l: t('Check a report', 'පැමිණිල්ලක තත්ත්වය බලන්න'), d: t('Use your reference and access code', 'යොමු අංකය හා ප්‍රවේශ කේතය භාවිතා කරන්න'), on: () => go('track') },
          { i: Building2, l: t('Organisation directory', 'ආයතන නාමාවලිය'), d: t('Official notices and fixes, not rumours', 'නිල නිවේදන හා නිවැරදි කිරීම් පමණි'), on: () => go('directory') },
          { i: LifeBuoy, l: t('Support and your rights', 'සහාය හා ඔබේ අයිතිවාසිකම්'), d: t('Counselling, legal help, safety planning', 'උපදේශනය, නීති සහාය, ආරක්ෂක සැලසුම්'), on: () => go('help') },
          { i: VenetianMask, l: t('How this app hides', 'මෙම යෙදුම සැඟවෙන ආකාරය'), d: `${t('Showing as', 'පෙනෙන්නේ')}: ${tb(coverById(disguise).name)}`, on: () => go('settings') },
        ].map((r) => (
          <button key={r.l} onClick={r.on} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-mist">
            <span className={cx('h-10 w-10 rounded-full grid place-items-center shrink-0 bg-navy-50 text-navy')}>
              <r.i size={19} aria-hidden />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold leading-snug">{r.l}</span>
              <span className="block text-sm text-muted leading-snug">{r.d}</span>
            </span>
            <ChevronRight size={18} className="text-muted shrink-0" aria-hidden />
          </button>
        ))}
      </nav>

      <p className="text-[13px] text-muted text-center px-6">{t('Prototype for Artemia 2.0. All people, cases and organisations are fictional.', 'Artemia 2.0 සඳහා මූලාකෘතියකි. සියලු පුද්ගලයින්, සිද්ධි හා ආයතන කල්පිතයි.')}</p>
    </div>
  );
}
