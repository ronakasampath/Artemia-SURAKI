import type { PublicRecord } from '../lib/types';
import { D } from './time';
import { AUTHORITY } from './notices';

/** Officially approved, publishable records shown in the public directory. */
export function seedRecords(now: number): PublicRecord[] {
  return [
    {
      id: 'pr-b1', orgId: 'org-b', kind: 'notice', at: now - 128 * D, authority: AUTHORITY, source: 'ISP/2026/014 (demo)',
      title: { en: 'Notice: complaint procedures for students', si: 'නිවේදනය: සිසුන් සඳහා පැමිණිලි ක්‍රියා පටිපාටිය' },
      body: { en: 'The university was asked to set up an independent channel for students to raise harassment concerns, separate from academic departments.', si: 'අධ්‍යයන අංශවලින් වෙන් වූ, හිරිහැර පිළිබඳ පැමිණිලි කිරීමට ස්වාධීන මාර්ගයක් සිසුන්ට ලබා දෙන ලෙස විශ්වවිද්‍යාලයට දැනුම් දෙන ලදී.' },
      status: { en: 'Corrective action required', si: 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග අවශ්‍යයි' },
    },
    {
      id: 'pr-b2', orgId: 'org-b', kind: 'corrective', at: now - 64 * D, authority: AUTHORITY, source: 'ISP/2026/014-V (demo)',
      title: { en: 'Independent student complaints committee set up', si: 'ස්වාධීන ශිෂ්‍ය පැමිණිලි කමිටුවක් පිහිටුවන ලදී' },
      body: { en: 'Committee includes two external members. Verified against meeting records and the published procedure.', si: 'කමිටුවේ බාහිර සාමාජිකයින් දෙදෙනෙක් සිටී. රැස්වීම් වාර්තා හා ප්‍රකාශිත ක්‍රියා පටිපාටිය සමඟ තහවුරු කරන ලදී.' },
      status: { en: 'Verified complete', si: 'සම්පූර්ණ බව තහවුරුයි' },
    },
    {
      id: 'pr-c1', orgId: 'org-c', kind: 'notice', at: now - 40 * D, authority: AUTHORITY, source: 'ISP/2026/031 (demo)',
      title: { en: 'Notice: staff safety on night shifts', si: 'නිවේදනය: රාත්‍රී සේවා මුරවල කාර්ය මණ්ඩල ආරක්ෂාව' },
      body: { en: 'The hotel was asked to provide safe transport and paired duty for staff finishing after 10 pm.', si: 'රාත්‍රී 10න් පසු සේවය අවසන් කරන කාර්ය මණ්ඩලයට ආරක්ෂිත ප්‍රවාහනය හා යුගල රාජකාරි ලබා දෙන ලෙස දැනුම් දෙන ලදී.' },
      status: { en: 'Corrective action pending verification', si: 'නිවැරදි කිරීම් තහවුරු කිරීමට ඇත' },
    },
    {
      id: 'pr-d1', orgId: 'org-d', kind: 'notice', at: now - 95 * D, authority: AUTHORITY, source: 'ISP/2026/022 (demo)',
      title: { en: 'Notice: conductor conduct on route 4 (demo)', si: 'නිවේදනය: 4 මාර්ගයේ කොන්දොස්තර හැසිරීම (ආදර්ශ)' },
      body: { en: 'The operator was asked to introduce a passenger complaint line and conduct training for crew.', si: 'මගී පැමිණිලි දුරකථන මාර්ගයක් හා කාර්ය මණ්ඩල පුහුණුවක් හඳුන්වා දෙන ලෙස දැනුම් දෙන ලදී.' },
      status: { en: 'Corrective action required', si: 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග අවශ්‍යයි' },
    },
    {
      id: 'pr-d2', orgId: 'org-d', kind: 'appeal', at: now - 70 * D, authority: AUTHORITY, source: 'ISP/2026/022-A (demo)',
      title: { en: 'Appeal outcome: notice upheld in part', si: 'අභියාචනා ප්‍රතිඵලය: නිවේදනය අර්ධ වශයෙන් තහවුරු විය' },
      body: { en: 'The training requirement stands. The deadline was extended by 30 days at the operator’s request.', si: 'පුහුණු අවශ්‍යතාව එලෙසම පවතී. ක්‍රියාකරුගේ ඉල්ලීම මත අවසාන දිනය දින 30කින් දීර්ඝ කරන ලදී.' },
      status: { en: 'Appeal decided', si: 'අභියාචනය තීරණය විය' },
    },
    {
      id: 'pr-f1', orgId: 'org-f', kind: 'corrective', at: now - 20 * D, authority: AUTHORITY, source: 'ISP/2026/040 (demo)',
      title: { en: 'Lighting and CCTV installed near hostels', si: 'නේවාසිකාගාර අසල ආලෝකය හා CCTV සවි කරන ලදී' },
      body: { en: 'Verified by site visit. Further check scheduled in 6 months.', si: 'ස්ථාන පරීක්ෂණයෙන් තහවුරු විය. මාස 6කින් නැවත පරීක්ෂා කෙරේ.' },
      status: { en: 'Verified complete', si: 'සම්පූර්ණ බව තහවුරුයි' },
    },
    {
      id: 'pr-j1', orgId: 'org-j', kind: 'notice', at: now - 60 * D, authority: AUTHORITY, source: 'ISP/2026/051 (demo)', fromNotice: 'n-m2',
      title: { en: 'Notice: lighting and toilet safety at the main station', si: 'නිවේදනය: ප්‍රධාන දුම්රිය ස්ථානයේ ආලෝකය හා වැසිකිළි ආරක්ෂාව' },
      body: { en: 'A platform exit is unlit at night and the women’s toilet cannot be locked.', si: 'වේදිකා පිටවීමක් රාත්‍රියේ අඳුරු වන අතර කාන්තා වැසිකිළිය අගුළු දැමිය නොහැක.' },
      status: { en: 'Corrective action required', si: 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග අවශ්‍යයි' },
    },
    {
      id: 'pr-j2', orgId: 'org-j', kind: 'corrective', at: now - 18 * D, authority: AUTHORITY, source: 'ISP/2026/051-V (demo)', fromNotice: 'n-m2',
      title: { en: 'Lighting, CCTV and new toilet locks installed', si: 'ආලෝකය, CCTV හා නව වැසිකිළි අගුළු සවි කරන ලදී' },
      body: { en: 'Verified on a site visit.', si: 'ස්ථාන පරීක්ෂණයෙන් තහවුරු විය.' },
      status: { en: 'Verified complete', si: 'සම්පූර්ණ බව තහවුරුයි' },
    },
    {
      id: 'pr-a1', orgId: 'org-a', kind: 'notice', at: now - 140 * D, authority: AUTHORITY, source: 'ISP/2026/009 (demo)', fromNotice: 'n-a0',
      title: { en: 'Notice: an independent way for floor staff to raise concerns', si: 'නිවේදනය: සේවකයින්ට ගැටලු මතු කිරීමට ස්වාධීන මාර්ගයක්' },
      body: { en: 'Concerns raised by floor staff were being handled by the supervisors they were about.', si: 'සේවකයින් මතු කළ ගැටලු, ඒවාට අදාළ අධීක්ෂකයින් විසින්ම හසුරුවමින් තිබුණි.' },
      status: { en: 'Corrective action required', si: 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග අවශ්‍යයි' },
    },
    {
      id: 'pr-a2', orgId: 'org-a', kind: 'appeal', at: now - 112 * D, authority: AUTHORITY, source: 'ISP/2026/009-A (demo)', fromNotice: 'n-a0',
      title: { en: 'Deadline extended by 14 days', si: 'අවසාන දිනය දින 14කින් දීර්ඝ කරන ලදී' },
      body: { en: 'Granted at the company’s request so a training provider could be appointed.', si: 'පුහුණු සපයන්නෙකු පත් කිරීම සඳහා සමාගමේ ඉල්ලීම මත ලබා දෙන ලදී.' },
      status: { en: 'Appeal decided', si: 'අභියාචනය තීරණය විය' },
    },
    {
      id: 'pr-a3', orgId: 'org-a', kind: 'corrective', at: now - 100 * D, authority: AUTHORITY, source: 'ISP/2026/009-V (demo)', fromNotice: 'n-a0',
      title: { en: 'Welfare officer on every shift and staff training completed', si: 'සෑම මුරයකටම සුබසාධන නිලධාරිනියක් හා කාර්ය මණ්ඩල පුහුණුව අවසන්' },
      body: { en: 'Appointments and training records checked. Follow-up visit found the channel in use.', si: 'පත්වීම් හා පුහුණු වාර්තා පරීක්ෂා කළා. පසු විපරම් චාරිකාවේදී මාර්ගය භාවිතයේ ඇති බව පෙනුණි.' },
      status: { en: 'Verified complete', si: 'සම්පූර්ණ බව තහවුරුයි' },
    },
  ];
}
