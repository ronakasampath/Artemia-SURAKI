import { useMemo } from 'react';
import {
  ArrowLeft, Building2, Check, ChevronRight, Contrast, Gavel, Globe, KeyRound, Landmark, Languages, LogOut, Monitor, RotateCcw, ShieldCheck,
  Smartphone, Type, VenetianMask,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { useNav, type Route } from '../lib/nav';
import { useT } from '../lib/i18n';
import { DEMO_ACCOUNTS } from '../data';
import { COVERS } from '../covers/meta';
import type { AuthRole } from '../lib/types';
import { Button, Segmented, ThreadMark, cx, toast } from '../components/ui';

/** "How to use this system": accounts, unlocking the secret view, and a live end-to-end checklist. */
export default function Guide() {
  const { t, tb, lang } = useT();
  const setS = useApp((s) => s.set);
  const pin = useApp((s) => s.settings.pin);
  const auth = useApp((s) => s.auth);
  const login = useApp((s) => s.login);
  const reset = useApp((s) => s.resetDemo);
  const navigate = useNav((s) => s.navigate);

  const as = (role: AuthRole, route: Route) => {
    if (auth?.role !== role) {
      const a = DEMO_ACCOUNTS.find((x) => x.role === role)!;
      login({ role: a.role, id: a.id, name: a.name, orgId: a.orgId });
    }
    navigate(route);
  };

  const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="text-[22px] font-bold leading-tight mt-12 mb-3">{children}</h2>;

  return (
    <div lang={lang} className="h-[100dvh] overflow-y-auto thin-scroll bg-mist">
      <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-line">
        <div className="max-w-[960px] mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
          <a href={auth ? undefined : '#/login'} onClick={(e) => { if (auth) { e.preventDefault(); history.back(); } }} className="h-10 pl-2 pr-3 -ml-2 rounded-full flex items-center gap-1.5 font-semibold text-navy hover:bg-mist cursor-pointer">
            <ArrowLeft size={19} /> {auth ? t('Back', 'ආපසු') : t('Sign in', 'පිවිසෙන්න')}
          </a>
          <span className="flex-1" />
          <Segmented size="sm" label={t('Language', 'භාෂාව')} value={lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිංහල' }, { v: 'en', l: 'English' }]} />
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-3">
          <ThreadMark size={40} />
          <p className="font-bold text-navy">SURAKI · <span lang="si" className="font-si">සුරැකි</span></p>
        </div>
        <h1 className="text-[32px] md:text-[38px] font-bold leading-tight mt-4">{t('How to use this system', 'මෙම පද්ධතිය භාවිතා කරන ආකාරය')}</h1>
        <p className="text-muted text-[17px] mt-2 max-w-[62ch]">
          {t('Suraki lets women report harassment confidentially. Independent officers review each report, organisations are asked to fix problems, and approved results appear in a public directory. Everything here is a prototype with fictional data stored in your browser.', 'සුරැකි මඟින් කාන්තාවන්ට රහසිගතව හිරිහැර වාර්තා කළ හැකිය. ස්වාධීන නිලධාරීන් සෑම පැමිණිල්ලක්ම සමාලෝචනය කරයි, ගැටලු නිවැරදි කරන ලෙස ආයතනවලින් ඉල්ලයි, අනුමත ප්‍රතිඵල පොදු නාමාවලියක පළ වේ. මෙය ඔබේ බ්‍රවුසරයේ ගබඩා වන කල්පිත දත්ත සහිත මූලාකෘතියකි.')}
        </p>

        <H2>{t('Demo accounts', 'ආදර්ශ ගිණුම්')}</H2>
        <div className="rounded-card bg-surface border border-line divide-y divide-line">
          {[
            { role: 'user' as const, route: 'user' as Route, i: Monitor, n: t('Demo user', 'ආදර්ශ පරිශීලක'), d: t('Opens behind the secret view. Make, edit or withdraw complaints, reply to messages, change the secret view.', 'රහස් පෙනුම පිටුපස විවෘත වේ. පැමිණිලි සෑදීම, සංස්කරණය, ඉල්ලා අස්කර ගැනීම, පණිවිඩ, රහස් පෙනුම වෙනස් කිරීම.') },
            { role: 'user' as const, route: 'mobile' as Route, i: Smartphone, n: t('Demo user · mobile view', 'ආදර්ශ පරිශීලක · ජංගම දසුන'), d: t('The same account on a simulated phone. The home-screen icon follows the saved secret view.', 'එම ගිණුමම අනුකරණය කළ දුරකථනයක. මුල් තිරයේ අයිකනය සුරැකි රහස් පෙනුම අනුගමනය කරයි.') },
            { role: 'officer' as const, route: 'officer' as Route, i: Landmark, n: t('Demo government officer', 'ආදර්ශ රජයේ නිලධාරී'), d: t('Case queue with AI suggestions, secure messages, referrals to 1938 / 109, notices, publication approval, audit trail.', 'AI යෝජනා සහිත ගොනු පෝලිම, ආරක්ෂිත පණිවිඩ, 1938 / 109 යොමු කිරීම්, නිවේදන, ප්‍රකාශන අනුමැතිය, විගණනය.') },
            { role: 'org' as const, route: 'org' as Route, i: Building2, n: t('Demo organisation', 'ආදර්ශ ආයතනය'), d: t('Example Company A: answer notices, manage corrective actions and branches, appeal.', 'උදාහරණ සමාගම A: නිවේදනවලට පිළිතුරු, නිවැරදි කිරීම් හා ශාඛා කළමනාකරණය, අභියාචනා.') },
            { role: 'admin' as const, route: 'admin' as Route, i: KeyRound, n: t('Demo admin', 'ආදර්ශ පරිපාලක'), d: t('Accounts, organisation registry, access rules. Cannot read any report.', 'ගිණුම්, ආයතන ලේඛනය, ප්‍රවේශ නීති. කිසිදු පැමිණිල්ලක් කියවිය නොහැක.') },
          ].map((r) => {
            const acc = DEMO_ACCOUNTS.find((a) => a.role === r.role)!;
            return (
              <div key={r.n} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="h-11 w-11 rounded-full bg-navy-50 text-navy grid place-items-center shrink-0"><r.i size={20} /></span>
                <div className="flex-1 min-w-[240px]">
                  <p className="font-bold">{r.n}</p>
                  <p className="text-muted text-[15px]">{r.d}</p>
                  <p className="text-[13px] mt-1 font-mono text-muted">{acc.email} · demo1234</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => as(r.role, r.route)}>{t('Open', 'විවෘත කරන්න')} <ChevronRight size={15} /></Button>
              </div>
            );
          })}
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="h-11 w-11 rounded-full bg-teal-50 text-teal-deep grid place-items-center shrink-0"><Globe size={20} /></span>
            <div className="flex-1 min-w-[240px]">
              <p className="font-bold">{t('Public directory', 'පොදු නාමාවලිය')}</p>
              <p className="text-muted text-[15px]">{t('Anyone can search organisations without signing in.', 'පිවිසීමකින් තොරව ඕනෑම අයෙකුට ආයතන සෙවිය හැකිය.')}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate('directory')}>{t('Open', 'විවෘත කරන්න')} <ChevronRight size={15} /></Button>
          </div>
        </div>

        <H2>{t('Opening the secret view', 'රහස් පෙනුම විවෘත කිරීම')}</H2>
        <p className="text-muted mb-4 max-w-[64ch]">{t('The user side never looks like a safety app. Only the user can change which everyday app it pretends to be. A wrong PIN simply behaves like the normal app.', 'පරිශීලක පැත්ත කිසිදා ආරක්ෂක යෙදුමක් ලෙස නොපෙනේ. එය කුමන එදිනෙදා යෙදුමක් ලෙස පෙනිය යුතුද යන්න වෙනස් කළ හැක්කේ පරිශීලකයාට පමණි. වැරදි PIN එකක් සාමාන්‍ය යෙදුම ලෙසම ක්‍රියා කරයි.')}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {COVERS.map((c) => (
            <div key={c.id} className="rounded-card bg-surface border border-line p-4 flex gap-3">
              <img src={c.favicon} alt="" className="h-12 w-12 rounded-[12px] shrink-0" />
              <div>
                <p className="font-bold">{tb(c.name)} <span className="text-muted font-normal text-[14px]">· {tb(c.kind)}</span></p>
                <p className="text-[15px] mt-0.5">{tb(c.unlock)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[15px] flex items-center gap-2"><KeyRound size={17} className="text-teal-deep" />{t('Current PIN:', 'වත්මන් PIN:')} <span className="font-mono font-bold text-[18px] text-navy tracking-widest">{pin}</span></p>
        <p className="mt-1 text-[15px] flex items-center gap-2"><LogOut size={17} className="text-teal-deep" />{t('Exit, on every screen, wipes the screen and goes back to the cover. On a computer, press Esc twice.', 'සෑම තිරයකම ඇති “පිටවන්න” තිරය මකා ආවරණයට යයි. පරිගණකයක Esc දෙවරක් ඔබන්න.')}</p>

        <H2>{t('Try one report from start to finish', 'එක් පැමිණිල්ලක් මුල සිට අගට උත්සාහ කරන්න')}</H2>
        <Journey as={as} />

        <H2>{t('Designed for everyone', 'සැමට සැලසුම් කළා')}</H2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { i: Languages, h: t('Sinhala and English', 'සිංහල හා ඉංග්‍රීසි'), b: t('Switch at any time, on every page.', 'ඕනෑම වේලාවක, සෑම පිටුවකම මාරු කරන්න.') },
            { i: Type, h: t('Three text sizes', 'අකුරු ප්‍රමාණ තුනක්'), b: t('In the user’s Settings.', 'පරිශීලක සැකසුම්වල.') },
            { i: Contrast, h: t('Stronger contrast and less motion', 'වැඩි වර්ණ වෙනස හා අඩු චලනය'), b: t('Also follows the device’s reduced-motion setting.', 'උපාංගයේ අඩු චලන සැකසුමද අනුගමනය කරයි.') },
            { i: VenetianMask, h: t('Four working disguises', 'ක්‍රියා කරන වෙස් මුහුණු හතරක්'), b: t('Name, icon and browser tab follow the disguise.', 'නම, අයිකනය හා බ්‍රවුසර් ටැබය වෙස් මුහුණ අනුගමනය කරයි.') },
            { i: ShieldCheck, h: t('Privacy check before sending', 'යැවීමට පෙර පෞද්ගලිකත්ව පරීක්ෂාව'), b: t('Flags phone numbers, exact times and unique roles.', 'දුරකථන අංක, නිශ්චිත වේලා හා අනන්‍ය තනතුරු පෙන්වයි.') },
            { i: Gavel, h: t('People decide, not AI', 'තීරණ මිනිසුන්ගේ, AI නොවේ'), b: t('Every suggestion is explained and needs an officer’s confirmation.', 'සෑම යෝජනාවක්ම පැහැදිලි කර නිලධාරියෙකුගේ තහවුරු කිරීම අවශ්‍ය වේ.') },
          ].map((f) => (
            <div key={f.h} className="rounded-card bg-surface border border-line p-4 flex gap-3">
              <f.i size={22} className="text-teal-deep shrink-0 mt-0.5" />
              <div><p className="font-bold">{f.h}</p><p className="text-muted text-[15px]">{f.b}</p></div>
            </div>
          ))}
        </div>

        <H2>{t('Demo data', 'ආදර්ශ දත්ත')}</H2>
        <p className="text-muted max-w-[64ch]">{t('Everything you add, edit or delete is kept in this browser only. Reset to start again with the original mock data.', 'ඔබ එකතු කරන, සංස්කරණය කරන හෝ මකන සියල්ල මෙම බ්‍රවුසරයේ පමණක් රැඳේ. මුල් ආදර්ශ දත්ත සමඟ නැවත ආරම්භ කිරීමට යළි සකසන්න.')}</p>
        <Button className="mt-3" variant="secondary" icon={<RotateCcw size={17} />} onClick={() => { reset(); toast(t('Demo data reset', 'ආදර්ශ දත්ත යළි සකස් කළා')); }}>{t('Reset demo data', 'ආදර්ශ දත්ත යළි සකසන්න')}</Button>
        <p className="text-[13px] text-muted mt-10">{t('109 and 1938 are shown as proposed partners and are not connected. All people, cases and organisations are fictional.', '109 හා 1938 යෝජිත හවුල්කරුවන් ලෙස පෙන්වයි, සම්බන්ධ කර නැත. සියලු පුද්ගලයින්, සිද්ධි හා ආයතන කල්පිතයි.')}</p>
      </main>
    </div>
  );
}

function Journey({ as }: { as: (r: AuthRole, route: Route) => void }) {
  const { t } = useT();
  const cases = useApp((s) => s.cases);
  const notices = useApp((s) => s.notices);
  const flags = useApp((s) => s.flags);
  const go = useApp((s) => s.go);
  const setReviewer = useNav((s) => s.setReviewer);
  const setOrg = useNav((s) => s.setOrg);
  const setDir = useNav((s) => s.setDir);

  const mine = useMemo(() => cases.filter((c) => c.fresh).sort((a, b) => b.createdAt - a.createdAt)[0], [cases]);
  const n = notices.find((x) => x.id === mine?.noticeId);
  const asked = mine?.messages.findIndex((m) => m.from === 'reviewer') ?? -1;
  const answered = asked >= 0 && mine!.messages.slice(asked).some((m) => m.from === 'reporter');
  const toOfficer = (view: 'case' | 'publication' = 'case') => { setReviewer(mine ? { view, caseId: mine.id } : { view: 'queue' }); as('officer', 'officer'); };

  const steps = [
    { done: !!mine, l: t('Sign in as the demo user, open the secret view and make a complaint about Example Company A', 'ආදර්ශ පරිශීලක ලෙස පිවිස, රහස් පෙනුම විවෘත කර උදාහරණ සමාගම A ගැන පැමිණිල්ලක් කරන්න'), who: t('User', 'පරිශීලක'), go: () => { as('user', 'user'); go('report', { replace: true }); } },
    { done: !!mine?.human, l: t('Confirm or change the AI suggestion', 'AI යෝජනාව තහවුරු කරන්න හෝ වෙනස් කරන්න'), who: t('Government officer', 'රජයේ නිලධාරී'), go: () => toOfficer() },
    { done: answered, l: t('Ask a question, then answer it as the user', 'ප්‍රශ්නයක් අසා, පරිශීලක ලෙස පිළිතුරු දෙන්න'), who: t('Officer → User', 'නිලධාරී → පරිශීලක'), go: () => (asked >= 0 ? (as('user', 'user'), go('inbox', { replace: true })) : toOfficer()) },
    { done: !!n, l: t('Issue a notice after the privacy checks', 'පෞද්ගලිකත්ව පරීක්ෂාවෙන් පසු නිවේදනයක් නිකුත් කරන්න'), who: t('Government officer', 'රජයේ නිලධාරී'), go: () => toOfficer() },
    { done: !!n?.response, l: t('Respond with a corrective-action plan', 'නිවැරදි කිරීමේ සැලැස්මක් සමඟ පිළිතුරු දෙන්න'), who: t('Organisation', 'ආයතනය'), go: () => { setOrg(n ? { view: 'notice', noticeId: n.id } : { view: 'overview' }); as('org', 'org'); } },
    { done: n?.status === 'verified', l: t('Review the response and record the outcome', 'පිළිතුර සලකා ප්‍රතිඵලය සටහන් කරන්න'), who: t('Government officer', 'රජයේ නිලධාරී'), go: () => toOfficer() },
    { done: n?.publication === 'approved', l: t('Approve the record for publication', 'ප්‍රකාශනය සඳහා වාර්තාව අනුමත කරන්න'), who: t('Publication officer', 'ප්‍රකාශන නිලධාරී'), go: () => toOfficer('publication') },
    { done: flags.directoryViewed, l: t('Find the record in the public directory', 'පොදු නාමාවලියේ වාර්තාව සොයන්න'), who: t('Public', 'මහජනතාව'), go: () => { setDir({ orgId: mine?.orgId ?? 'org-a' }); useNav.getState().navigate('directory'); } },
    { done: flags.reporterSawOutcome, l: t('See the final status as the user', 'පරිශීලක ලෙස අවසාන තත්ත්වය බලන්න'), who: t('User', 'පරිශීලක'), go: () => { as('user', 'user'); go('complaints', { replace: true }); } },
  ];
  const next = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-card bg-surface border border-line p-5">
      <div className="flex items-center justify-between gap-3 text-[14px] text-muted">
        <span>{t('Steps tick themselves as you do them.', 'ඔබ කරන විට පියවර ස්වයංක්‍රීයව සලකුණු වේ.')}</span>
        <span className="font-semibold tabular-nums">{doneCount} / {steps.length}</span>
      </div>
      <div className="h-1.5 rounded-full bg-line mt-2 mb-4"><div className="h-full rounded-full bg-teal transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} /></div>
      <ol>
        {steps.map((s, i) => {
          const state = s.done ? 'done' : i === next ? 'current' : 'next';
          return (
            <li key={i} className="relative flex gap-3 pb-1">
              {i < steps.length - 1 && <span aria-hidden className={cx('absolute left-[13px] top-8 bottom-0 w-[2px]', s.done ? 'bg-teal' : 'bg-line')} />}
              <span className={cx('relative z-10 mt-2 h-7 w-7 shrink-0 rounded-full grid place-items-center text-[12px] font-bold',
                state === 'done' && 'bg-teal text-white', state === 'current' && 'bg-navy text-white animate-pulse-ring', state === 'next' && 'bg-surface border-2 border-line text-muted')}>
                {s.done ? <Check size={15} strokeWidth={3} /> : i + 1}
              </span>
              <button onClick={s.go} className={cx('flex-1 text-left rounded-xl px-3 py-2.5 mb-1 transition-colors flex items-center gap-3', state === 'current' ? 'bg-navy-50' : 'hover:bg-mist')}>
                <span className="flex-1">
                  <span className={cx('block text-[15px] font-semibold leading-snug', state === 'next' && 'text-muted')}>{s.l}</span>
                  <span className="block text-[13px] text-muted">{s.who}</span>
                </span>
                <span className="text-navy font-semibold text-[14px] flex items-center shrink-0">{t('Open', 'විවෘත කරන්න')}<ChevronRight size={15} /></span>
              </button>
            </li>
          );
        })}
      </ol>
      {doneCount === steps.length && (
        <p className="mt-3 rounded-card bg-ok-50 text-ok p-4 font-semibold">{t('Full journey complete: report → review → notice → fix → public record.', 'සම්පූර්ණ ගමන අවසන්: පැමිණිල්ල → සමාලෝචනය → නිවේදනය → නිවැරදි කිරීම → පොදු වාර්තාව.')}</p>
      )}
    </div>
  );
}
