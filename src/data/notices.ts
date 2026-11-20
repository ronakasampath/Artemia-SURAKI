import type { Bi, Notice } from '../lib/types';
import { D } from './time';

export const AUTHORITY: Bi = { en: 'Independent Safeguarding Panel (fictional)', si: 'ස්වාධීන ආරක්ෂණ මණ්ඩලය (කල්පිත)' };

export function seedNotices(now: number): Notice[] {
  return [
    {
      id: 'n-c6', caseId: 'c6', orgId: 'org-c', issuedAt: now - 40 * D, dueAt: now + 2 * D, status: 'responded', authority: AUTHORITY,
      title: { en: 'Staff safety on night shifts', si: 'රාත්‍රී සේවා මුරවල කාර්ය මණ්ඩල ආරක්ෂාව' },
      summary: { en: 'Concerns were raised about sexual comments towards housekeeping staff during night shifts.', si: 'රාත්‍රී සේවා මුරවලදී නිවාස පාලන කාර්ය මණ්ඩලයට ලිංගික අදහස් දැක්වීම් ගැන ගැටලු මතු විය.' },
      required: [
        { en: 'Provide paired duty after 10 pm', si: 'රාත්‍රී 10න් පසු යුගල රාජකාරි ලබා දීම' },
        { en: 'Arrange safe transport home', si: 'ආරක්ෂිතව නිවසට යාමට ප්‍රවාහනය' },
      ],
      response: {
        text: 'Paired duty roster introduced from 1 October. Contract with a transport provider signed.',
        actions: [
          { id: 'a1', title: { en: 'Paired duty roster after 10 pm', si: 'රාත්‍රී 10න් පසු යුගල රාජකාරි ලේඛනය' }, due: now - 10 * D, status: 'done' },
          { id: 'a2', title: { en: 'Safe transport for night staff', si: 'රාත්‍රී කාර්ය මණ්ඩලයට ආරක්ෂිත ප්‍රවාහනය' }, due: now + 5 * D, status: 'in_progress' },
        ],
        evidence: ['roster_october.pdf', 'transport_contract_signed.pdf'],
        at: now - 6 * D,
      },
      publication: 'none',
    },
    {
      id: 'n-m2', caseId: 'm2', orgId: 'org-j', issuedAt: now - 60 * D, dueAt: now - 30 * D, status: 'verified', authority: AUTHORITY,
      title: { en: 'Lighting and toilet safety at the main station', si: 'ප්‍රධාන දුම්රිය ස්ථානයේ ආලෝකය හා වැසිකිළි ආරක්ෂාව' },
      summary: { en: 'A platform exit is unlit at night and the women’s toilet cannot be locked.', si: 'වේදිකා පිටවීමක් රාත්‍රියේ අඳුරු වන අතර කාන්තා වැසිකිළිය අගුළු දැමිය නොහැක.' },
      required: [
        { en: 'Install lighting and CCTV at the platform 3 exit', si: '3 වේදිකා පිටවීමේ ආලෝකය හා CCTV සවි කිරීම' },
        { en: 'Repair locks in the women’s toilet', si: 'කාන්තා වැසිකිළියේ අගුළු අලුත්වැඩියා කිරීම' },
      ],
      response: {
        text: 'Lighting contractor appointed; locks replaced the same week.',
        actions: [
          { id: 'j1', title: { en: 'Lighting and CCTV at platform 3 exit', si: '3 වේදිකා පිටවීමේ ආලෝකය හා CCTV' }, due: now - 35 * D, status: 'done' },
          { id: 'j2', title: { en: 'New locks in the women’s toilet', si: 'කාන්තා වැසිකිළියට නව අගුළු' }, due: now - 50 * D, status: 'done' },
        ],
        evidence: ['site_photos.pdf', 'contractor_invoice.pdf'],
        at: now - 45 * D,
      },
      outcome: { text: { en: 'Lighting, CCTV and new locks verified on a site visit.', si: 'ආලෝකය, CCTV හා නව අගුළු ස්ථාන පරීක්ෂණයෙන් තහවුරු විය.' }, at: now - 20 * D },
      publication: 'approved',
    },
    {
      id: 'n-a0', caseId: 'c10', orgId: 'org-a', issuedAt: now - 140 * D, dueAt: now - 112 * D, status: 'verified', authority: AUTHORITY, acknowledgedAt: now - 139 * D,
      title: { en: 'An independent way for floor staff to raise concerns', si: 'සේවකයින්ට ගැටලු මතු කිරීමට ස්වාධීන මාර්ගයක්' },
      summary: { en: 'Concerns raised by floor staff were being handled by the supervisors they were about.', si: 'සේවකයින් මතු කළ ගැටලු, ඒවාට අදාළ අධීක්ෂකයින් විසින්ම හසුරුවමින් තිබුණි.' },
      required: [
        { en: 'Appoint a women’s welfare officer on every shift', si: 'සෑම සේවා මුරයකටම කාන්තා සුබසාධන නිලධාරිනියක් පත් කිරීම' },
        { en: 'Replace the complaint box with an independent channel', si: 'පැමිණිලි පෙට්ටිය වෙනුවට ස්වාධීන මාර්ගයක් හඳුන්වා දීම' },
      ],
      response: {
        text: 'Welfare officers appointed on all three shifts. Staff are told about Suraki in induction and on notice boards.',
        actions: [
          { id: 'a0-1', title: { en: 'Women’s welfare officer on every shift', si: 'සෑම මුරයකටම කාන්තා සුබසාධන නිලධාරිනියක්' }, due: now - 120 * D, status: 'done' },
          { id: 'a0-2', title: { en: 'Independent reporting channel on notice boards', si: 'දැන්වීම් පුවරුවල ස්වාධීන පැමිණිලි මාර්ගය' }, due: now - 115 * D, status: 'done' },
          { id: 'a0-3', title: { en: 'Supervisor training on respectful conduct', si: 'ගෞරවනීය හැසිරීම පිළිබඳ අධීක්ෂක පුහුණුව' }, due: now - 98 * D, status: 'done' },
        ],
        evidence: ['welfare_officer_appointments.pdf', 'training_attendance.pdf'],
        at: now - 118 * D,
      },
      outcome: { text: { en: 'Appointments and training records checked. Follow-up visit found the channel in use.', si: 'පත්වීම් හා පුහුණු වාර්තා පරීක්ෂා කළා. පසු විපරම් චාරිකාවේදී මාර්ගය භාවිතයේ ඇති බව පෙනුණි.' }, at: now - 100 * D },
      publication: 'approved',
    },
  ];
}
