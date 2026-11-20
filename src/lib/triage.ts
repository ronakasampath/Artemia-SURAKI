import type { Bi, Category, PrivacyFlag, Triage, Urgency } from './types';

/**
 * Explainable, rule-based triage. It only *suggests* a category and urgency and always
 * says which words led to the suggestion. A human reviewer confirms or overrides it.
 */
const RULES: { cat: Category; words: string[] }[] = [
  {
    cat: 'harassment',
    words: ['touch', 'touched', 'comment', 'comments', 'body', 'sexual', 'messages', 'photos', 'stare', 'kiss', 'late at night',
      'ස්පර්ශ', 'ශරීරය', 'ලිංගික', 'පණිවිඩ', 'ඡායාරූප', 'අසභ්‍ය', 'හිරිහැර'],
  },
  {
    cat: 'intimidation',
    words: ['threat', 'threaten', 'threatened', 'contract', 'fire me', 'fail', 'marks', 'warned', 'scared', 'follow', 'following', 'waiting outside',
      'තර්ජන', 'කොන්ත්‍රාත්තුව', 'බයයි', 'බය', 'ලකුණු', 'පසුපස'],
  },
  {
    cat: 'discrimination',
    words: ['promotion', 'because i am a woman', 'pregnant', 'salary', 'pay less', 'maternity', 'උසස්වීම', 'ගැබිනි', 'වැටුප', 'කාන්තාවක් නිසා'],
  },
  {
    cat: 'physical',
    words: ['hit', 'pushed', 'grabbed', 'slapped', 'hurt me', 'injured', 'ගැහුවා', 'තල්ලු', 'අල්ලා', 'තුවාල'],
  },
  {
    cat: 'unsafe',
    words: ['no light', 'dark', 'toilet', 'no lock', 'broken lock', 'cctv', 'stores room', 'alone', 'අඳුරු', 'වැසිකිළි', 'අගුල', 'ගබඩා', 'තනියම'],
  },
];

const ESCALATE = ['kill', 'weapon', 'knife', 'tonight', 'waiting outside', 'hurt me', 'මරනවා', 'පිහිය', 'අද රෑ'];
const REPEAT = ['again', 'keeps', 'every day', 'repeatedly', 'many times', 'still', 'නැවතත්', 'දිගටම', 'හැමදාම', 'කිහිප වතාවක්'];

const REASON: Record<string, Bi> = {
  threat: { en: 'Mentions a threat to job, studies or safety', si: 'රැකියාව, අධ්‍යාපනය හෝ ආරක්ෂාවට තර්ජනයක් සඳහන් වේ' },
  repeat: { en: 'Describes repeated or ongoing behaviour', si: 'නැවත නැවත හෝ දිගටම සිදුවන හැසිරීමක් සඳහන් වේ' },
  escalate: { en: 'Contains words linked to immediate danger', si: 'වහාම අනතුරකට අදාළ වචන ඇත' },
  physical: { en: 'Describes physical contact or harm', si: 'ශාරීරික ස්පර්ශයක් හෝ හානියක් සඳහන් වේ' },
  fear: { en: 'Reporter says she feels unsafe', si: 'තමා අනාරක්ෂිත බව පැමිණිලිකාරිය පවසයි' },
  ongoing: { en: 'Reporter says it is still happening', si: 'තවමත් සිදුවන බව පවසයි' },
};

function findAll(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w.toLowerCase()));
}

export function triage(description: string, chosen: Category, ongoing: boolean): Omit<Triage, 'privacyFlags'> {
  const scores = RULES.map((r) => ({ cat: r.cat, hits: findAll(description, r.words) }))
    .filter((r) => r.hits.length)
    .sort((a, b) => b.hits.length - a.hits.length);

  const top = scores[0]?.cat ?? chosen;
  const category: Category = chosen !== 'other' ? chosen : top;
  const secondary = scores.find((s) => s.cat !== category)?.cat;
  const all = Array.from(new Set(scores.flatMap((s) => s.hits)));
  // drop words already covered by a longer match ("threat" inside "threatened")
  const matched = all.filter((w) => !all.some((o) => o !== w && o.toLowerCase().includes(w.toLowerCase())));

  const reasons: Bi[] = [];
  const threat = findAll(description, ['threat', 'contract', 'fire me', 'fail', 'marks', 'තර්ජන', 'කොන්ත්‍රාත්තුව', 'ලකුණු']).length > 0;
  const repeat = findAll(description, REPEAT).length > 0;
  const escalate = findAll(description, ESCALATE).length > 0;
  const physical = category === 'physical' || scores.some((s) => s.cat === 'physical');
  const fear = findAll(description, ['scared', 'afraid', 'unsafe', 'බයයි', 'බය']).length > 0;

  if (escalate) reasons.push(REASON.escalate);
  if (threat) reasons.push(REASON.threat);
  if (physical) reasons.push(REASON.physical);
  if (repeat) reasons.push(REASON.repeat);
  if (fear) reasons.push(REASON.fear);
  if (ongoing) reasons.push(REASON.ongoing);

  let urgency: Urgency = 'standard';
  if (escalate || (physical && ongoing)) urgency = 'immediate';
  else if (threat || physical || (repeat && fear) || (ongoing && repeat)) urgency = 'high';
  else if (!matched.length) urgency = 'low';

  const confidence = Math.min(0.94, 0.48 + matched.length * 0.06 + reasons.length * 0.05);
  return { category, secondary, urgency, confidence, reasons, matched };
}

