import { useApp } from './store';
import type { Bi, Category, CaseStatus, ContactPref, Lang, PlaceType, Text, Urgency, Verification, WhenKey } from './types';

export function pick(x: Text | undefined, lang: Lang): string {
  if (x == null) return '';
  return typeof x === 'string' ? x : x[lang] || x.en;
}

/** t('English', 'සිංහල') — every UI string is written in both languages side by side. */
export function useT() {
  const lang = useApp((s) => s.settings.lang);
  const t = (en: string, si: string) => (lang === 'si' ? si : en);
  const tb = (x: Text | undefined) => pick(x, lang);
  return { t, tb, lang };
}

export const CATEGORY: Record<Category, Bi & { hint: Bi }> = {
  harassment: {
    en: 'Sexual harassment',
    si: 'ලිංගික හිරිහැර',
    hint: { en: 'Unwanted touching, comments, messages or requests', si: 'අකමැති ස්පර්ශ, කතා, පණිවිඩ හෝ ඉල්ලීම්' },
  },
  intimidation: {
    en: 'Threats or intimidation',
    si: 'තර්ජන හෝ බිය ගැන්වීම්',
    hint: { en: 'Being threatened, pressured or followed', si: 'තර්ජනය, බලපෑම් හෝ පසුපස ලුහුබැඳීම' },
  },
  discrimination: {
    en: 'Unfair treatment',
    si: 'අසාධාරණ ලෙස සැලකීම',
    hint: { en: 'Treated differently because you are a woman', si: 'කාන්තාවක් නිසා වෙනස් ලෙස සැලකීම' },
  },
  physical: {
    en: 'Physical harm',
    si: 'ශාරීරික හිංසනය',
    hint: { en: 'Pushed, grabbed, hit or hurt', si: 'තල්ලු කිරීම, අල්ලා ගැනීම, පහර දීම' },
  },
  unsafe: {
    en: 'Unsafe place',
    si: 'අනාරක්ෂිත ස්ථානයක්',
    hint: { en: 'No lights, no locks, no safe toilets', si: 'ආලෝකය, අගුළු, ආරක්ෂිත වැසිකිළි නොමැති වීම' },
  },
  other: {
    en: 'Something else / not sure',
    si: 'වෙනත් / විශ්වාස නැහැ',
    hint: { en: 'Tell us in your own words', si: 'ඔබේම වචනවලින් කියන්න' },
  },
};

export const PLACE: Record<PlaceType, Bi> = {
  workplace: { en: 'Workplace', si: 'සේවා ස්ථානය' },
  university: { en: 'University or school', si: 'විශ්වවිද්‍යාලය / පාසල' },
  transport: { en: 'Bus or train', si: 'බස් / දුම්රිය' },
  hotel: { en: 'Hotel or venue', si: 'හෝටලය / ශාලාව' },
  public: { en: 'Public place', si: 'පොදු ස්ථානයක්' },
  online: { en: 'Online', si: 'අන්තර්ජාලය' },
  other: { en: 'Somewhere else', si: 'වෙනත් තැනක්' },
};

export const WHEN: Record<WhenKey, Bi> = {
  today: { en: 'Today', si: 'අද' },
  week: { en: 'This week', si: 'මේ සතියේ' },
  month: { en: 'This month', si: 'මේ මාසයේ' },
  earlier: { en: 'Earlier', si: 'ඊට කලින්' },
};

export const URGENCY: Record<Urgency, Bi> = {
  immediate: { en: 'Immediate', si: 'වහාම' },
  high: { en: 'High', si: 'ඉහළ' },
  standard: { en: 'Standard', si: 'සාමාන්‍ය' },
  low: { en: 'Low', si: 'අඩු' },
};

export const VERIFICATION: Record<Verification, Bi> = {
  not_assessed: { en: 'Not yet assessed', si: 'තවම තක්සේරු කර නැත' },
  consistent: { en: 'Account is consistent', si: 'විස්තරය අනුකූලයි' },
  corroborated: { en: 'Independently corroborated', si: 'ස්වාධීනව තහවුරු විය' },
  not_established: { en: 'Could not be established', si: 'තහවුරු කළ නොහැකි විය' },
};

