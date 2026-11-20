import type { CaseFile, TimelineEvent } from '../lib/types';
import { findPrivacyFlags, triage } from '../lib/triage';
import { D, H } from './time';

type Seed = Partial<CaseFile> & Pick<CaseFile, 'id' | 'ref' | 'category' | 'placeType' | 'description' | 'district'>;

function mk(now: number, p: Seed, ageH: number): CaseFile {
  const createdAt = now - ageH * H;
  const t = triage(p.description, p.category, !!p.ongoing);
  return {
    code: 'DEM-O00-000',
    createdAt,
    when: 'week',
    ongoing: false,
    lang: 'en',
    evidence: [],
    contact: 'messages',
    wantsSupport: false,
    ai: { ...t, privacyFlags: findPrivacyFlags(p.description) },
    verification: 'not_assessed',
    status: 'received',
    messages: [],
    timeline: [{ id: `${p.id}-e0`, at: createdAt, step: 'received', label: { en: 'Report received', si: 'පැමිණිල්ල ලැබුණි' }, reporterVisible: true }],
    referrals: [],
    assignedTo: 'R-07',
    reporterUnread: 0,
    reviewerUnread: 0,
    source: 'app',
    ...p,
  } as CaseFile;
}

const ev = (id: string, at: number, step: TimelineEvent['step'], en: string, si: string, reporterVisible = true, detail?: TimelineEvent['detail']): TimelineEvent => ({
  id, at, step, label: { en, si }, reporterVisible, detail,
});

