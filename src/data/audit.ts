import type { AuditEntry } from '../lib/types';

export function seedAudit(now: number): AuditEntry[] {
  const e = (minsAgo: number, actor: string, role: AuditEntry['role'], en: string, si: string, target: string): AuditEntry => ({
    id: `au-${minsAgo}-${target}`, at: now - minsAgo * 60_000, actor, role, action: { en, si }, target,
  });
  return [
    e(12, 'A-01', 'admin', 'Revoked access for inactive account', 'අක්‍රිය ගිණුමක ප්‍රවේශය අවලංගු කළා', 'R-11'),
    e(180, 'system', 'system', 'AI triage suggestion created', 'AI වර්ගීකරණ යෝජනාව සෑදුණා', 'SRK-9QWE-5RTN'),
    e(300, 'R-07', 'reviewer', 'Confirmed urgency: Immediate', 'හදිසි බව තහවුරු කළා: වහාම', 'SRK-L6VB-82NS'),
    e(305, 'R-07', 'reviewer', 'Opened identifying details (reason: safety check)', 'හඳුනාගැනීමේ විස්තර විවෘත කළා (හේතුව: ආරක්ෂක පරීක්ෂාව)', 'SRK-L6VB-82NS'),
    e(2400, 'R-07', 'reviewer', 'Confirmed AI suggestion', 'AI යෝජනාව තහවුරු කළා', 'SRK-7H2Q-K9DM'),
    e(5400, 'R-04', 'reviewer', 'Referred to 1938 helpline (simulated)', '1938 සහාය සේවයට යොමු කළා (අනුකරණය)', 'SRK-3MPA-X4TC'),
    e(8640, 'Demo Hotel C', 'org', 'Submitted corrective-action plan', 'නිවැරදි කිරීමේ සැලැස්ම ඉදිරිපත් කළා', 'n-c6'),
    e(60, 'system', 'system', 'AI triage suggestion created', 'AI වර්ගීකරණ යෝජනාව සෑදුණා', 'SRK-B2RW-7KDN'),
    e(1800, 'R-07', 'reviewer', 'Logged a case received by the 1938 helpline', '1938 සහාය සේවයෙන් ලැබුණු ගොනුවක් ඇතුළත් කළා', 'SRK-Z5PL-3HQE'),
    e(25920, 'P-02', 'publication', 'Approved record for public directory', 'පොදු නාමාවලියට අනුමත කළා', 'n-m2'),
    e(43200, 'A-01', 'admin', 'Verified organisation account', 'ආයතන ගිණුම තහවුරු කළා', 'Sample Rail Services J'),
  ];
}
