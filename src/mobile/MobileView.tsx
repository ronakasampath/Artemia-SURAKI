import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BatteryFull, Camera, ChevronLeft, CircleHelp, Clock, CloudSun, Image, LogOut, Map, MessageCircle, Music, Phone, Settings, Signal, Wifi, X,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { useNav } from '../lib/nav';
import { useT } from '../lib/i18n';
import { coverById } from '../covers/meta';
import ReporterApp, { CoverScreen } from '../reporter/ReporterApp';
import { Segmented, cx } from '../components/ui';

type PhoneState = 'home' | 'app' | 'recents';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(i);
  }, []);
  return now;
}

/** "Demo user – mobile": the user app on a simulated phone with Android-style back / home / recent-apps buttons. */
export default function MobileView() {
  const { t, lang } = useT();
  const setS = useApp((s) => s.set);
  const logout = useApp((s) => s.logout);
  const quickExit = useApp((s) => s.quickExit);
  const back = useApp((s) => s.back);
  const navigate = useNav((s) => s.navigate);
  const [state, setState] = useState<PhoneState>('home');
  const [prev, setPrev] = useState<PhoneState>('home');
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    document.title = 'SURAKI · mobile view';
  }, []);

  useLayoutEffect(() => {
    const el = wrap.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientHeight - 32) / 880, (el.clientWidth - 24) / 410)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Leaving the app (home or recents) always locks it.
  const onBack = () => {
    const s = useApp.getState().session;
    if (state === 'recents') return setState(prev === 'recents' ? 'home' : prev);
    if (state === 'home') return;
    if (s.unlocked && s.history.length) return back();
    quickExit();
    setState('home');
  };
  const onHome = () => { quickExit(); setState('home'); };
  const onRecents = () => {
    if (state === 'recents') return;
    quickExit();
    setPrev(state);
    setState('recents');
  };

  const now = useClock();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  const unlocked = useApp((s) => s.session.unlocked);
  const disguise = useApp((s) => s.settings.disguise);
  const darkStatus = state !== 'app' || (!unlocked && (disguise === 'calculator' || disguise === 'money'));
  const statusBg = state !== 'app' ? 'transparent' : unlocked ? 'rgb(var(--surface))' : { calculator: '#1c232b', money: '#0e5e4a', study: '#ffffff', social: '#ffffff' }[disguise];

  return (
    <div lang={lang} className="h-[100dvh] flex flex-col bg-[linear-gradient(180deg,#e9eef4,#dfe6ee)]">
      <header className="h-14 shrink-0 flex items-center gap-2 px-4">
        <button onClick={() => { logout(); navigate('login'); }} className="h-10 px-3 rounded-full flex items-center gap-1.5 text-sm font-semibold text-navy hover:bg-white/60">
          <LogOut size={17} /> {t('Sign out', 'ඉවත් වන්න')}
        </button>
        <span className="flex-1" />
        <a href="#/guide" className="h-10 w-10 rounded-full grid place-items-center text-navy hover:bg-white/60" aria-label={t('How to use this system', 'පද්ධතිය භාවිතා කරන ආකාරය')}><CircleHelp size={20} /></a>
        <Segmented size="sm" label={t('Language', 'භාෂාව')} value={lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිං', aria: 'සිංහල' }, { v: 'en', l: 'EN', aria: 'English' }]} />
      </header>
      <div className="flex-1 min-h-0 flex items-start justify-center pt-2">
        <div ref={wrap} style={{ width: 410 * scale, height: 880 * scale }} className="shrink-0">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 410, height: 880 }}
            className="rounded-[52px] bg-[#0d1b2a] p-[10px] shadow-[0_40px_80px_-24px_rgba(15,34,54,.55)] ring-1 ring-[#2a3b4f]">
            <div className="relative h-full w-full rounded-[42px] overflow-clip bg-black flex flex-col" id="phone-screen">
              {/* status bar */}
              <div className="h-[40px] shrink-0 flex items-center justify-between px-6 text-[14px] font-semibold relative z-20" style={{ background: statusBg, color: darkStatus ? '#fff' : '#0f2236', fontFamily: 'system-ui, sans-serif' }}>
                <span>{time}</span>
                <span className="absolute left-1/2 -translate-x-1/2 top-[11px] h-[18px] w-[18px] rounded-full bg-black ring-2 ring-[#1b2735]" aria-hidden />
                <span className="flex items-center gap-1.5"><Signal size={14} /><Wifi size={14} /><BatteryFull size={19} /></span>
              </div>

              <div className="flex-1 min-h-0 relative">
                {state === 'home' && <HomeScreen now={now} onOpen={() => setState('app')} />}
                {state === 'app' && <ReporterApp />}
                {state === 'recents' && <Recents onOpen={() => setState('app')} onClear={() => setState('home')} />}
              </div>

              {/* Android-style system navigation */}
              <nav className="h-[52px] shrink-0 bg-[#0b0f14] grid grid-cols-3 items-center text-white/85 z-30" aria-label={t('Phone navigation', 'දුරකථන සංචාලනය')}>
                <button onClick={onBack} aria-label={t('Back', 'ආපසු')} className="h-full grid place-items-center hover:bg-white/5 active:bg-white/10"><ChevronLeft size={26} /></button>
                <button onClick={onHome} aria-label={t('Home screen (locks the app)', 'මුල් තිරය (යෙදුම අගුළු දමයි)')} className="h-full grid place-items-center hover:bg-white/5 active:bg-white/10"><span className="h-[22px] w-[22px] rounded-full border-[2.5px] border-white/85" /></button>
                <button onClick={onRecents} aria-label={t('Recent apps (locks the app)', 'මෑත යෙදුම් (යෙදුම අගුළු දමයි)')} className="h-full grid place-items-center hover:bg-white/5 active:bg-white/10"><span className="h-[19px] w-[19px] rounded-[5px] border-[2.5px] border-white/85" /></button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const WALL = 'linear-gradient(165deg,#24425f 0%,#2e6b6b 55%,#c9a26b 120%)';