/** Mock reports. `mine: true` ones belong to the demo user account. */
export function seedCases(now: number): CaseFile[] {
  return [
    // ---------- the demo user's own reports ----------
    mk(now, {
      id: 'm1', ref: 'SRK-7Q4M-2KXD', code: 'K7M-4QD-82X', mine: true, lang: 'si',
      category: 'harassment', placeType: 'transport', orgId: 'org-d', district: 'Gampaha', when: 'week', ongoing: true,
      description: 'මම දිනපතා යන බස් එකේ කොන්දොස්තර කෙනෙක් බස් එක පිරිලා තියෙන වෙලාවට නැවත නැවතත් මාව ස්පර්ශ කරනවා. මම විරෝධය පෑවම ඔහු හිනා වෙලා අනෙක් මගීන් ඉදිරියේ මාව ලැජ්ජාවට පත් කළා.',
      status: 'awaiting_reporter', verification: 'consistent', reporterUnread: 1,
      human: { category: 'harassment', urgency: 'high', by: 'R-07', at: now - 3 * D, overridden: false },
      messages: [
        { id: 'm1-1', from: 'system', at: now - 4 * D, text: { en: 'Thank you for telling us. An independent reviewer will read your report within 2 working days. Questions will appear here.', si: 'අපට කීවාට ස්තූතියි. වැඩ කරන දින 2ක් ඇතුළත ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවයි. ප්‍රශ්න තිබේ නම් මෙහි පෙන්වයි.' } },
        { id: 'm1-2', from: 'reviewer', at: now - 5 * H, text: { en: 'Thank you for trusting us. Roughly what time of day does this happen, and on which route? You don’t need to give the bus number.', si: 'අපව විශ්වාස කළාට ස්තූතියි. මෙය සිදු වන්නේ දවසේ ආසන්න වශයෙන් කුමන වේලාවකද, කුමන මාර්ගයේද? බස් අංකය අවශ්‍ය නැහැ.' } },
      ],
      timeline: [
        ev('m1-e0', now - 4 * D, 'received', 'Report received', 'පැමිණිල්ල ලැබුණි'),
        ev('m1-e1', now - 3 * D, 'in_review', 'An independent reviewer started reading your report', 'ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවීම ඇරඹුවා'),
        ev('m1-e2', now - 5 * H, 'awaiting_reporter', 'The reviewer asked you a question', 'සමාලෝචකයා ඔබෙන් ප්‍රශ්නයක් ඇසුවා'),
      ],
    }, 4 * 24),
    mk(now, {
      id: 'm2', ref: 'SRK-N3HC-8WQ4', code: 'P2N-8HC-W4Q', mine: true,
      category: 'unsafe', placeType: 'transport', orgId: 'org-j', district: 'Colombo', when: 'month',
      description: 'The exit from platform 3 at the main station has no lights after 7 pm and the women’s toilet has no working lock. I have been followed there twice.',
      status: 'closed', noticeId: 'n-m2', verification: 'corroborated',
      human: { category: 'unsafe', urgency: 'standard', by: 'R-04', at: now - 68 * D, overridden: false },
      messages: [
        { id: 'm2-1', from: 'system', at: now - 70 * D, text: { en: 'Thank you for telling us. An independent reviewer will read your report within 2 working days.', si: 'අපට කීවාට ස්තූතියි. වැඩ කරන දින 2ක් ඇතුළත ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවයි.' } },
        { id: 'm2-2', from: 'reviewer', at: now - 18 * D, text: { en: 'Lights and new locks have been installed and checked on a site visit. Thank you, your report made this happen.', si: 'ආලෝකය හා නව අගුළු සවි කර ස්ථාන පරීක්ෂණයකින් තහවුරු කළා. ස්තූතියි, ඔබේ පැමිණිල්ල නිසා මෙය සිදු විය.' } },
      ],
      timeline: [
        ev('m2-e0', now - 70 * D, 'received', 'Report received', 'පැමිණිල්ල ලැබුණි'),
        ev('m2-e1', now - 68 * D, 'in_review', 'An independent reviewer started reading your report', 'ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවීම ඇරඹුවා'),
        ev('m2-e2', now - 60 * D, 'org_notified', 'The organisation was asked to act. Your identity was not shared.', 'ක්‍රියා කරන ලෙස ආයතනයට දැනුම් දුන්නා. ඔබේ අනන්‍යතාව බෙදා ගත්තේ නැහැ.'),
        ev('m2-e3', now - 45 * D, 'org_responded', 'The organisation replied with a plan to fix the problem', 'ගැටලුව විසඳීමට සැලැස්මක් සමඟ ආයතනය පිළිතුරු දුන්නා'),
        ev('m2-e4', now - 20 * D, 'outcome_recorded', 'The reviewer checked the organisation’s changes', 'ආයතනය කළ වෙනස්කම් සමාලෝචකයා පරීක්ෂා කළා', true,
          { en: 'Lighting, CCTV and new locks verified on a site visit.', si: 'ආලෝකය, CCTV හා නව අගුළු ස්ථාන පරීක්ෂණයෙන් තහවුරු විය.' }),
        ev('m2-e5', now - 18 * D, 'note', 'An official record was published. It does not mention you.', 'නිල වාර්තාවක් ප්‍රකාශයට පත් කළා. එහි ඔබ ගැන සඳහනක් නැහැ.'),
        ev('m2-e6', now - 18 * D, 'closed', 'Case closed. You can still send messages for 90 days.', 'පැමිණිල්ල අවසන් කළා. තවත් දින 90ක් පණිවිඩ යැවිය හැකියි.'),
      ],
    }, 70 * 24),
    mk(now, {
      id: 'm3', ref: 'SRK-F8TJ-6MBE', code: 'T6F-MB8-EJ2', mine: true,
      category: 'discrimination', placeType: 'workplace', orgId: 'org-h', district: 'Gampaha', when: 'month',
      description: 'After I asked for maternity leave, my supervisor cut my shifts from six days to three and said pregnant women slow the team down.',
      messages: [
        { id: 'm3-1', from: 'system', at: now - 5 * H, text: { en: 'Thank you for telling us. An independent reviewer will read your report within 2 working days. Questions will appear here.', si: 'අපට කීවාට ස්තූතියි. වැඩ කරන දින 2ක් ඇතුළත ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවයි. ප්‍රශ්න තිබේ නම් මෙහි පෙන්වයි.' } },
      ],
    }, 5),

    // ---------- other people's reports (seen only by reviewers) ----------
    mk(now, {
      id: 'c7', ref: 'SRK-B2RW-7KDN', category: 'harassment', placeType: 'workplace', orgId: 'org-g', district: 'Kurunegala', ongoing: true,
      description: 'A senior doctor makes sexual comments to nurses on night duty and blocks the door of the duty room. Two of us have asked to change shifts.',
    }, 1),
    mk(now, {
      id: 'c1', ref: 'SRK-9QWE-5RTN', category: 'harassment', placeType: 'workplace', orgId: 'org-a', district: 'Colombo', when: 'month',
      description: 'A line supervisor in the cutting section keeps making comments about how women on the floor dress and stands too close when checking work. Several of us avoid that section now.',
    }, 3),
    mk(now, {
      id: 'c3', ref: 'SRK-L6VB-82NS', category: 'physical', placeType: 'public', district: 'Gampaha', when: 'today', ongoing: true,
      description: 'A man at the bus halt grabbed my arm and pushed me when I refused to talk. He waits there every morning.',
      status: 'awaiting_reporter',
      human: { category: 'physical', urgency: 'immediate', by: 'R-07', at: now - 5 * H, overridden: false },
    }, 6),
    mk(now, {
      id: 'c5', ref: 'SRK-4ZTR-H7PE', category: 'discrimination', placeType: 'workplace', orgId: 'org-e', district: 'Colombo', when: 'earlier',
      description: 'After I told my manager I was pregnant I was removed from the promotion list without any explanation.',
    }, 20),
    mk(now, {
      id: 'c8', ref: 'SRK-Z5PL-3HQE', category: 'intimidation', placeType: 'university', orgId: 'org-i', district: 'Matara', source: 'phone_1938', contact: 'none',
      description: 'Caller (via 1938) says a lecturer warned female students they will fail the final exam unless they join his paid tuition class at his home.',
    }, 30),
    mk(now, {
      id: 'c2', ref: 'SRK-7H2Q-K9DM', category: 'intimidation', placeType: 'university', orgId: 'org-b', district: 'Kandy', ongoing: true,
      description: 'A lecturer said he would fail me in the practical if I complained about his messages again. I am scared to attend the lab sessions.',
      status: 'in_review', reviewerUnread: 1, verification: 'consistent',
      human: { category: 'intimidation', urgency: 'high', by: 'R-07', at: now - 40 * H, overridden: false },
    }, 49),
    mk(now, {
      id: 'c9', ref: 'SRK-Q8MV-4TNA', category: 'harassment', placeType: 'public', district: 'Galle',
      description: 'A group of men film women at the beach park and post the videos online with rude comments.',
      status: 'in_review',
      human: { category: 'harassment', urgency: 'standard', by: 'R-04', at: now - 60 * H, overridden: false },
    }, 72),
    mk(now, {
      id: 'c4', ref: 'SRK-3MPA-X4TC', category: 'unsafe', placeType: 'transport', orgId: 'org-d', district: 'Gampaha', when: 'month',
      description: 'The last bus depot has no lights near the women’s waiting area and the toilet door has a broken lock.',
      status: 'referred', referrals: [{ to: '1938', at: now - 90 * H }],
      human: { category: 'unsafe', urgency: 'standard', by: 'R-04', at: now - 100 * H, overridden: false },
    }, 120),
    mk(now, {
      id: 'c6', ref: 'SRK-8KJD-3WQA', category: 'harassment', placeType: 'hotel', orgId: 'org-c', district: 'Galle',
      description: 'Guests and a duty manager make sexual comments to housekeeping staff on night shift. Requests for paired duty were ignored.',
      status: 'org_responded', noticeId: 'n-c6', verification: 'corroborated',
      human: { category: 'harassment', urgency: 'high', by: 'R-04', at: now - 30 * D, overridden: false },
    }, 34 * 24),
    mk(now, {
      id: 'c10', ref: 'SRK-A1KD-9PZX', category: 'harassment', placeType: 'workplace', orgId: 'org-a', district: 'Colombo',
      description: 'Complaints from the factory floor were handled by the same supervisors they were about. Women stopped using the complaint box.',
      status: 'closed', noticeId: 'n-a0', verification: 'corroborated',
      human: { category: 'harassment', urgency: 'high', by: 'R-04', at: now - 148 * D, overridden: false },
    }, 150 * 24),
  ];
}
