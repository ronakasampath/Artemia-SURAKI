import { create } from 'zustand';
import { clearToasts } from '../components/ui';

/** Top-level pages. Kept in the URL hash so links and refresh work on static hosting. */
export type Route = 'login' | 'guide' | 'directory' | 'user' | 'mobile' | 'officer' | 'org' | 'admin' | 'app';
const ROUTES: Route[] = ['login', 'guide', 'directory', 'user', 'mobile', 'officer', 'org', 'admin', 'app'];

const parse = (): Route => {
  if (typeof location === 'undefined') return 'login';
  const h = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0] as Route;
  return ROUTES.includes(h) ? h : 'login';
};

interface Nav {
  route: Route;
  reviewer: { view: 'queue' | 'case' | 'notices' | 'publication' | 'audit'; caseId?: string };
  org: { view: 'overview' | 'notice' | 'actions' | 'branches' | 'profile' | 'appeals'; noticeId?: string };
  admin: { view: 'access' | 'users' | 'orgs' | 'audit' | 'security' };
  dir: { orgId?: string };
  navigate: (r: Route) => void;
  setReviewer: (p: Nav['reviewer']) => void;
  setOrg: (p: Nav['org']) => void;
  setAdmin: (p: Nav['admin']) => void;
  setDir: (p: Nav['dir']) => void;
}

export const useNav = create<Nav>((set) => ({
  route: parse(),
  reviewer: { view: 'queue' },
  org: { view: 'overview' },
  admin: { view: 'access' },
  dir: {},
  navigate: (route) => {
    clearToasts();
    set({ route });
    try {
      if (location.hash !== `#/${route}`) history.pushState(null, '', `#/${route}`);
    } catch { /* ignore */ }
  },
  setReviewer: (reviewer) => set({ reviewer }),
  setOrg: (org) => set({ org }),
  setAdmin: (admin) => set({ admin }),
  setDir: (dir) => set({ dir }),
}));

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => useNav.setState({ route: parse() }));
  window.addEventListener('popstate', () => useNav.setState({ route: parse() }));
}

export const scrollPortalTop = () => document.getElementById('portal-main')?.scrollTo({ top: 0 });