/** Finds details that could identify the reporter (or name another person). */
export function findPrivacyFlags(text: string): PrivacyFlag[] {
  const flags: PrivacyFlag[] = [];
  const add = (kind: PrivacyFlag['kind'], m: RegExpExecArray, group = 0) => {
    const t = m[group];
    const start = m.index + (group ? m[0].indexOf(t) : 0);
    if (flags.some((f) => start < f.end && start + t.length > f.start)) return;
    flags.push({ id: `${kind}-${start}`, kind, text: t, start, end: start + t.length });
  };
  const run = (re: RegExp, kind: PrivacyFlag['kind'], group = 0) => {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    while ((m = r.exec(text))) add(kind, m, group);
  };
  run(/(?:\+94|0)7\d[\s-]?\d{3}[\s-]?\d{4}/, 'phone');
  run(/[\w.+-]+@[\w-]+\.[\w.]+/, 'email');
  run(/\b(?:\d{9}[VvXx]|\d{12})\b/, 'nic');
  run(/(?:හවස|උදේ|රෑ)\s?\d{1,2}[.:]\d{2}ට?/, 'time');
  run(/\b(?:at\s)?\d{1,2}[.:]\d{2}\s?(?:am|pm)?|\b\d{1,2}\s?(?:am|pm)\b/i, 'time');
  run(/\b(?:on\s)?\d{1,2}(?:st|nd|rd|th)?\s(?:of\s)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i, 'date');
  run(/\b(?:Mr|Mrs|Ms|Miss|Dr|Prof|Sir)\.?\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/, 'person');
  run(/[඀-෿]+\s(?:මහතා|මහත්මිය|මෙනවිය|සර්)/, 'person');
  run(/\b(?:the only (?:woman|female|girl|lady)[^.,]*|only (?:woman|female) in [^.,]+)/i, 'unique_role');
  run(/එකම (?:කාන්තාව|ගැහැනු ළමයා)[^.,]*/, 'unique_role');
  run(/\b(?:[Mm]y name is|I am|I'm)\s(?!a\b|an\b|the\b)[A-Z][a-z]+/, 'own_name');
  return flags.sort((a, b) => a.start - b.start);
}

export const FLAG_COPY: Record<PrivacyFlag['kind'], { title: Bi; why: Bi; replace: Bi; risk: 'you' | 'other' }> = {
  phone: {
    title: { en: 'Phone number', si: 'දුරකථන අංකය' },
    why: { en: 'This could identify you. We never need your number here.', si: 'මෙයින් ඔබව හඳුනාගත හැකියි. මෙහි ඔබේ අංකය අවශ්‍ය නැහැ.' },
    replace: { en: '[phone removed]', si: '[අංකය ඉවත් කළා]' },
    risk: 'you',
  },
  email: {
    title: { en: 'Email address', si: 'ඊමේල් ලිපිනය' },
    why: { en: 'This could identify you.', si: 'මෙයින් ඔබව හඳුනාගත හැකියි.' },
    replace: { en: '[email removed]', si: '[ඊමේල් ඉවත් කළා]' },
    risk: 'you',
  },
  nic: {
    title: { en: 'ID number', si: 'හැඳුනුම්පත් අංකය' },
    why: { en: 'An ID number identifies you directly.', si: 'හැඳුනුම්පත් අංකයෙන් ඔබව කෙලින්ම හඳුනාගත හැකියි.' },
    replace: { en: '[ID removed]', si: '[අංකය ඉවත් කළා]' },
    risk: 'you',
  },
  time: {
    title: { en: 'Exact time', si: 'නිශ්චිත වේලාව' },
    why: { en: 'Exact times can point to who was there. An approximate time is enough.', si: 'නිශ්චිත වේලාවෙන් එවිට සිටියේ කවුදැයි අනුමාන කළ හැකියි. ආසන්න වේලාවක් ප්‍රමාණවත්.' },
    replace: { en: 'in the evening', si: 'සවස් වරුවේ' },
    risk: 'you',
  },
  date: {
    title: { en: 'Exact date', si: 'නිශ්චිත දිනය' },
    why: { en: 'A rough period is safer than an exact date.', si: 'නිශ්චිත දිනයකට වඩා ආසන්න කාලයක් ආරක්ෂිතයි.' },
    replace: { en: 'recently', si: 'මෑතකදී' },
    risk: 'you',
  },
  person: {
    title: { en: 'Names another person', si: 'වෙනත් අයෙකුගේ නමක්' },
    why: {
      en: 'Reviewers may need this. It is never shown to the organisation unless you agree.',
      si: 'සමාලෝචකයින්ට මෙය අවශ්‍ය විය හැකියි. ඔබේ කැමැත්ත නැතිව එය ආයතනයට පෙන්වන්නේ නැහැ.',
    },
    replace: { en: '[the person]', si: '[එම පුද්ගලයා]' },
    risk: 'other',
  },
  unique_role: {
    title: { en: 'Detail only you have', si: 'ඔබට පමණක් අදාළ විස්තරයක්' },
    why: { en: 'If only one person fits this description, it points to you.', si: 'මෙම විස්තරයට ගැළපෙන්නේ එක් අයෙක් නම්, එය ඔබව පෙන්වා දෙයි.' },
    replace: { en: 'a woman in my team', si: 'කාන්තාවක්' },
    risk: 'you',
  },
  own_name: {
    title: { en: 'Your name', si: 'ඔබේ නම' },
    why: { en: "You don't need to give your name to report.", si: 'පැමිණිලි කිරීමට ඔබේ නම අවශ්‍ය නැහැ.' },
    replace: { en: 'I', si: 'මම' },
    risk: 'you',
  },
};

const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rnd = (n: number) => Array.from({ length: n }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join('');
export const newRef = () => `SRK-${rnd(4)}-${rnd(4)}`;
export const newCode = () => `${rnd(3)}-${rnd(3)}-${rnd(3)}`;
export const uid = () => Math.random().toString(36).slice(2, 10);
