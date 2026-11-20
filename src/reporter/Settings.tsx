import { useState } from 'react';
import { Check, KeyRound, Trash2, VenetianMask, Type, Contrast, Languages, EyeOff } from 'lucide-react';
import { useApp } from '../lib/store';
import { useT } from '../lib/i18n';
import { COVERS } from '../covers/meta';
import { Button, Segmented, Toggle, cx, inputCls, toast } from '../components/ui';

export default function Settings({ web = false }: { web?: boolean }) {
  const { t, tb } = useT();
  const s = useApp((x) => x.settings);
  const setS = useApp((x) => x.set);
  const quickExit = useApp((x) => x.quickExit);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const pinOk = /^\d{4,6}$/.test(pin) && pin === pin2;

  const H = ({ i: I, children }: { i: typeof Check; children: React.ReactNode }) => (
    <h2 className="flex items-center gap-2 font-bold text-[17px] mt-7 mb-2"><I size={19} className="text-teal-deep" />{children}</h2>
  );

  return (
    <div className="px-4 pt-5 pb-10">
      <h1 className="text-[25px] font-bold leading-tight">{web ? t('Settings', 'සැකසුම්') : t('Privacy and display', 'පෞද්ගලිකත්වය හා පෙනුම')}</h1>

      {!web && (
        <>
      <H i={VenetianMask}>{t('How this app looks on your phone', 'ඔබේ දුරකථනයේ මෙම යෙදුම පෙනෙන ආකාරය')}</H>
      <p className="text-muted text-[15px] mb-3">{t('Pick an everyday app to hide behind. Its name and icon change too. Each one really works.', 'සැඟවීමට එදිනෙදා යෙදුමක් තෝරන්න. නම හා අයිකනයද වෙනස් වේ. සෑම එකක්ම සැබවින්ම ක්‍රියා කරයි.')}</p>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t('Cover app', 'ආවරණ යෙදුම')}>
        {COVERS.map((c) => {
          const sel = s.disguise === c.id;
          return (
            <button key={c.id} role="radio" aria-checked={sel}
              onClick={() => { setS('disguise', c.id); toast(t(`Now showing as ${c.name.en}`, `දැන් පෙනෙන්නේ ${c.name.si} ලෙසයි`)); }}
              className={cx('relative rounded-card border-2 p-3 text-left flex flex-col gap-2 transition-colors', sel ? 'border-navy bg-navy-50' : 'border-line bg-surface')}>
              <img src={c.favicon} alt="" className="h-12 w-12 rounded-[12px]" />
              <span className="font-bold leading-tight">{tb(c.name)}</span>
              <span className="text-[13px] text-muted leading-snug tight">{tb(c.kind)}</span>
              {sel && <span className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-navy text-white grid place-items-center"><Check size={14} strokeWidth={3} /></span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-card bg-teal-50 p-3.5 text-[15px]">
        <p className="font-semibold text-teal-deep">{t('To open Suraki again', 'සුරැකි නැවත විවෘත කිරීමට')}</p>
        <p>{tb(COVERS.find((c) => c.id === s.disguise)!.unlock)}.</p>
        <p className="text-sm text-muted mt-1">{t('A wrong PIN just works like the normal app, so nobody can tell anything is hidden.', 'වැරදි PIN එකක් සාමාන්‍ය යෙදුම ලෙසම ක්‍රියා කරයි. එබැවින් යමක් සඟවා ඇති බව කිසිවෙකුට දැනගත නොහැක.')}</p>
      </div>

      <H i={KeyRound}>{t('Secret PIN', 'රහස් PIN අංකය')}</H>
      <div className="grid grid-cols-2 gap-2">
        <input inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} type="password" placeholder={t('New PIN', 'නව PIN')} aria-label={t('New PIN, 4 to 6 digits', 'නව PIN, ඉලක්කම් 4-6')} className={inputCls} />
        <input inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} type="password" placeholder={t('Repeat PIN', 'PIN නැවත')} aria-label={t('Repeat new PIN', 'නව PIN නැවත')} className={inputCls} />
      </div>
      <p className="text-[13px] text-muted mt-1.5">{t('4 to 6 digits. Avoid your birthday or phone number.', 'ඉලක්කම් 4-6. ඔබේ උපන්දිනය හෝ දුරකථන අංකය භාවිතා නොකරන්න.')}</p>
      <Button className="mt-2" variant="secondary" disabled={!pinOk} onClick={() => { setS('pin', pin); setPin(''); setPin2(''); toast(t('PIN changed', 'PIN වෙනස් කළා')); }}>{t('Change PIN', 'PIN වෙනස් කරන්න')}</Button>

        </>
      )}

      <H i={Languages}>{t('Language', 'භාෂාව')}</H>
      <Segmented label={t('Language', 'භාෂාව')} value={s.lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිංහල' }, { v: 'en', l: 'English' }]} />
      <p className="text-[13px] text-muted mt-1.5">{t('Tamil is planned for the next version.', 'දෙමළ භාෂාව ඊළඟ සංස්කරණයේ.')}</p>

      <H i={Type}>{t('Text size', 'අකුරු ප්‍රමාණය')}</H>
      <Segmented label={t('Text size', 'අකුරු ප්‍රමාණය')} value={String(s.textScale) as '0' | '1' | '2'} onChange={(v) => setS('textScale', Number(v) as 0 | 1 | 2)}
        options={[{ v: '0', l: <span className="text-[13px]">A</span>, aria: t('Normal', 'සාමාන්‍ය') }, { v: '1', l: <span className="text-[16px]">A</span>, aria: t('Large', 'විශාල') }, { v: '2', l: <span className="text-[19px]">A</span>, aria: t('Largest', 'ඉතා විශාල') }]} />

      <H i={Contrast}>{t('Seeing and moving', 'දර්ශනය හා චලනය')}</H>
      <div className="rounded-card bg-surface border border-line px-4 divide-y divide-line">
        <Toggle checked={s.contrast} onChange={(v) => setS('contrast', v)} label={t('Stronger contrast', 'වැඩි වර්ණ වෙනස')} hint={t('Darker text and thicker borders', 'තද අකුරු හා ඝන මායිම්')} />
        <Toggle checked={s.reduceMotion} onChange={(v) => setS('reduceMotion', v)} label={t('Reduce motion', 'චලනය අඩු කරන්න')} hint={t('Turn off sliding and pulsing', 'ලිස්සන හා ස්පන්දන සජීවීකරණ නවත්වන්න')} />
      </div>

      <H i={EyeOff}>{t('Leaving quickly', 'ඉක්මනින් පිටවීම')}</H>
      <div className={cx('rounded-card bg-surface border border-line px-4', web && 'hidden')}>
        <Toggle checked={s.remember} onChange={(v) => setS('remember', v)} label={t('Remember my report on this phone', 'මගේ පැමිණිල්ල මෙම දුරකථනයේ මතක තබාගන්න')} hint={t('Off by default. Turn off if your phone is shared.', 'පෙරනිමියෙන් අක්‍රියයි. දුරකථනය බෙදා ගන්නේ නම් අක්‍රිය කරන්න.')} />
      </div>
      <p className="text-[15px] mt-3">{t('Tap Exit at the top at any time. On a computer, press Esc twice.', 'ඕනෑම වෙලාවක ඉහළ ඇති “පිටවන්න” ඔබන්න. පරිගණකයක නම් Esc දෙවරක් ඔබන්න.')}</p>
      <Button className="mt-4" block variant="danger-outline" size="lg" icon={<Trash2 size={18} />} onClick={() => { setS('remember', false); useApp.setState({ saved: undefined }); quickExit(); }}>
        {t('Clear everything and exit', 'සියල්ල මකා පිටවන්න')}
      </Button>
    </div>
  );
}
