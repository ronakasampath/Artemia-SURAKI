import { useEffect, useRef, useState } from 'react';
import {
  Building2, CircleHelp, EyeOff, FileText, Home as HomeIcon, LifeBuoy, LogOut, Menu, MessageSquare, PenLine, Settings as Gear, VenetianMask, X,
} from 'lucide-react';
import { useApp, type Screen } from '../lib/store';
import { useNav } from '../lib/nav';
import { useT } from '../lib/i18n';
import { CoverScreen, useCoverIdentity, useEscExit } from '../reporter/ReporterApp';
import ReportWizard from '../reporter/ReportWizard';
import Done from '../reporter/Done';
import CaseView from '../reporter/CaseView';
import Messages from '../reporter/Messages';
import Help from '../reporter/Help';
import Settings from '../reporter/Settings';
import Retaliation from '../reporter/Retaliation';
import { DirectoryList, OrgProfile } from '../portals/Directory';
import { Segmented, Toaster, Wordmark, cx } from '../components/ui';
import UserHome from './UserHome';
import MyComplaints from './MyComplaints';
import EditComplaint from './EditComplaint';
import Inbox from './Inbox';
import SecretView from './SecretView';

const COVER_BG: Record<string, [string, string]> = {
  calculator: ['#151b21', '#1c232b'],
  money: ['#e3eae6', '#f3f6f4'],
  study: ['#e6e9f4', '#f5f6fb'],
  social: ['#ebe4dd', '#f6f3f0'],
};

/** Demo user in the browser: the saved secret view first, then the user's dashboard. */
export default function UserApp() {
  const unlocked = useApp((s) => s.session.unlocked);
  const disguise = useApp((s) => s.settings.disguise);
  useCoverIdentity(true);
  useEscExit();
  if (!unlocked) {
    const [outer, inner] = COVER_BG[disguise];
    return (
      <div className="h-[100dvh] w-full grid place-items-center" style={{ background: outer }}>
        <div className="h-full w-full max-w-[480px] relative overflow-clip sm:shadow-[0_0_60px_rgba(0,0,0,.18)]" style={{ background: inner }}>
          <CoverScreen />
        </div>
      </div>
    );
  }
  return <UserShell />;
}

