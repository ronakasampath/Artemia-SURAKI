import { useState } from 'react';
import { Check, Copy, EyeOff, PencilLine } from 'lucide-react';
import { useApp } from '../lib/store';
import { useNav } from '../lib/nav';
import { useT } from '../lib/i18n';
import { Button, Thread, Toggle, toast } from '../components/ui';

export default function Done() {
  const { t } = useT();
  const last = useApp((s) => s.session.lastSubmitted ?? s.session.activeCase);
  const remember = useApp((s) => s.settings.remember);
  const setS = useApp((s) => s.set);
  const go = useApp((s) => s.go);
  const web = useNav((s) => s.route) === 'user';
  const [show, setShow] = useState(true);
  if (!last) return null;

  const copy = (v: string) => {
    try { navigator.clipboard?.writeText(v); } catch { /* clipboard may be blocked */ }
    toast(t('Copied. Paste it somewhere private.', 'පිටපත් කළා. පෞද්ගලික තැනක අලවන්න.'));
  };

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="flex flex-col items-center text-center">
        <span className="h-16 w-16 rounded-full bg-teal text-white grid place-items-center animate-rise"><Check size={34} strokeWidth={3} /></span>
        <h1 className="text-[25px] font-bold leading-tight mt-4">{t('Your report is safely with us', 'ඔබේ පැමිණිල්ල ආරක්ෂිතව අපට ලැබුණා')}</h1>
        <p className="text-muted mt-1 max-w-[30ch]">{t('Thank you for speaking up. You did the hard part.', 'කතා කළාට ස්තූතියි. අමාරුම කොටස ඔබ කළා.')}</p>
      </div>

      <section className="mt-6 rounded-card bg-surface border-2 border-navy p-4" aria-labelledby="keys">
        <div className="flex items-center justify-between">
          <h2 id="keys" className="font-bold">{t('Keep these to check your report', 'පැමිණිල්ල බැලීමට මේවා තබාගන්න')}</h2>
          <button onClick={() => setShow(!show)} className="text-sm font-semibold text-teal-deep flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-teal-50">
            <EyeOff size={15} /> {show ? t('Hide', 'සඟවන්න') : t('Show', 'පෙන්වන්න')}
          </button>
        </div>
        {[
          { l: t('Reference', 'යොමු අංකය'), v: last.ref },
          { l: t('Access code', 'ප්‍රවේශ කේතය'), v: last.code },
        ].map((r) => (
          <div key={r.l} className="mt-3 flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[13px] text-muted font-semibold">{r.l}</p>
              <p className="font-mono text-[22px] tracking-wider font-bold text-navy">{show ? r.v : '••••-••••'}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => copy(r.v)} icon={<Copy size={15} />}>{t('Copy', 'පිටපත්')}</Button>
          </div>
        ))}
        <p className="mt-3 text-sm text-muted flex gap-2"><PencilLine size={16} className="shrink-0 mt-0.5" />{t('Write them down somewhere private. Avoid screenshots if someone checks your phone.', 'පෞද්ගලික තැනක ලියා තබාගන්න. කවුරුහරි ඔබේ දුරකථනය පරීක්ෂා කරනවා නම් තිර රූප ගන්න එපා.')}</p>
        <div className={web ? 'hidden' : 'border-t border-line mt-3'}>
          <Toggle checked={remember} onChange={(v) => setS('remember', v)}
            label={t('Remember on this phone', 'මෙම දුරකථනයේ මතක තබාගන්න')}
            hint={t('Kept behind your PIN. Turn off if your phone is shared.', 'ඔබේ PIN එක පිටුපස තබයි. දුරකථනය බෙදා ගන්නේ නම් අක්‍රිය කරන්න.')} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-bold mb-3">{t('What happens next', 'ඊළඟට සිදුවන දේ')}</h2>
        <Thread steps={[
          { key: 'a', state: 'done', title: t('Report received', 'පැමිණිල්ල ලැබුණා'), when: t('Just now', 'දැන්') },
          { key: 'b', state: 'current', title: t('An independent reviewer reads it', 'ස්වාධීන සමාලෝචකයෙක් එය කියවයි'), when: t('Within 2 working days', 'වැඩ කරන දින 2ක් ඇතුළත') },
          { key: 'c', state: 'next', title: t('You may get questions here', 'ඔබට මෙහි ප්‍රශ්න ලැබිය හැකියි'), detail: t('Only inside this app. Never by SMS.', 'මෙම යෙදුම තුළ පමණි. SMS මඟින් නොවේ.') },
          { key: 'd', state: 'next', title: t('Support, referral or action', 'සහාය, යොමු කිරීම හෝ ක්‍රියාමාර්ග'), detail: t('The organisation is only contacted after safety checks.', 'ආරක්ෂක පරීක්ෂාවෙන් පසුව පමණක් ආයතනය හා සම්බන්ධ වේ.') },
        ]} />
      </section>

      <div className="grid gap-2 mt-7">
        <Button size="lg" onClick={() => go('case', { replace: true })}>{t('See my report', 'මගේ පැමිණිල්ල බලන්න')}</Button>
        <Button size="lg" variant="ghost" onClick={() => go('home', { replace: true })}>{t('Done', 'අවසන්')}</Button>
      </div>
    </div>
  );
}
