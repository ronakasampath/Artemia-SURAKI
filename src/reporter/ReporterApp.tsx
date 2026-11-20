import { useEffect, useRef } from 'react';
import { EyeOff, Home as HomeIcon, LifeBuoy, PenLine, Settings as Gear, Waypoints } from 'lucide-react';
import { useApp } from '../lib/store';
import { useT } from '../lib/i18n';
import { coverById } from '../covers/meta';
import Calculator from '../covers/Calculator';
import Money from '../covers/Money';
import Study from '../covers/Study';
import Social from '../covers/Social';
import { IconButton, Segmented, Toaster, Wordmark, cx } from '../components/ui';
import Home from './Home';
import ReportWizard from './ReportWizard';
import Done from './Done';
import Track from './Track';
import CaseView from './CaseView';
import Messages from './Messages';
import Help from './Help';
import Settings from './Settings';
import { DirectoryList, OrgProfile } from '../portals/Directory';
import Retaliation from './Retaliation';

/** Browser tab title and favicon always match the cover, so nothing reveals the real app. */
export function useCoverIdentity(on: boolean) {
  const disguise = useApp((s) => s.settings.disguise);
  useEffect(() => {
    if (!on) return;
    const c = coverById(disguise);
    document.title = c.name.en;
    const link = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (link) link.href = c.favicon;
  }, [on, disguise]);
}

/** Quick exit from the keyboard: press Esc twice. */
export function useEscExit() {
  const quickExit = useApp((s) => s.quickExit);
  const lastEsc = useRef(0);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !useApp.getState().session.unlocked) return;
      const now = Date.now();
      if (now - lastEsc.current < 600) quickExit();
      lastEsc.current = now;
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [quickExit]);
}

/** The saved secret view (cover app). A fresh instance after every exit, so nothing typed before remains. */
export function CoverScreen({ preview = false }: { preview?: boolean }) {
  const disguise = useApp((s) => s.settings.disguise);
  const pin = useApp((s) => s.settings.pin);
  const unlock = useApp((s) => s.unlock);
  const exitCount = useApp((s) => s.session.exitCount);
  const Cover = { calculator: Calculator, money: Money, study: Study, social: Social }[disguise];
  return <Cover key={`${disguise}-${exitCount}`} pin={preview ? '\u0000' : pin} onUnlock={preview ? () => {} : unlock} />;
}

export const COVER_COMPONENTS = { calculator: Calculator, money: Money, study: Study, social: Social };

export default function ReporterApp({ standalone = false }: { standalone?: boolean }) {
  const unlocked = useApp((s) => s.session.unlocked);
  useCoverIdentity(standalone);
  useEscExit();
  if (!unlocked) return <CoverScreen />;
  return <Inside />;
}

function Inside() {
  const { t, lang } = useT();
  const screen = useApp((s) => s.session.screen);
  const go = useApp((s) => s.go);
  const quickExit = useApp((s) => s.quickExit);
  const setS = useApp((s) => s.set);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [screen]);

  const tabs = [
    { k: 'home', i: HomeIcon, l: t('Home', 'මුල් පිටුව'), match: ['home', 'directory', 'org', 'settings'] },
    { k: 'report', i: PenLine, l: t('Report', 'වාර්තා කරන්න'), match: ['report', 'done'] },
    { k: 'track', i: Waypoints, l: t('My report', 'තත්ත්වය'), match: ['track', 'case', 'messages', 'retaliation'] },
    { k: 'help', i: LifeBuoy, l: t('Help', 'උදව්'), match: ['help'] },
  ] as const;

  const hideNav = screen === 'report' || screen === 'messages';
  const hasCase = useApp((s) => !!(s.session.activeCase ?? s.saved));

  return (
    <div lang={lang} className="h-full flex flex-col bg-mist animate-fade relative">
      <header className="flex items-center gap-1 px-3 h-14 bg-surface border-b border-line shrink-0">
        <button onClick={() => go('home', { replace: true })} aria-label={t('Suraki home', 'සුරැකි මුල් පිටුව')} className="px-1 py-1 rounded-lg">
          <Wordmark />
        </button>
        <div className="flex-1" />
        <Segmented
          size="sm"
          label={t('Language', 'භාෂාව')}
          value={lang}
          onChange={(v) => setS('lang', v)}
          options={[{ v: 'si', l: 'සිං', aria: 'සිංහල' }, { v: 'en', l: 'EN', aria: 'English' }]}
        />
        <IconButton label={t('Settings', 'සැකසුම්')} onClick={() => go('settings')} className="h-10 w-10">
          <Gear size={20} />
        </IconButton>
        <button
          onClick={quickExit}
          className="ml-0.5 h-10 pl-2.5 pr-3 rounded-full bg-navy text-white text-sm font-semibold flex items-center gap-1.5 shrink-0"
          aria-label={t('Quick exit. Returns to the cover app and clears this screen.', 'ඉක්මන් පිටවීම. ආවරණ යෙදුමට ගොස් මෙම තිරය මකයි.')}
        >
          <EyeOff size={16} /> {t('Exit', 'පිටවන්න')}
        </button>
      </header>

      <main ref={scroller} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar" id="reporter-main">
        <div key={screen} className="animate-slide-in min-h-full flex flex-col">
          {screen === 'home' && <Home />}
          {screen === 'report' && <ReportWizard />}
          {screen === 'done' && <Done />}
          {screen === 'track' && <Track />}
          {screen === 'case' && <CaseView />}
          {screen === 'messages' && <Messages />}
          {screen === 'help' && <Help />}
          {screen === 'settings' && <Settings />}
          {screen === 'directory' && <DirectoryList compact />}
          {screen === 'org' && <OrgProfile compact />}
          {screen === 'retaliation' && <Retaliation />}
        </div>
      </main>

      <Toaster className="absolute left-0 right-0 bottom-24 z-30" />

      {!hideNav && (
        <nav className="grid grid-cols-4 bg-surface border-t border-line shrink-0 pb-1" aria-label={t('Main', 'ප්‍රධාන')}>
          {tabs.map((tab) => {
            const active = (tab.match as readonly string[]).includes(screen);
            return (
              <button
                key={tab.k}
                onClick={() => go((tab.k === 'track' && hasCase ? 'case' : tab.k) as never, { replace: true })}
                aria-current={active ? 'page' : undefined}
                className={cx('flex flex-col items-center justify-center gap-0.5 min-h-[60px] text-[12px] font-semibold tight', active ? 'text-navy' : 'text-muted')}
              >
                <span className={cx('h-8 w-14 grid place-items-center rounded-full transition-colors', active && 'bg-navy-50')}>
                  <tab.i size={21} strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="leading-tight text-center px-1">{tab.l}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