function UserShell() {
  const { t, lang } = useT();
  const screen = useApp((s) => s.session.screen);
  const go = useApp((s) => s.go);
  const quickExit = useApp((s) => s.quickExit);
  const logout = useApp((s) => s.logout);
  const setS = useApp((s) => s.set);
  const cases = useApp((s) => s.cases);
  const navigate = useNav((s) => s.navigate);
  const [drawer, setDrawer] = useState(false);
  const main = useRef<HTMLDivElement>(null);
  const mine = cases.filter((c) => c.mine);
  const unread = mine.reduce((n, c) => n + c.reporterUnread, 0);
  const active = mine.filter((c) => c.status !== 'closed').length;

  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
    setDrawer(false);
  }, [screen]);

  const nav: { k: Screen; l: string; i: typeof HomeIcon; badge?: number; match: Screen[] }[] = [
    { k: 'home', l: t('Home', 'මුල් පිටුව'), i: HomeIcon, match: ['home'] },
    { k: 'complaints', l: t('My complaints', 'මගේ පැමිණිලි'), i: FileText, badge: active, match: ['complaints', 'case', 'edit', 'retaliation', 'track'] },
    { k: 'report', l: t('New complaint', 'නව පැමිණිල්ලක්'), i: PenLine, match: ['report', 'done'] },
    { k: 'inbox', l: t('Messages', 'පණිවිඩ'), i: MessageSquare, badge: unread, match: ['inbox', 'messages'] },
    { k: 'directory', l: t('Organisation directory', 'ආයතන නාමාවලිය'), i: Building2, match: ['directory', 'org'] },
    { k: 'help', l: t('Help and support', 'උදව් හා සහාය'), i: LifeBuoy, match: ['help'] },
    { k: 'secret', l: t('Secret view', 'රහස් පෙනුම'), i: VenetianMask, match: ['secret'] },
    { k: 'settings', l: t('Settings', 'සැකසුම්'), i: Gear, match: ['settings'] },
  ];
  const current = nav.find((n) => n.match.includes(screen));

  const NavList = () => (
    <nav className="flex flex-col gap-0.5 p-3" aria-label={t('Main', 'ප්‍රධාන')}>
      {nav.map((n) => {
        const on = n.match.includes(screen);
        return (
          <button key={n.k} onClick={() => go(n.k, { replace: true })} aria-current={on ? 'page' : undefined}
            className={cx('flex items-center gap-3 rounded-xl px-3 h-11 text-[15px] font-semibold transition-colors text-left', on ? 'bg-navy text-white' : 'text-ink hover:bg-mist')}>
            <n.i size={19} className={on ? '' : 'text-navy'} />
            <span className="flex-1 truncate">{n.l}</span>
            {!!n.badge && <span className={cx('min-w-6 h-6 px-1.5 rounded-full text-[12px] grid place-items-center', on ? 'bg-white text-navy' : 'bg-teal-50 text-teal-deep')}>{n.badge}</span>}
          </button>
        );
      })}
    </nav>
  );

  const wide = screen === 'home' || screen === 'complaints' || screen === 'directory' || screen === 'inbox';

  return (
    <div lang={lang} className="h-[100dvh] flex bg-mist">
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-surface border-r border-line">
        <div className="h-16 flex items-center px-5 border-b border-line"><Wordmark /></div>
        <div className="flex-1 overflow-y-auto thin-scroll"><NavList /></div>
        <div className="p-3 border-t border-line">
          <button onClick={quickExit} className="w-full h-12 rounded-btn bg-navy text-white font-semibold flex items-center justify-center gap-2">
            <EyeOff size={18} /> {t('Quick exit', 'ඉක්මන් පිටවීම')}
          </button>
          <p className="text-[12px] text-muted text-center mt-2">{t('or press Esc twice', 'නැත්නම් Esc දෙවරක් ඔබන්න')}</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 bg-surface border-b border-line flex items-center gap-2 px-3 md:px-6">
          <button className="lg:hidden h-11 w-11 grid place-items-center rounded-full hover:bg-mist text-navy" aria-label={t('Menu', 'මෙනුව')} onClick={() => setDrawer(true)}><Menu size={22} /></button>
          <span className="lg:hidden"><Wordmark /></span>
          <h1 className="hidden lg:block flex-1 min-w-0 truncate text-[18px] font-bold">{current?.l}</h1>
          <span className="flex-1 lg:hidden" />
          <Segmented size="sm" label={t('Language', 'භාෂාව')} value={lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිං', aria: 'සිංහල' }, { v: 'en', l: 'EN', aria: 'English' }]} />
          <a href="#/guide" className="hidden sm:grid h-10 w-10 rounded-full place-items-center text-navy hover:bg-mist" aria-label={t('How to use this system', 'පද්ධතිය භාවිතා කරන ආකාරය')}><CircleHelp size={20} /></a>
          <button onClick={quickExit} className="h-10 pl-2.5 pr-3 rounded-full bg-navy text-white text-sm font-semibold flex items-center gap-1.5"
            aria-label={t('Quick exit. Returns to the cover app and clears this screen.', 'ඉක්මන් පිටවීම. ආවරණ යෙදුමට ගොස් මෙම තිරය මකයි.')}>
            <EyeOff size={16} /> {t('Exit', 'පිටවන්න')}
          </button>
          <button onClick={() => { logout(); navigate('login'); }} className="h-10 px-2.5 rounded-full flex items-center gap-1.5 text-sm font-semibold text-muted hover:bg-mist" title={t('Sign out', 'ඉවත් වන්න')}>
            <LogOut size={17} /> <span className="hidden xl:inline">{t('Sign out', 'ඉවත් වන්න')}</span>
          </button>
        </header>

        <main ref={main} id="reporter-main" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden thin-scroll">
          <div key={screen} className={cx('animate-slide-in min-h-full flex flex-col relative mx-auto w-full', wide ? 'max-w-[1120px]' : 'max-w-[760px] lg:py-4')}>
            {screen === 'home' && <UserHome />}
            {screen === 'complaints' && <MyComplaints />}
            {screen === 'report' && <ReportWizard />}
            {screen === 'done' && <Done />}
            {(screen === 'case' || screen === 'track') && <CaseView />}
            {screen === 'edit' && <EditComplaint />}
            {screen === 'messages' && <Messages />}
            {screen === 'inbox' && <Inbox />}
            {screen === 'help' && <Help />}
            {screen === 'settings' && <Settings web />}
            {screen === 'secret' && <SecretView />}
            {screen === 'retaliation' && <Retaliation />}
            {screen === 'directory' && <div className="px-4 md:px-8 py-6 md:py-8"><DirectoryList /></div>}
            {screen === 'org' && <div className="px-4 md:px-8 py-6 max-w-3xl"><OrgProfile /></div>}
          </div>
        </main>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden animate-fade" onClick={() => setDrawer(false)}>
          <div className="h-full w-[290px] max-w-[85%] bg-surface animate-slide-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 flex items-center justify-between px-4 border-b border-line">
              <Wordmark />
              <button aria-label={t('Close menu', 'මෙනුව වසන්න')} onClick={() => setDrawer(false)} className="h-10 w-10 grid place-items-center rounded-full hover:bg-mist"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto"><NavList /></div>
          </div>
        </div>
      )}
      <Toaster className="fixed left-0 right-0 bottom-6 z-[60]" />
    </div>
  );
}
