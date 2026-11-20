import type { Auth, UserAccount } from '../lib/types';
import { D } from './time';

/** Demo sign-in accounts shown on the login page. Passwords are for the demo only. */
export const DEMO_ACCOUNTS: (Auth & { email: string; password: string })[] = [
  { role: 'user', id: 'U-DEMO', name: 'Demo user', email: 'user@suraki.demo', password: 'demo1234' },
  { role: 'officer', id: 'R-07', name: 'K. Silva', email: 'officer@suraki.demo', password: 'demo1234' },
  { role: 'org', id: 'ORG-A1', name: 'HR · Example Company A', email: 'hr@company-a.demo', password: 'demo1234', orgId: 'org-a' },
  { role: 'admin', id: 'A-01', name: 'System admin', email: 'admin@suraki.demo', password: 'demo1234' },
];

/** Staff and organisation accounts managed by the administrator. Reporters are anonymous and never listed. */
export function seedUsers(now: number): UserAccount[] {
  const u = (id: string, name: string, email: string, role: UserAccount['role'], daysAgo: number, extra: Partial<UserAccount> = {}): UserAccount => ({
    id, name, email, role, active: true, mfa: true, createdAt: now - daysAgo * D, ...extra,
  });
  return [
    u('R-07', 'K. Silva', 'officer@suraki.demo', 'officer', 210),
    u('R-04', 'A. Fernando', 'r04@suraki.demo', 'officer', 180),
    u('O-03', 'M. Jayawardena', 'o03@suraki.demo', 'authorised', 240),
    u('P-02', 'S. Rathnayake', 'p02@suraki.demo', 'publication', 160),
    u('V-01', 'N. Wickramasinghe', 'v01@suraki.demo', 'oversight', 300),
    u('R-11', 'T. Bandara', 'r11@suraki.demo', 'officer', 400, { active: false, mfa: false }),
    u('ORG-A1', 'HR · Example Company A', 'hr@company-a.demo', 'org', 120, { orgId: 'org-a' }),
    u('ORG-B1', 'Registrar · Sample University B', 'registrar@university-b.demo', 'org', 150, { orgId: 'org-b' }),
    u('ORG-C1', 'GM · Demo Hotel C', 'gm@hotel-c.demo', 'org', 90, { orgId: 'org-c' }),
    u('ORG-J1', 'Safety · Sample Rail J', 'safety@rail-j.demo', 'org', 60, { orgId: 'org-j' }),
    u('A-01', 'System admin', 'admin@suraki.demo', 'admin', 365),
  ];
}
