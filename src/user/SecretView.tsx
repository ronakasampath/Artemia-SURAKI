import { useLayoutEffect, useRef, useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { useApp } from '../lib/store';
import { useT } from '../lib/i18n';
import { COVERS } from '../covers/meta';
import { COVER_COMPONENTS } from '../reporter/ReporterApp';
import { Button, cx, inputCls, toast } from '../components/ui';
import type { DisguiseId } from '../lib/types';

/** Only the user can choose the everyday app Suraki hides behind. Live previews of each one. */
export default function SecretView() {
  const { t, tb } = useT();
  const s = useApp((x) => x.settings);
  const setS = useApp((x) => x.set);
  const quickExit = useApp((x) => x.quickExit);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const pinOk = /^\d{4,6}$/.test(pin) && pin === pin2;
  const current = COVERS.find((c) => c.id === s.disguise)!;

  const choose = (id: DisguiseId) => {
    setS('disguise', id);
    const c = COVERS.find((x) => x.id === id)!;
    toast(t(`Now hidden as ${c.name.en}`, `දැන් ${c.name.si} ලෙස සැඟවී ඇත`));
  };

  return (
    <div className="px-4 pt-5 pb-10">
      <h1 className="text-[26px] font-bold leading-tight">{t('Secret view', 'රහස් පෙනුම')}</h1>
      <p className="text-muted mt-1 max-w-[60ch]">{t('Choose which everyday app Suraki pretends to be. The name, icon and browser tab change with it, and each one really works. Only you can change this.', 'සුරැකි පෙනී සිටිය යුතු එදිනෙදා යෙදුම තෝරන්න. නම, අයිකනය හා බ්‍රවුසර් ටැබය ද ඒ සමඟ වෙනස් වන අතර සෑම එකක්ම සැබවින්ම ක්‍රියා කරයි. මෙය වෙනස් කළ හැක්කේ ඔබට පමණි.')}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6" role="radiogroup" aria-label={t('Secret view', 'රහස් පෙනුම')}>
        {COVERS.map((c) => {
          const sel = s.disguise === c.id;
          const C = COVER_COMPONENTS[c.id];
          return (
            <button key={c.id} role="radio" aria-checked={sel} onClick={() => choose(c.id)}
              className={cx('rounded-card border-2 p-2.5 text-left flex flex-col gap-2 transition-colors', sel ? 'border-navy bg-navy-50' : 'border-line bg-surface hover:border-navy/30')}>
              <Scaled className="rounded-[14px] ring-1 ring-line">
                <C pin={'\u0000'} onUnlock={() => {}} />
              </Scaled>
              <span className="flex items-center gap-2">
                <img src={c.favicon} alt="" className="h-7 w-7 rounded-md" />
                <span className="font-bold leading-tight flex-1">{tb(c.name)}</span>
                {sel && <span className="h-6 w-6 rounded-full bg-navy text-white grid place-items-center"><Check size={14} strokeWidth={3} /></span>}
              </span>
              <span className="text-[13px] text-muted leading-snug tight">{tb(c.kind)}</span>
            </button>
          );
        })}
      </div>

      <section className="mt-6 rounded-card bg-teal-50 p-4">
        <p className="font-semibold text-teal-deep flex items-center gap-2"><KeyRound size={17} /> {t('To open Suraki from', 'මෙයින් සුරැකි විවෘත කිරීමට:')} {tb(current.name)}</p>
        <p className="mt-1">{tb(current.unlock)}.</p>
        <p className="mt-2 flex items-center gap-2">
          {t('Your PIN', 'ඔබේ PIN')}: <span className="font-mono font-bold tracking-[0.25em] text-navy">{showPin ? s.pin : '•'.repeat(s.pin.length)}</span>
          <button onClick={() => setShowPin(!showPin)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white" aria-label={showPin ? t('Hide PIN', 'PIN සඟවන්න') : t('Show PIN', 'PIN පෙන්වන්න')}>{showPin ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </p>
        <p className="text-sm text-muted mt-1">{t('A wrong PIN just works like the normal app, so nobody can tell anything is hidden.', 'වැරදි PIN එකක් සාමාන්‍ය යෙදුම ලෙසම ක්‍රියා කරයි. එබැවින් යමක් සඟවා ඇති බව කිසිවෙකුට දැනගත නොහැක.')}</p>
        <Button className="mt-3" variant="secondary" icon={<Lock size={16} />} onClick={quickExit}>{t('Lock now and see it', 'දැන් අගුළු දමා බලන්න')}</Button>
      </section>

      <section className="mt-6">
        <h2 className="font-bold text-[17px] mb-2">{t('Change PIN', 'PIN වෙනස් කරන්න')}</h2>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <input inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} type="password" placeholder={t('New PIN', 'නව PIN')} aria-label={t('New PIN, 4 to 6 digits', 'නව PIN, ඉලක්කම් 4-6')} className={inputCls} />
          <input inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} type="password" placeholder={t('Repeat PIN', 'PIN නැවත')} aria-label={t('Repeat new PIN', 'නව PIN නැවත')} className={inputCls} />
        </div>
        <p className="text-[13px] text-muted mt-1.5">{t('4 to 6 digits. Avoid your birthday or phone number.', 'ඉලක්කම් 4-6. ඔබේ උපන්දිනය හෝ දුරකථන අංකය භාවිතා නොකරන්න.')}</p>
        <Button className="mt-2" disabled={!pinOk} onClick={() => { setS('pin', pin); setPin(''); setPin2(''); toast(t('PIN changed', 'PIN වෙනස් කළා')); }}>{t('Change PIN', 'PIN වෙනස් කරන්න')}</Button>
      </section>
    </div>
  );
}

/** Shows a 390 × 700 screen shrunk to the width of its card. Not interactive. */
function Scaled({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [k, setK] = useState(0.4);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('inert', '');
    const ro = new ResizeObserver(() => setK(el.clientWidth / 390));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={ref} aria-hidden className={cx('block relative w-full aspect-[390/700] overflow-clip pointer-events-none select-none', className)}>
      <span className="absolute top-0 left-0 block origin-top-left" style={{ width: 390, height: 700, transform: `scale(${k})` }}>{children}</span>
    </span>
  );
}