/** Reviewer-facing status names */
export const STATUS: Record<CaseStatus, Bi> = {
  received: { en: 'Received', si: 'ලැබුණි' },
  in_review: { en: 'In review', si: 'සමාලෝචනයේ' },
  awaiting_reporter: { en: 'Waiting for reporter', si: 'පැමිණිලිකරුගේ පිළිතුරට' },
  referred: { en: 'Referred for support', si: 'සහාය සඳහා යොමු විය' },
  org_notified: { en: 'Organisation notified', si: 'ආයතනයට දැනුම් දුන්නා' },
  org_responded: { en: 'Organisation responded', si: 'ආයතනය පිළිතුරු දුන්නා' },
  outcome_recorded: { en: 'Outcome recorded', si: 'ප්‍රතිඵලය සටහන් විය' },
  closed: { en: 'Closed', si: 'අවසන්' },
};

/** Reporter-facing, plain-language version of the same status */
export const STATUS_PLAIN: Record<CaseStatus, Bi> = {
  received: { en: 'We have your report', si: 'ඔබේ පැමිණිල්ල ලැබුණා' },
  in_review: { en: 'An independent reviewer is reading it', si: 'ස්වාධීන සමාලෝචකයෙක් එය කියවමින් සිටී' },
  awaiting_reporter: { en: 'We have a question for you', si: 'ඔබෙන් අසන්න ප්‍රශ්නයක් තිබේ' },
  referred: { en: 'Support has been arranged', si: 'සහාය ලබා දීමට කටයුතු කළා' },
  org_notified: { en: 'The organisation has been asked to act', si: 'ක්‍රියා කරන්නැයි ආයතනයට දැනුම් දුන්නා' },
  org_responded: { en: 'The organisation has replied', si: 'ආයතනය පිළිතුරු දී ඇත' },
  outcome_recorded: { en: 'Changes have been checked', si: 'සිදු කළ වෙනස්කම් පරීක්ෂා කළා' },
  closed: { en: 'Your case is closed', si: 'ඔබේ පැමිණිල්ල අවසන් කළා' },
};

export const CONTACT: Record<ContactPref, Bi & { hint: Bi }> = {
  messages: {
    en: 'Only inside this app',
    si: 'මෙම යෙදුම තුළින් පමණක්',
    hint: { en: 'Secure messages. No calls, no SMS.', si: 'ආරක්ෂිත පණිවිඩ. ඇමතුම් හෝ SMS නැහැ.' },
  },
  counsellor: {
    en: 'A counsellor may call me',
    si: 'උපදේශකයෙකුට මට කතා කළ හැකියි',
    hint: { en: 'From the 1938 helpline, only at times you choose', si: '1938 සහාය සේවයෙන්, ඔබ තෝරන වේලාවට පමණයි' },
  },
  none: {
    en: "Don't contact me",
    si: 'මා හා සම්බන්ධ වෙන්න එපා',
    hint: { en: "I'll check the status myself", si: 'මම තත්ත්වය මා විසින්ම බලන්නම්' },
  },
};

export const DISTRICTS: Bi[] = [
  { en: 'Colombo', si: 'කොළඹ' },
  { en: 'Gampaha', si: 'ගම්පහ' },
  { en: 'Kalutara', si: 'කළුතර' },
  { en: 'Kandy', si: 'මහනුවර' },
  { en: 'Galle', si: 'ගාල්ල' },
  { en: 'Matara', si: 'මාතර' },
  { en: 'Kurunegala', si: 'කුරුණෑගල' },
  { en: 'Jaffna', si: 'යාපනය' },
  { en: 'Anuradhapura', si: 'අනුරාධපුරය' },
  { en: 'Batticaloa', si: 'මඩකලපුව' },
  { en: 'Ratnapura', si: 'රත්නපුර' },
  { en: 'Badulla', si: 'බදුල්ල' },
];

export function fmtDate(ts: number, lang: Lang, withTime = false) {
  const d = new Date(ts);
  const months = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    si: ['ජන', 'පෙබ', 'මාර්', 'අප්‍රේ', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ', 'දෙසැ'],
  }[lang];
  const base = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return base;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${base}, ${((h + 11) % 12) + 1}:${m} ${h < 12 ? (lang === 'si' ? 'පෙ.ව.' : 'am') : lang === 'si' ? 'ප.ව.' : 'pm'}`;
}

export function ago(ts: number, lang: Lang) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return lang === 'si' ? 'දැන්' : 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return lang === 'si' ? `මිනිත්තු ${m}කට පෙර` : `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return lang === 'si' ? `පැය ${h}කට පෙර` : `${h} h ago`;
  const d = Math.round(h / 24);
  return lang === 'si' ? `දින ${d}කට පෙර` : `${d} d ago`;
}
