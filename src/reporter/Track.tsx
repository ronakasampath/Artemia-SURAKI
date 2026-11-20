import { useState } from 'react';
import { KeyRound, Info, ChevronRight } from 'lucide-react';
import { useApp } from '../lib/store';
import { CATEGORY, STATUS_PLAIN, useT } from '../lib/i18n';
import { Button, Field, inputCls, cx } from '../components/ui';

export default function Track() {
  const { t, tb } = useT();
  const allCases = useApp((s) => s.cases);
  const isUser = useApp((s) => s.auth?.role === 'user');
  const mine = isUser ? allCases.filter((c) => c.mine) : [];
  const known = useApp((s) => s.session.activeCase ?? s.saved);
  const openCase = useApp((s) => s.openCase);
  const go = useApp((s) => s.go);
  const [ref, setRef] = useState(known?.ref ?? '');
  const [code, setCode] = useState(known?.code ?? '');
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = openCase(ref, code);
    if (!c) return setErr(true);
    setErr(false);
    go('case');
  };

  return (
    <form onSubmit={submit} className="px-4 pt-6 pb-8">
      <span className="h-14 w-14 rounded-2xl bg-navy-50 text-navy grid place-items-center"><KeyRound size={26} /></span>
      <h1 className="text-[25px] font-bold leading-tight mt-4">{t('Check your report', 'ඔබේ පැමිණිල්ල බලන්න')}</h1>
      <p className="text-muted mt-1">{t('Use the reference and access code you got when you sent it.', 'පැමිණිල්ල යැවූ විට ලැබුණු යොමු අංකය හා ප්‍රවේශ කේතය භාවිතා කරන්න.')}</p>

      {mine.length > 0 && (
        <section className="mt-5" aria-labelledby="yours">
          <h2 id="yours" className="font-bold mb-2">{t('Your reports', 'ඔබේ පැමිණිලි')}</h2>
          <ul className="rounded-card bg-surface border border-line divide-y divide-line overflow-clip">
            {mine.sort((a, b) => b.createdAt - a.createdAt).map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => { openCase(c.ref, c.code); go('case'); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-mist">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold leading-snug">{tb(CATEGORY[c.category])}</span>
                    <span className="block text-[13px] text-muted">{tb(STATUS_PLAIN[c.status])}</span>
                  </span>
                  {c.reporterUnread > 0 && <span className="text-[12px] font-bold rounded-full bg-teal-50 text-teal-deep px-2 py-0.5">{c.reporterUnread}</span>}
                  <ChevronRight size={18} className="text-muted" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-muted mt-4">{t('Or open a report with its codes:', 'නැතහොත් කේත මඟින් පැමිණිල්ලක් විවෘත කරන්න:')}</p>
        </section>
      )}

      <div className="space-y-4 mt-6">
        <Field id="ref" label={t('Reference', 'යොමු අංකය')}>
          <input id="ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="SRK-XXXX-XXXX" autoComplete="off" autoCapitalize="characters" spellCheck={false}
            className={cx(inputCls, 'font-mono tracking-wider uppercase', err && 'border-warn')} aria-invalid={err} />
        </Field>
        <Field id="code" label={t('Access code', 'ප්‍රවේශ කේතය')}>
          <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXX-XXX-XXX" autoComplete="off" spellCheck={false} type="password"
            className={cx(inputCls, 'font-mono tracking-wider uppercase', err && 'border-warn')} aria-invalid={err} />
        </Field>
        {err && (
          <p role="alert" className="text-warn font-semibold text-[15px]">{t('These don’t match a report. Check for typing mistakes, such as 0 and O.', 'මේවා කිසිදු පැමිණිල්ලකට නොගැළපේ. 0 හා O වැනි ටයිප් දෝෂ පරීක්ෂා කරන්න.')}</p>
        )}
      </div>

      <Button type="submit" block size="lg" className="mt-6" disabled={!ref || !code}>{t('Open my report', 'මගේ පැමිණිල්ල විවෘත කරන්න')}</Button>

      <div className="mt-6 rounded-card bg-surface border border-line p-4 flex gap-3 text-[15px]">
        <Info size={20} className="text-teal-deep shrink-0 mt-0.5" />
        <p>{t('Lost your code? Without it, nobody can open your report, not even us. You can make a new report and mention the old one.', 'කේතය නැති වුණාද? එය නැතිව කිසිවෙකුට, අපටවත්, ඔබේ පැමිණිල්ල විවෘත කළ නොහැක. නව පැමිණිල්ලක් කර පැරණි එක ගැන සඳහන් කළ හැකියි.')}</p>
      </div>
    </form>
  );
}
