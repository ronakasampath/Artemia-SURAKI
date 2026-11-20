import { useState } from 'react';
import { Building2, ChevronRight, CircleHelp, Eye, EyeOff, Globe, KeyRound, Landmark, LockKeyhole, Monitor, Smartphone, UserRound } from 'lucide-react';
import { useApp } from '../lib/store';
import { useNav, type Route } from '../lib/nav';
import { useT } from '../lib/i18n';
import { DEMO_ACCOUNTS } from '../data';
import type { AuthRole } from '../lib/types';
import { Button, Segmented, ThreadMark, cx, inputCls } from '../components/ui';

export default function Login({ notice }: { notice?: string }) {
  const { t, lang } = useT();
  const login = useApp((s) => s.login);
  const setS = useApp((s) => s.set);
  const pin = useApp((s) => s.settings.pin);
  const navigate = useNav((s) => s.navigate);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);

  const enter = (role: AuthRole, route?: Route) => {
    const a = DEMO_ACCOUNTS.find((x) => x.role === role)!;
    login({ role: a.role, id: a.id, name: a.name, orgId: a.orgId });
    // every sign-in starts each dashboard on its first page
    useNav.setState({ reviewer: { view: 'queue' }, org: { view: 'overview' }, admin: { view: 'access' }, dir: {} });
    navigate(route ?? ({ user: 'user', officer: 'officer', org: 'org', admin: 'admin' } as const)[role]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = DEMO_ACCOUNTS.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === pw);
    if (!a) return setErr(true);
    setErr(false);
    enter(a.role);
  };

  const demos: { role: AuthRole; route?: Route; i: typeof UserRound; title: string; sub: string; tag?: string }[] = [
    { role: 'user', i: Monitor, title: t('Demo user', 'ආදර්ශ පරිශීලක'), sub: t('Reports, messages and secret view, in the browser', 'පැමිණිලි, පණිවිඩ හා රහස් පෙනුම, බ්‍රවුසරයේ'), tag: `PIN ${pin}` },
    { role: 'user', route: 'mobile', i: Smartphone, title: t('Demo user · mobile view', 'ආදර්ශ පරිශීලක · ජංගම දසුන'), sub: t('Phone with home screen, back and recent apps', 'මුල් තිරය, ආපසු හා මෑත යෙදුම් සහිත දුරකථනය'), tag: `PIN ${pin}` },
    { role: 'officer', i: Landmark, title: t('Demo government officer', 'ආදර්ශ රජයේ නිලධාරී'), sub: t('Review reports, refer, issue notices, publish', 'පැමිණිලි සමාලෝචනය, යොමු කිරීම, නිවේදන, ප්‍රකාශනය') },
    { role: 'org', i: Building2, title: t('Demo organisation', 'ආදර්ශ ආයතනය'), sub: t('Example Company A: respond to notices, fix problems', 'උදාහරණ සමාගම A: නිවේදනවලට පිළිතුරු, ගැටලු නිවැරදි කිරීම') },
    { role: 'admin', i: KeyRound, title: t('Demo admin', 'ආදර්ශ පරිපාලක'), sub: t('Accounts, organisations, access rules', 'ගිණුම්, ආයතන, ප්‍රවේශ නීති') },
  ];

  return (
    <div lang={lang} className="min-h-[100dvh] h-[100dvh] overflow-y-auto grid lg:grid-cols-[minmax(380px,44%)_1fr] bg-surface">
      {/* Brand side */}
      <section className="relative bg-navy text-white px-8 py-10 lg:px-14 lg:py-14 flex flex-col overflow-clip">
        <div className="flex items-center gap-3">
          <ThreadMark size={44} />
          <div className="leading-tight">
            <p className="text-[22px] font-bold">SURAKI</p>
            <p lang="si" className="font-si text-[18px] font-bold text-[#7fd1c8]">සුරැකි</p>
          </div>
        </div>
        <div className="mt-10 lg:mt-auto">
          <h1 className="text-[30px] lg:text-[38px] font-bold leading-tight max-w-[18ch]">
            {t('Report safely. Be heard. See it handled.', 'ආරක්ෂිතව පැමිණිලි කරන්න. ඔබේ හඬට සවන් දෙයි. ක්‍රියාමාර්ග දකින්න.')}
          </h1>
          <p className="text-white/75 mt-4 max-w-[46ch] text-[16px]">
            {t('A confidential way for women to report harassment, reviewed independently and followed through to a public record.', 'කාන්තාවන්ට හිරිහැර රහසිගතව වාර්තා කිරීමට, ස්වාධීනව සමාලෝචනය කර පොදු වාර්තාවක් දක්වා පසු විපරම් කරන මාර්ගයක්.')}
          </p>
        </div>
        <ol className="mt-10 lg:mb-auto flex items-start max-w-[520px]" aria-label={t('How a report moves', 'පැමිණිල්ලක ගමන')}>
          {[t('Report', 'පැමිණිල්ල'), t('Review', 'සමාලෝචනය'), t('Action', 'ක්‍රියාමාර්ග'), t('Record', 'වාර්තාව')].map((l, i, a) => (
            <li key={l} className="flex-1 flex flex-col items-start">
              <div className="flex items-center w-full">
                <span className={cx('h-4 w-4 rounded-full shrink-0', i === 0 ? 'bg-[#7fd1c8]' : i === a.length - 1 ? 'bg-white' : 'border-[3px] border-white bg-navy')} />
                {i < a.length - 1 && <span className="h-[3px] flex-1 bg-[#7fd1c8]/70" />}
              </div>
              <span className="text-[13px] text-white/80 mt-2">{l}</span>
            </li>
          ))}
        </ol>
        <p className="text-[12px] text-white/50 mt-10">{t('Prototype for Artemia 2.0 · team atomicIR · all data is fictional', 'Artemia 2.0 මූලාකෘතිය · atomicIR කණ්ඩායම · සියලු දත්ත කල්පිතයි')}</p>
      </section>

      {/* Sign-in side */}
      <section className="px-6 py-8 lg:px-16 lg:py-10 flex flex-col">
        <div className="flex items-center justify-end gap-2">
          <a href="#/guide" className="h-10 px-3 rounded-full flex items-center gap-1.5 text-sm font-semibold text-navy hover:bg-mist">
            <CircleHelp size={17} /> {t('How to use', 'භාවිතා කරන ආකාරය')}
          </a>
          <Segmented size="sm" label={t('Language', 'භාෂාව')} value={lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිංහල' }, { v: 'en', l: 'English' }]} />
        </div>

        <div className="w-full max-w-[460px] mx-auto my-auto pt-8">
          <h2 className="text-[28px] font-bold leading-tight">{t('Sign in', 'පිවිසෙන්න')}</h2>
          <p className="text-muted mt-1">{t('Choose a demo account to continue.', 'ඉදිරියට යාමට ආදර්ශ ගිණුමක් තෝරන්න.')}</p>
          {notice && <p role="status" className="mt-4 rounded-btn bg-warn-50 text-ink px-4 py-3 text-[15px]">{notice}</p>}

          <ul className="space-y-2 mt-6">
            {demos.map((d) => (
              <li key={d.title}>
                <button onClick={() => enter(d.role, d.route)} className="w-full text-left rounded-card border border-line hc-border bg-surface hover:border-navy/40 hover:bg-mist px-4 py-3 flex items-center gap-3 transition-colors">
                  <span className="h-10 w-10 rounded-full bg-navy-50 text-navy grid place-items-center shrink-0"><d.i size={19} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-2 font-bold leading-snug">{d.title}{d.tag && <span className="text-[12px] font-mono font-semibold rounded-full bg-teal-50 text-teal-deep px-2 py-0.5">{d.tag}</span>}</span>
                    <span className="block text-[14px] text-muted leading-snug">{d.sub}</span>
                  </span>
                  <ChevronRight size={18} className="text-muted shrink-0" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 my-6 text-[13px] text-muted font-semibold">
            <span className="h-px flex-1 bg-line" />{t('or use email and password', 'නැතහොත් ඊමේල් හා මුරපදය')}<span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label htmlFor="em" className="block font-semibold text-[15px] mb-1.5">{t('Email', 'ඊමේල්')}</label>
              <input id="em" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="officer@suraki.demo" className={cx(inputCls, err && 'border-warn')} aria-invalid={err} />
            </div>
            <div>
              <label htmlFor="pw" className="block font-semibold text-[15px] mb-1.5">{t('Password', 'මුරපදය')}</label>
              <div className="relative">
                <input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={cx(inputCls, 'pr-12', err && 'border-warn')} aria-invalid={err} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? t('Hide password', 'මුරපදය සඟවන්න') : t('Show password', 'මුරපදය පෙන්වන්න')} className="absolute right-1 top-1 h-10 w-10 grid place-items-center rounded-full text-muted hover:bg-mist">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {err && <p role="alert" className="text-warn font-semibold text-[15px]">{t('Email or password is not right. Demo password is demo1234.', 'ඊමේල් හෝ මුරපදය වැරදියි. ආදර්ශ මුරපදය demo1234.')}</p>}
            <Button type="submit" block size="lg" icon={<LockKeyhole size={18} />}>{t('Sign in', 'පිවිසෙන්න')}</Button>
          </form>

          <a href="#/directory" className="mt-6 flex items-center justify-center gap-2 font-semibold text-teal-deep py-3 rounded-btn hover:bg-teal-50">
            <Globe size={18} /> {t('Browse the public directory without signing in', 'පිවිසීමකින් තොරව පොදු නාමාවලිය බලන්න')}
          </a>
        </div>
      </section>
    </div>
  );
}