function HomeScreen({ now, onOpen }: { now: Date; onOpen: () => void }) {
  const disguise = useApp((s) => s.settings.disguise);
  const { tb } = useT();
  const c = coverById(disguise);
  const apps = [
    { l: 'Clock', i: Clock, bg: '#111827' }, { l: 'Weather', i: CloudSun, bg: '#3b82f6' }, { l: 'Photos', i: Image, bg: '#f59e0b' },
    { l: 'Camera', i: Camera, bg: '#4b5563' }, { l: 'Maps', i: Map, bg: '#10b981' }, { l: 'Music', i: Music, bg: '#ef4444' }, { l: 'Settings', i: Settings, bg: '#6b7280' },
  ];
  return (
    <div className="absolute inset-0 -top-[40px] pt-[56px] px-6 flex flex-col" style={{ background: WALL, fontFamily: 'system-ui, sans-serif' }}>
      <p className="text-white/90 text-center text-[64px] font-light leading-none mt-6">{now.getHours()}:{String(now.getMinutes()).padStart(2, '0')}</p>
      <p className="text-white/80 text-center mt-2">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <div className="grid grid-cols-4 gap-y-6 gap-x-4 mt-14">
        {apps.slice(0, 3).map((a) => <Icon key={a.l} {...a} />)}
        <button onClick={onOpen} className="flex flex-col items-center gap-1.5" aria-label={`Open ${c.name.en}`} id="cover-app-icon">
          <img src={c.favicon} alt="" className="h-[58px] w-[58px] rounded-[16px] shadow-lg" />
          <span className="text-white text-[12px] drop-shadow">{tb(c.name)}</span>
        </button>
        {apps.slice(3).map((a) => <Icon key={a.l} {...a} />)}
      </div>
      <div className="mt-auto mb-5 rounded-[28px] bg-white/20 backdrop-blur p-3 grid grid-cols-4 gap-4">
        {[{ l: 'Phone', i: Phone, bg: '#22c55e' }, { l: 'Messages', i: MessageCircle, bg: '#16a34a' }, { l: 'Camera', i: Camera, bg: '#4b5563' }, { l: 'Photos', i: Image, bg: '#f59e0b' }].map((a) => (
          <span key={a.l} className="grid place-items-center"><span className="h-[54px] w-[54px] rounded-[15px] grid place-items-center text-white" style={{ background: a.bg }}><a.i size={25} /></span></span>
        ))}
      </div>
    </div>
  );
}

function Icon({ l, i: I, bg }: { l: string; i: typeof Clock; bg: string }) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="h-[58px] w-[58px] rounded-[16px] grid place-items-center text-white shadow-lg" style={{ background: bg }}><I size={27} /></span>
      <span className="text-white text-[12px] drop-shadow">{l}</span>
    </span>
  );
}

/** Recent apps: Suraki's card only ever shows its cover, never the real screen. */
function Recents({ onOpen, onClear }: { onOpen: () => void; onClear: () => void }) {
  const { t, tb } = useT();
  const disguise = useApp((s) => s.settings.disguise);
  const c = coverById(disguise);
  const strip = useRef<HTMLDivElement>(null);
  // start with Suraki's (cover) card in the middle, like the most recent app
  useLayoutEffect(() => {
    const el = strip.current;
    const card = el?.querySelector<HTMLElement>('[data-current]');
    if (el && card) el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
  }, []);
  return (
    <div className="absolute inset-0 -top-[40px] pt-[56px] flex flex-col bg-[#1b2430]" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div ref={strip} className="flex-1 min-h-0 flex items-center gap-4 overflow-x-auto no-scrollbar px-10 snap-x">
        <FakeCard label="Messages" color="#16a34a" />
        <button data-current onClick={onOpen} className="snap-center shrink-0 flex flex-col items-center gap-2" aria-label={`Open ${c.name.en}`}>
          <span className="flex items-center gap-2 text-white text-[14px]"><img src={c.favicon} alt="" className="h-6 w-6 rounded-md" />{tb(c.name)}</span>
          <span className="block h-[440px] w-[220px] rounded-[22px] overflow-clip ring-1 ring-white/20 pointer-events-none relative">
            <span className="absolute top-0 left-0 block origin-top-left" style={{ width: 390, height: 800, transform: 'scale(0.5641)' }}>
              <CoverScreen preview />
            </span>
          </span>
        </button>
        <FakeCard label="Clock" color="#111827" />
      </div>
      <div className="pb-6 grid place-items-center">
        <button onClick={onClear} className="h-10 px-5 rounded-full bg-white/10 text-white text-sm font-semibold flex items-center gap-1.5"><X size={16} /> {t('Clear all', 'සියල්ල ඉවත් කරන්න')}</button>
      </div>
    </div>
  );
}

function FakeCard({ label, color }: { label: string; color: string }) {
  return (
    <div className="snap-center shrink-0 flex flex-col items-center gap-2 opacity-70">
      <span className="text-white text-[14px]">{label}</span>
      <span className={cx('block h-[440px] w-[220px] rounded-[22px]')} style={{ background: `linear-gradient(180deg, ${color} 0 14%, #f3f4f6 14% 100%)` }} />
    </div>
  );
}
