import { useEffect, useState } from 'react';
import { useApp } from './lib/store';
import { useNav, type Route } from './lib/nav';
import { useT } from './lib/i18n';
import type { AuthRole } from './lib/types';
import { Toaster } from './components/ui';
import Login from './auth/Login';
import Guide from './guide/Guide';
import UserApp from './user/UserApp';
import MobileView from './mobile/MobileView';
import ReporterApp from './reporter/ReporterApp';
import Reviewer from './portals/Reviewer';
import Org from './portals/Org';
import Admin from './portals/Admin';
import PublicDirectory from './portals/PublicDirectory';

const SURAKI_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#1B3A5C"/><path d="M7.5 23c4.5 0 4-7 8.5-7s4-7 8.5-7" fill="none" stroke="#7fd1c8" stroke-width="2.6" stroke-linecap="round"/><circle cx="7.5" cy="23" r="2.9" fill="#7fd1c8"/><circle cx="16" cy="16" r="2.9" fill="#1B3A5C" stroke="#fff" stroke-width="2.2"/><circle cx="24.5" cy="9" r="2.9" fill="#fff"/></svg>')}`;

/** Which signed-in role each page needs. */
const NEEDS: Partial<Record<Route, AuthRole>> = { user: 'user', mobile: 'user', officer: 'officer', org: 'org', admin: 'admin' };

/** Applies accessibility settings to the whole document. */
function useA11ySettings() {
  const { textScale, contrast, reduceMotion, lang } = useApp((s) => s.settings);
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = ['16px', '18px', '20px'][textScale];
    html.classList.toggle('hc', contrast);
    html.classList.toggle('reduce-motion', reduceMotion);
    html.lang = lang;
  }, [textScale, contrast, reduceMotion, lang]);
}

/** Title and icon for the staff and public pages. The user pages set their own (the cover's). */
function usePageIdentity(route: Route) {
  useEffect(() => {
    if (route === 'user' || route === 'app' || route === 'mobile') return;
    const titles: Partial<Record<Route, string>> = {
      login: 'Sign in · SURAKI', guide: 'How to use · SURAKI', directory: 'Organisation directory · SURAKI',
      officer: 'Review desk · SURAKI', org: 'Organisation portal · SURAKI', admin: 'Administration · SURAKI',
    };
    document.title = titles[route] ?? 'SURAKI';
    const link = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (link) link.href = SURAKI_ICON;
  }, [route]);
}

export default function App() {
  useA11ySettings();
  const { t } = useT();
  const route = useNav((s) => s.route);
  const auth = useApp((s) => s.auth);
  const [standalone] = useState(() => location.hash.startsWith('#/app'));
  usePageIdentity(route);

  // A real phone install (#/app) is the reporter app on its own, with no demo sign-in.
  if (standalone) {
    return (
      <div className="h-[100dvh] w-full max-w-[520px] mx-auto bg-surface relative overflow-clip">
        <ReporterApp standalone />
      </div>
    );
  }

  const need = NEEDS[route];
  if (need && auth?.role !== need) {
    return (
      <>
        <Login notice={auth ? t('That page belongs to another account. Sign in with the right demo account.', 'එම පිටුව වෙනත් ගිණුමකට අයත්ය. නිවැරදි ආදර්ශ ගිණුමෙන් පිවිසෙන්න.') : undefined} />
        <Toaster className="fixed left-0 right-0 bottom-6 z-[60]" />
      </>
    );
  }

  return (
    <>
      {route === 'login' && <Login />}
      {route === 'guide' && <Guide />}
      {route === 'directory' && <PublicDirectory />}
      {route === 'user' && <UserApp />}
      {route === 'mobile' && <MobileView />}
      {route === 'officer' && <Reviewer />}
      {route === 'org' && <Org />}
      {route === 'admin' && <Admin />}
      {route !== 'user' && route !== 'mobile' && <Toaster className="fixed left-0 right-0 bottom-6 z-[60]" />}
    </>
  );
}
