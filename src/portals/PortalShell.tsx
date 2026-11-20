import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleHelp, LogOut } from 'lucide-react';
import { Segmented, ThreadMark, cx } from '../components/ui';
import { useT } from '../lib/i18n';
import { useApp } from '../lib/store';
import { useNav } from '../lib/nav';

export type NavItem = { k: string; l: string; i: LucideIcon; badge?: number };

/** Shared frame for the officer, organisation and admin dashboards. */
export default function PortalShell({
  product, who, role, nav, active, onNav, children, tone = 'navy',
}: {
  product: string; who: string; role: string; nav: NavItem[]; active: string; onNav: (k: string) => void; children: ReactNode; tone?: 'navy' | 'teal' | 'ink';
}) {
  const { t, lang } = useT();
  const setS = useApp((s) => s.set);
  const logout = useApp((s) => s.logout);
  const navigate = useNav((s) => s.navigate);
  const bg = { navy: 'bg-navy', teal: 'bg-[#16494a]', ink: 'bg-[#1d2733]' }[tone];
  const current = nav.find((n) => n.k === active);
  return (
    <div lang={lang} className="h-[100dvh] flex flex-col md:flex-row bg-mist min-h-0">
      <aside className={cx('md:w-64 shrink-0 text-white flex md:flex-col', bg)}>
        <div className="flex items-center gap-2.5 px-4 h-14 md:h-16 md:border-b border-white/10 shrink-0">
          <ThreadMark size={30} />
          <div className="leading-tight hidden sm:block">
            <p className="font-bold text-[15px]">{product}</p>
            <p className="text-[11px] text-white/60">SURAKI · {t('demo data', 'ආදර්ශ දත්ත')}</p>
          </div>
        </div>
        <nav className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto no-scrollbar flex-1" aria-label={product}>
          {nav.map((n) => (
            <button
              key={n.k}
              onClick={() => onNav(n.k)}
              aria-current={active === n.k ? 'page' : undefined}
              className={cx(
                'flex items-center gap-2.5 rounded-xl px-3 h-10 md:h-11 text-[14px] font-semibold whitespace-nowrap transition-colors',
                active === n.k ? 'bg-white text-navy' : 'text-white/80 hover:bg-white/10',
              )}
            >
              <n.i size={18} />
              <span className="flex-1 text-left">{n.l}</span>
              {!!n.badge && <span className={cx('min-w-5 h-5 px-1.5 rounded-full text-[11px] grid place-items-center', active === n.k ? 'bg-navy text-white' : 'bg-white/20')}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3 p-4 border-t border-white/10 text-[13px]">
          <span className="h-9 w-9 rounded-full bg-white/15 grid place-items-center font-bold text-[12px] shrink-0">{who.slice(0, 2).toUpperCase()}</span>
          <div className="min-w-0">
            <p className="font-semibold truncate">{who}</p>
            <p className="text-white/60 truncate">{role}</p>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <header className="h-14 shrink-0 bg-surface border-b border-line flex items-center gap-2 px-4 md:px-6">
          <p className="flex-1 min-w-0 truncate text-[15px] font-semibold text-muted">
            {product} <span className="text-line mx-1">/</span> <span className="text-ink">{current?.l}</span>
          </p>
          <Segmented size="sm" label={t('Language', 'භාෂාව')} value={lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිං', aria: 'සිංහල' }, { v: 'en', l: 'EN', aria: 'English' }]} />
          <a href="#/guide" className="h-10 w-10 rounded-full grid place-items-center text-navy hover:bg-mist" aria-label={t('How to use this system', 'පද්ධතිය භාවිතා කරන ආකාරය')} title={t('How to use this system', 'පද්ධතිය භාවිතා කරන ආකාරය')}>
            <CircleHelp size={20} />
          </a>
          <button onClick={() => { logout(); navigate('login'); }} className="h-10 px-3 rounded-full flex items-center gap-1.5 text-sm font-semibold text-navy hover:bg-mist">
            <LogOut size={17} /> <span className="hidden sm:inline">{t('Sign out', 'ඉවත් වන්න')}</span>
          </button>
        </header>
        <main className="flex-1 min-w-0 overflow-y-auto thin-scroll" id="portal-main">
          <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function PageHead({ title, sub, right }: { title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[26px] md:text-[30px] font-bold leading-tight">{title}</h1>
        {sub && <p className="text-muted mt-1 max-w-[70ch]">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ title, children, right, className }: { title?: ReactNode; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-card bg-surface border border-line hc-border', className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-line">
          <h2 className="font-bold text-[16px] flex items-center gap-2">{title}</h2>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
