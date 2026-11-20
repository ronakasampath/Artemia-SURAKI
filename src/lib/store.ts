import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Appeal, Auth, AuditEntry, Bi, Branch, CaseFile, CaseStatus, Category, ContactPref, CorrectiveAction, DisguiseId, Evidence, Lang, Notice,
  Organization, PlaceType, PublicRecord, Urgency, UserAccount, Verification, WhenKey,
} from './types';
import { freshData, D, AUTHORITY } from '../data';
import { findPrivacyFlags, newCode, newRef, triage, uid } from './triage';

export type Screen =
  | 'home' | 'report' | 'done' | 'track' | 'case' | 'messages' | 'help' | 'settings' | 'directory' | 'org' | 'retaliation'
  | 'complaints' | 'inbox' | 'edit' | 'secret';

export interface Draft {
  step: number;
  category?: Category;
  placeType?: PlaceType;
  orgId?: string;
  orgText: string;
  noOrg: boolean;
  district: string;
  when?: WhenKey;
  ongoing: boolean;
  description: string;
  privacyDone: Record<string, 'replaced' | 'kept'>;
  evidence: Evidence[];
  contact: ContactPref;
  safeTimes: string;
  wantsSupport: boolean;
}

export const emptyDraft = (): Draft => ({
  step: 0, orgText: '', noOrg: false, district: 'Colombo', ongoing: false, description: '', privacyDone: {}, evidence: [],
  contact: 'messages', safeTimes: '', wantsSupport: false,
});

interface Settings {
  lang: Lang;
  textScale: 0 | 1 | 2;
  contrast: boolean;
  reduceMotion: boolean;
  disguise: DisguiseId;
  pin: string;
  remember: boolean;
  demoHints: boolean;
}

interface Session {
  unlocked: boolean;
  screen: Screen;
  history: Screen[];
  orgView?: string;
  draft: Draft;
  activeCase?: { ref: string; code: string };
  lastSubmitted?: { ref: string; code: string };
  exitCount: number;
}

interface Flags {
  directoryViewed: boolean;
  reporterSawOutcome: boolean;
}

interface DB {
  orgs: Organization[];
  cases: CaseFile[];
  notices: Notice[];
  records: PublicRecord[];
  audit: AuditEntry[];
  users: UserAccount[];
  branches: Branch[];
  appeals: Appeal[];
  auth?: Auth;
  saved?: { ref: string; code: string }; // only when "remember on this phone" is on
  flags: Flags;
}

export interface CaseEdit {
  category: Category; placeType: PlaceType; orgId?: string; district: string; when: WhenKey; ongoing: boolean; description: string;
}
export interface LoggedCase extends CaseEdit {
  source: NonNullable<CaseFile['source']>; urgency: Urgency;
}

interface Actions {
  set: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  login: (a: Auth) => void;
  logout: () => void;
  // reporter's own data
  updateMyCase: (caseId: string, patch: CaseEdit) => void;
  withdrawMyCase: (caseId: string) => void;
  // officer
  logCase: (c: LoggedCase) => CaseFile;
  deleteCase: (caseId: string) => void;
  editNotice: (noticeId: string, patch: { title?: Bi; dueAt?: number }) => void;
  withdrawNotice: (noticeId: string) => void;
  removeRecord: (recordId: string) => void;
  // organisation
  updateActions: (noticeId: string, fn: (a: CorrectiveAction[]) => CorrectiveAction[]) => void;
  saveBranch: (b: Omit<Branch, 'id'> & { id?: string }) => void;
  deleteBranch: (id: string) => void;
  addAppeal: (a: Pick<Appeal, 'orgId' | 'kind' | 'noticeId' | 'reason'>) => void;
  withdrawAppeal: (id: string) => void;
  // admin
  saveUser: (u: Omit<UserAccount, 'createdAt'> & { createdAt?: number }, isNew: boolean) => void;
  deleteUser: (id: string) => void;
  saveOrg: (o: Omit<Organization, 'id'> & { id?: string }) => void;
  deleteOrg: (id: string) => void;
  // reporter session
  unlock: () => void;
  quickExit: () => void;
  go: (s: Screen, opts?: { org?: string; replace?: boolean }) => void;
  back: () => void;
  patchDraft: (p: Partial<Draft>) => void;
  resetDraft: () => void;
  submitDraft: () => CaseFile;
  openCase: (ref: string, code: string) => CaseFile | undefined;
  reporterReply: (caseId: string, text: string) => void;
  markReporterRead: (caseId: string) => void;
  reportRetaliation: (caseId: string, text: string) => void;
  // reviewer
  confirmTriage: (caseId: string, category: Category, urgency: Urgency) => void;
  setVerification: (caseId: string, v: Verification) => void;
  setStatus: (caseId: string, s: CaseStatus) => void;
  reviewerMessage: (caseId: string, text: string, clarification: boolean) => void;
  markReviewerRead: (caseId: string) => void;
  refer: (caseId: string, to: '1938' | '109') => void;
  issueNotice: (caseId: string, n: Pick<Notice, 'title' | 'summary' | 'required' | 'dueAt'>) => void;
  recordOutcome: (noticeId: string, text: Bi, v: Verification) => void;
  requestPublication: (noticeId: string) => void;
  decidePublication: (noticeId: string, approve: boolean) => void;
  viewedSensitive: (caseRef: string) => void;
  // organisation
  orgAcknowledge: (noticeId: string) => void;
  orgRespond: (noticeId: string, text: string, actions: CorrectiveAction[], evidence: string[]) => void;
  // demo
  flag: (k: keyof Flags) => void;
  resetDemo: () => void;
}

type State = { settings: Settings; session: Session } & DB & Actions;

const freshDB = (): Omit<DB, 'auth'> => ({
  ...freshData(Date.now()),
  flags: { directoryViewed: false, reporterSawOutcome: false },
});

const freshSession = (): Session => ({ unlocked: false, screen: 'home', history: [], draft: emptyDraft(), exitCount: 0 });

const ev = (step: CaseFile['timeline'][number]['step'], en: string, si: string, reporterVisible = true, detail?: Bi) => ({
  id: uid(), at: Date.now(), step, label: { en, si }, detail, reporterVisible,
});

const audit = (actor: string, role: AuditEntry['role'], en: string, si: string, target: string): AuditEntry => ({
  id: uid(), at: Date.now(), actor, role, action: { en, si }, target,
});

export const STATUS_ORDER: CaseStatus[] = [
  'received', 'in_review', 'awaiting_reporter', 'referred', 'org_notified', 'org_responded', 'outcome_recorded', 'closed',
];

export const useApp = create<State>()(
  persist(
    (setState, get) => {
      const patchCase = (id: string, fn: (c: CaseFile) => CaseFile) =>
        setState((s) => ({ cases: s.cases.map((c) => (c.id === id ? fn(c) : c)) }));
      const patchNotice = (id: string, fn: (n: Notice) => Notice) =>
        setState((s) => ({ notices: s.notices.map((n) => (n.id === id ? fn(n) : n)) }));
      const log = (e: AuditEntry) => setState((s) => ({ audit: [e, ...s.audit] }));

      return {
        settings: { lang: 'si', textScale: 0, contrast: false, reduceMotion: false, disguise: 'calculator', pin: '2580', remember: false, demoHints: true },
        session: freshSession(),
        ...freshDB(),

        set: (k, v) => setState((s) => ({ settings: { ...s.settings, [k]: v } })),

        login: (a) => {
          setState((s) => ({ auth: a, session: { ...freshSession(), exitCount: s.session.exitCount + 1 } }));
          log(audit(a.id, a.role === 'officer' ? 'reviewer' : a.role === 'user' ? 'reporter' : a.role, 'Signed in', 'පිවිසුණා', a.role === 'user' ? '—' : a.id));
        },
        logout: () => setState((s) => ({ auth: undefined, session: { ...freshSession(), exitCount: s.session.exitCount + 1 } })),

        updateMyCase: (caseId, p) => {
          const t = triage(p.description, p.category, p.ongoing);
          patchCase(caseId, (c) => ({
            ...c, ...p, editedAt: Date.now(),
            ai: { ...t, privacyFlags: findPrivacyFlags(p.description), duplicateOf: c.ai.duplicateOf },
            reviewerUnread: c.reviewerUnread + 1,
            timeline: [...c.timeline, ev('note', 'You updated your report', 'ඔබ ඔබේ පැමිණිල්ල යාවත්කාලීන කළා')],
          }));
          const c = get().cases.find((x) => x.id === caseId)!;
          log(audit('reporter', 'reporter', 'Reporter updated their report', 'පැමිණිලිකරු පැමිණිල්ල යාවත්කාලීන කළා', c.ref));
        },
        withdrawMyCase: (caseId) => {
          const c = get().cases.find((x) => x.id === caseId);
          if (!c) return;
          setState((s) => ({
            cases: s.cases.filter((x) => x.id !== caseId),
            session: { ...s.session, activeCase: s.session.activeCase?.ref === c.ref ? undefined : s.session.activeCase },
            saved: s.saved?.ref === c.ref ? undefined : s.saved,
          }));
          log(audit('reporter', 'reporter', 'Reporter withdrew a report (deleted)', 'පැමිණිලිකරු පැමිණිල්ලක් ඉල්ලා අස්කර ගත්තා (මැකුවා)', c.ref));
        },

        logCase: (p) => {
          const now = Date.now();
          const t = triage(p.description, p.category, p.ongoing);
          const c: CaseFile = {
            id: uid(), ref: newRef(), code: newCode(), createdAt: now, source: p.source,
            category: p.category, placeType: p.placeType, orgId: p.orgId, district: p.district, when: p.when, ongoing: p.ongoing,
            description: p.description, lang: get().settings.lang, evidence: [], contact: 'none', wantsSupport: false,
            ai: { ...t, privacyFlags: findPrivacyFlags(p.description) },
            human: { category: p.category, urgency: p.urgency, by: get().auth?.id ?? 'R-07', at: now, overridden: p.urgency !== t.urgency },
            verification: 'not_assessed', status: 'in_review', messages: [],
            timeline: [ev('received', 'Case logged by an officer', 'නිලධාරියෙකු ගොනුව ඇතුළත් කළා'), ev('in_review', 'Assessment started', 'තක්සේරුව ආරම්භ විය')],
            referrals: [], assignedTo: get().auth?.id ?? 'R-07', reporterUnread: 0, reviewerUnread: 0,
          };
          setState((s) => ({ cases: [c, ...s.cases] }));
          log(audit(get().auth?.id ?? 'R-07', 'reviewer', 'Logged a case received outside the app', 'යෙදුමෙන් පිටත ලැබුණු ගොනුවක් ඇතුළත් කළා', c.ref));
          return c;
        },
        deleteCase: (caseId) => {
          const c = get().cases.find((x) => x.id === caseId);
          if (!c) return;
          setState((s) => ({ cases: s.cases.filter((x) => x.id !== caseId), notices: s.notices.filter((n) => n.caseId !== caseId) }));
          log(audit(get().auth?.id ?? 'R-07', 'reviewer', 'Deleted a logged case (duplicate or error)', 'ඇතුළත් කළ ගොනුවක් මැකුවා (අනුපිටපත හෝ දෝෂය)', c.ref));
        },
        editNotice: (id, p) => {
          patchNotice(id, (n) => ({ ...n, ...p }));
          log(audit(get().auth?.id ?? 'O-03', 'officer', 'Edited a notice before acknowledgement', 'පිළිගැනීමට පෙර නිවේදනය සංස්කරණය කළා', id));
        },
        withdrawNotice: (id) => {
          const n = get().notices.find((x) => x.id === id);
          if (!n) return;
          setState((s) => ({ notices: s.notices.filter((x) => x.id !== id) }));
          patchCase(n.caseId, (c) => ({
            ...c, noticeId: undefined, status: 'in_review',
            timeline: [...c.timeline, ev('note', 'Notice to the organisation was withdrawn', 'ආයතනයට යැවූ නිවේදනය ඉවත් කර ගත්තා', false)],
          }));
          log(audit(get().auth?.id ?? 'O-03', 'officer', 'Withdrew a notice', 'නිවේදනයක් ඉවත් කර ගත්තා', id));
        },
        removeRecord: (id) => {
          setState((s) => ({ records: s.records.filter((r) => r.id !== id) }));
          log(audit('P-02', 'publication', 'Removed a record from the public directory', 'පොදු නාමාවලියෙන් වාර්තාවක් ඉවත් කළා', id));
        },

        updateActions: (noticeId, fn) => {
          patchNotice(noticeId, (n) => (n.response ? { ...n, response: { ...n.response, actions: fn(n.response.actions) } } : n));
          log(audit(get().auth?.name ?? 'Organisation', 'org', 'Updated corrective actions', 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග යාවත්කාලීන කළා', noticeId));
        },
        saveBranch: (b) => {
          const isNew = !b.id;
          const id = b.id ?? 'br-' + uid();
          setState((s) => ({ branches: isNew ? [...s.branches, { ...b, id }] : s.branches.map((x) => (x.id === id ? { ...x, ...b, id } : x)) }));
          log(audit(get().auth?.name ?? 'Organisation', 'org', isNew ? 'Added a branch' : 'Edited a branch', isNew ? 'ශාඛාවක් එකතු කළා' : 'ශාඛාවක් සංස්කරණය කළා', b.name));
        },
        deleteBranch: (id) => {
          const b = get().branches.find((x) => x.id === id);
          setState((s) => ({ branches: s.branches.filter((x) => x.id !== id) }));
          log(audit(get().auth?.name ?? 'Organisation', 'org', 'Deleted a branch', 'ශාඛාවක් මැකුවා', b?.name ?? id));
        },
        addAppeal: (a) => {
          setState((s) => ({ appeals: [{ ...a, id: 'ap-' + uid(), status: 'open', at: Date.now() }, ...s.appeals] }));
          log(audit(get().auth?.name ?? 'Organisation', 'org', 'Submitted an appeal or request', 'අභියාචනයක් හෝ ඉල්ලීමක් ඉදිරිපත් කළා', a.noticeId ?? a.orgId));
        },
        withdrawAppeal: (id) => {
          setState((s) => ({ appeals: s.appeals.map((x) => (x.id === id ? { ...x, status: 'withdrawn' } : x)) }));
          log(audit(get().auth?.name ?? 'Organisation', 'org', 'Withdrew an appeal', 'අභියාචනයක් ඉල්ලා අස්කර ගත්තා', id));
        },

        saveUser: (u, isNew) => {
          setState((s) => ({
            users: isNew ? [{ ...u, createdAt: Date.now() }, ...s.users] : s.users.map((x) => (x.id === u.id ? { ...x, ...u } : x)),
          }));
          log(audit('A-01', 'admin', isNew ? 'Created an account' : 'Updated an account', isNew ? 'ගිණුමක් සෑදුවා' : 'ගිණුමක් යාවත්කාලීන කළා', u.id));
        },
        deleteUser: (id) => {
          setState((s) => ({ users: s.users.filter((x) => x.id !== id) }));
          log(audit('A-01', 'admin', 'Deleted an account', 'ගිණුමක් මැකුවා', id));
        },
        saveOrg: (o) => {
          const isNew = !o.id;
          const id = o.id ?? 'org-' + uid();
          setState((s) => ({ orgs: isNew ? [...s.orgs, { ...o, id }] : s.orgs.map((x) => (x.id === id ? { ...x, ...o, id } : x)) }));
          log(audit('A-01', 'admin', isNew ? 'Registered an organisation' : 'Updated an organisation', isNew ? 'ආයතනයක් ලියාපදිංචි කළා' : 'ආයතනයක් යාවත්කාලීන කළා', o.name.en));
        },
        deleteOrg: (id) => {
          const o = get().orgs.find((x) => x.id === id);
          setState((s) => ({ orgs: s.orgs.filter((x) => x.id !== id), branches: s.branches.filter((b) => b.orgId !== id) }));
          log(audit('A-01', 'admin', 'Removed an organisation', 'ආයතනයක් ඉවත් කළා', o?.name.en ?? id));
        },

        // keeps the screen chosen before unlocking (deep links from the guide); a fresh session starts on home
        unlock: () => setState((s) => ({ session: { ...s.session, unlocked: true } })),
        quickExit: () =>
          setState((s) => ({
            session: { ...freshSession(), exitCount: s.session.exitCount + 1, lastSubmitted: undefined },
          })),
        go: (screen, opts) =>
          setState((s) => ({
            session: {
              ...s.session,
              screen,
              orgView: opts?.org ?? s.session.orgView,
              history: opts?.replace ? s.session.history : [...s.session.history, s.session.screen].slice(-12),
            },
          })),
        back: () =>
          setState((s) => {
            const h = [...s.session.history];
            const prev = h.pop() ?? 'home';
            return { session: { ...s.session, screen: prev, history: h } };
          }),
        patchDraft: (p) => setState((s) => ({ session: { ...s.session, draft: { ...s.session.draft, ...p } } })),
        resetDraft: () => setState((s) => ({ session: { ...s.session, draft: emptyDraft() } })),

        submitDraft: () => {
          const d = get().session.draft;
          const lang = get().settings.lang;
          const t = triage(d.description, d.category ?? 'other', d.ongoing);
          const now = Date.now();
          const sameOrg = d.orgId ? get().cases.find((c) => c.orgId === d.orgId && now - c.createdAt < 30 * D) : undefined;
          const c: CaseFile = {
            id: uid(), ref: newRef(), code: newCode(), createdAt: now, source: 'app',
            category: d.category ?? 'other', placeType: d.placeType ?? 'other', orgId: d.noOrg ? undefined : d.orgId,
            orgText: d.noOrg ? undefined : d.orgText || undefined, district: d.district, when: d.when ?? 'week', ongoing: d.ongoing,
            description: d.description, lang, evidence: d.evidence, contact: d.contact, wantsSupport: d.wantsSupport,
            ai: { ...t, privacyFlags: findPrivacyFlags(d.description), duplicateOf: sameOrg?.ref },
            verification: 'not_assessed', status: 'received',
            messages: [
              {
                id: uid(), from: 'system', at: now,
                text: {
                  en: 'Thank you for telling us. An independent reviewer will read your report within 2 working days. Questions will appear here.',
                  si: 'අපට කීවාට ස්තූතියි. වැඩ කරන දින 2ක් ඇතුළත ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවයි. ප්‍රශ්න තිබේ නම් මෙහි පෙන්වයි.',
                },
              },
            ],
            timeline: [ev('received', 'Report received', 'පැමිණිල්ල ලැබුණි'), ev('triaged', 'AI suggestion prepared for reviewer', 'සමාලෝචකයාට AI යෝජනාව සූදානම් විය', false)],
            referrals: [], assignedTo: 'R-07', mine: true, fresh: true, reporterUnread: 1, reviewerUnread: 0,
          };
          setState((s) => ({
            cases: [c, ...s.cases],
            session: {
              ...s.session, draft: emptyDraft(), lastSubmitted: { ref: c.ref, code: c.code }, activeCase: { ref: c.ref, code: c.code },
            },
            saved: s.settings.remember ? { ref: c.ref, code: c.code } : s.saved,
          }));
          log(audit('reporter', 'reporter', 'New confidential report received', 'නව රහසිගත පැමිණිල්ලක් ලැබුණි', c.ref));
          log(audit('system', 'system', 'AI triage suggestion created', 'AI වර්ගීකරණ යෝජනාව සෑදුණා', c.ref));
          return c;
        },

        openCase: (ref, code) => {
          const c = get().cases.find((x) => x.ref.toUpperCase() === ref.trim().toUpperCase());
          if (!c) return undefined;
          if (c.mine && c.code.toUpperCase() !== code.trim().toUpperCase()) return undefined;
          setState((s) => ({ session: { ...s.session, activeCase: { ref: c.ref, code: c.code } } }));
          return c;
        },

        reporterReply: (caseId, text) => {
          patchCase(caseId, (c) => ({
            ...c,
            messages: [...c.messages, { id: uid(), from: 'reporter', text, at: Date.now() }],
            reviewerUnread: c.reviewerUnread + 1,
            status: c.status === 'awaiting_reporter' ? 'in_review' : c.status,
          }));
        },
        markReporterRead: (caseId) => patchCase(caseId, (c) => ({ ...c, reporterUnread: 0 })),
        reportRetaliation: (caseId, text) => {
          patchCase(caseId, (c) => ({
            ...c, retaliation: true, reviewerUnread: c.reviewerUnread + 1,
            messages: [...c.messages, { id: uid(), from: 'reporter', text: `⚠ ${text}`, at: Date.now() }],
            timeline: [...c.timeline, ev('note', 'You reported retaliation. This is reviewed first.', 'ඔබ පළිගැනීමක් වාර්තා කළා. මෙය මුලින්ම සලකා බලයි.')],
          }));
          log(audit('reporter', 'reporter', 'Retaliation concern raised', 'පළිගැනීම පිළිබඳ ගැටලුවක් මතු කළා', caseId));
        },

        confirmTriage: (caseId, category, urgency) => {
          const c = get().cases.find((x) => x.id === caseId)!;
          const overridden = category !== c.ai.category || urgency !== c.ai.urgency;
          patchCase(caseId, (x) => ({
            ...x,
            human: { category, urgency, by: 'R-07', at: Date.now(), overridden },
            status: x.status === 'received' ? 'in_review' : x.status,
            timeline:
              x.status === 'received'
                ? [...x.timeline, ev('in_review', 'An independent reviewer started reading your report', 'ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවීම ඇරඹුවා')]
                : x.timeline,
          }));
          log(audit('R-07', 'reviewer', overridden ? 'Overrode AI suggestion' : 'Confirmed AI suggestion', overridden ? 'AI යෝජනාව වෙනස් කළා' : 'AI යෝජනාව තහවුරු කළා', c.ref));
        },
        setVerification: (caseId, v) => {
          patchCase(caseId, (c) => ({ ...c, verification: v }));
          const c = get().cases.find((x) => x.id === caseId)!;
          log(audit('R-07', 'reviewer', 'Updated verification status', 'තහවුරු කිරීමේ තත්ත්වය යාවත්කාලීන කළා', c.ref));
        },
        setStatus: (caseId, st) => {
          patchCase(caseId, (c) => ({ ...c, status: st }));
          const c = get().cases.find((x) => x.id === caseId)!;
          log(audit('R-07', 'reviewer', 'Changed case status', 'ගොනුවේ තත්ත්වය වෙනස් කළා', c.ref));
        },
        reviewerMessage: (caseId, text, clarification) => {
          patchCase(caseId, (c) => ({
            ...c,
            messages: [...c.messages, { id: uid(), from: 'reviewer', text, at: Date.now() }],
            reporterUnread: c.reporterUnread + 1,
            status: clarification ? 'awaiting_reporter' : c.status,
            timeline: clarification
              ? [...c.timeline, ev('awaiting_reporter', 'The reviewer asked you a question', 'සමාලෝචකයා ඔබෙන් ප්‍රශ්නයක් ඇසුවා')]
              : c.timeline,
          }));
          const c = get().cases.find((x) => x.id === caseId)!;
          log(audit('R-07', 'reviewer', clarification ? 'Requested clarification' : 'Sent secure message', clarification ? 'පැහැදිලි කිරීමක් ඉල්ලුවා' : 'ආරක්ෂිත පණිවිඩයක් යැව්වා', c.ref));
        },
        markReviewerRead: (caseId) => patchCase(caseId, (c) => ({ ...c, reviewerUnread: 0 })),
        refer: (caseId, to) => {
          patchCase(caseId, (c) => ({
            ...c,
            referrals: [...c.referrals, { to, at: Date.now() }],
            status: STATUS_ORDER.indexOf(c.status) < STATUS_ORDER.indexOf('referred') ? 'referred' : c.status,
            timeline: [
              ...c.timeline,
              to === '1938'
                ? ev('referred', 'Support arranged with the 1938 women’s helpline', '1938 කාන්තා සහාය සේවය සමඟ සහාය සැලසුවා')
                : ev('referred', 'Referred to the police women & children bureau (109)', 'පොලිස් ළමා හා කාන්තා කාර්යාංශයට (109) යොමු කළා'),
            ],
            reporterUnread: c.reporterUnread + 1,
            messages: [
              ...c.messages,
              {
                id: uid(), from: 'system', at: Date.now(),
                text: to === '1938'
                  ? { en: 'A counsellor from the 1938 helpline can support you. They will only contact you the way you chose.', si: '1938 සහාය සේවයේ උපදේශකයෙකුට ඔබට සහාය විය හැකියි. ඔවුන් ඔබ හා සම්බන්ධ වන්නේ ඔබ තෝරාගත් ආකාරයට පමණයි.' }
                  : { en: 'Your report was shared with the police bureau (109) because of a safety risk. Only the details needed were shared.', si: 'ආරක්ෂක අවදානමක් නිසා ඔබේ පැමිණිල්ල පොලිස් කාර්යාංශය (109) සමඟ බෙදා ගත්තා. අවශ්‍ය විස්තර පමණක් බෙදා ගත්තා.' },
              },
            ],
          }));
          const c = get().cases.find((x) => x.id === caseId)!;
          log(audit('R-07', 'reviewer', `Referred to ${to} (simulated)`, `${to} වෙත යොමු කළා (අනුකරණය)`, c.ref));
        },
        issueNotice: (caseId, n) => {
          const c = get().cases.find((x) => x.id === caseId)!;
          if (!c.orgId) return;
          const id = 'n-' + uid();
          const notice: Notice = {
            id, caseId, orgId: c.orgId, issuedAt: Date.now(), status: 'sent', publication: 'none',
            authority: AUTHORITY,
            ...n,
          };
          setState((s) => ({ notices: [notice, ...s.notices] }));
          patchCase(caseId, (x) => ({
            ...x, noticeId: id, status: 'org_notified', reporterUnread: x.reporterUnread + 1,
            timeline: [...x.timeline, ev('org_notified', 'The organisation was asked to act. Your identity was not shared.', 'ක්‍රියා කරන ලෙස ආයතනයට දැනුම් දුන්නා. ඔබේ අනන්‍යතාව බෙදා ගත්තේ නැහැ.')],
          }));
          log(audit('O-03', 'officer', 'Issued organisation notice after privacy check', 'පෞද්ගලිකත්ව පරීක්ෂාවෙන් පසු ආයතනයට නිවේදනය නිකුත් කළා', c.ref));
        },
        recordOutcome: (noticeId, text, v) => {
          patchNotice(noticeId, (n) => ({ ...n, status: 'verified', outcome: { text, at: Date.now() } }));
          const n = get().notices.find((x) => x.id === noticeId)!;
          patchCase(n.caseId, (c) => ({
            ...c, status: 'outcome_recorded', verification: v, reporterUnread: c.reporterUnread + 1,
            timeline: [...c.timeline, ev('outcome_recorded', 'The reviewer checked the organisation’s changes', 'ආයතනය කළ වෙනස්කම් සමාලෝචකයා පරීක්ෂා කළා', true, text)],
          }));
          log(audit('O-03', 'officer', 'Recorded verified outcome', 'තහවුරු කළ ප්‍රතිඵලය සටහන් කළා', noticeId));
        },
        requestPublication: (noticeId) => {
          patchNotice(noticeId, (n) => ({ ...n, publication: 'pending' }));
          log(audit('O-03', 'officer', 'Sent record for separate publication approval', 'වෙනම ප්‍රකාශන අනුමැතිය සඳහා යැව්වා', noticeId));
        },
        decidePublication: (noticeId, approve) => {
          const n = get().notices.find((x) => x.id === noticeId)!;
          patchNotice(noticeId, (x) => ({ ...x, publication: approve ? 'approved' : 'declined' }));
          if (approve) {
            const now = Date.now();
            const recs: PublicRecord[] = [
              {
                id: 'pr-' + uid(), orgId: n.orgId, kind: 'notice', at: n.issuedAt, authority: n.authority, source: `ISP/2026/${String(now).slice(-3)} (demo)`,
                title: { en: `Notice: ${n.title.en}`, si: `නිවේදනය: ${n.title.si}` }, body: n.summary,
                status: { en: 'Corrective action required', si: 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග අවශ්‍යයි' }, fromNotice: n.id,
              },
              ...(n.response?.actions ?? []).map((a) => ({
                id: 'pr-' + uid(), orgId: n.orgId, kind: 'corrective' as const, at: now, authority: n.authority, source: `ISP/2026/${String(now).slice(-3)}-V (demo)`,
                title: typeof a.title === 'string' ? { en: a.title, si: a.title } : a.title,
                body: n.outcome?.text ?? { en: 'Verified by the reviewing authority.', si: 'සමාලෝචන අධිකාරිය විසින් තහවුරු කළා.' },
                status: a.status === 'verified' || a.status === 'done'
                  ? { en: 'Verified complete', si: 'සම්පූර්ණ බව තහවුරුයි' }
                  : { en: 'In progress, follow-up scheduled', si: 'ක්‍රියාත්මක වෙමින්, නැවත පරීක්ෂා කෙරේ' },
                fromNotice: n.id,
              })),
            ];
            setState((s) => ({ records: [...recs, ...s.records] }));
            patchCase(n.caseId, (c) => ({
              ...c, status: 'closed', reporterUnread: c.reporterUnread + 1,
              timeline: [
                ...c.timeline,
                ev('note', 'An official record was published. It does not mention you.', 'නිල වාර්තාවක් ප්‍රකාශයට පත් කළා. එහි ඔබ ගැන සඳහනක් නැහැ.'),
                ev('closed', 'Case closed. You can still send messages for 90 days.', 'පැමිණිල්ල අවසන් කළා. තවත් දින 90ක් පණිවිඩ යැවිය හැකියි.'),
              ],
            }));
          }
          log(audit('P-02', 'publication', approve ? 'Approved record for public directory' : 'Declined publication', approve ? 'පොදු නාමාවලියට අනුමත කළා' : 'ප්‍රකාශනය ප්‍රතික්ෂේප කළා', noticeId));
        },
        viewedSensitive: (ref) => log(audit('R-07', 'reviewer', 'Revealed identifying details (reason recorded)', 'හඳුනාගැනීමේ විස්තර පෙන්වූවා (හේතුව සටහන් විය)', ref)),

        orgAcknowledge: (noticeId) => {
          patchNotice(noticeId, (n) => ({ ...n, status: n.status === 'sent' ? 'acknowledged' : n.status, acknowledgedAt: Date.now() }));
          log(audit(get().auth?.name ?? 'Organisation', 'org', 'Acknowledged notice', 'නිවේදනය ලැබුණු බව පිළිගත්තා', noticeId));
        },
        orgRespond: (noticeId, text, actions, evidence) => {
          patchNotice(noticeId, (n) => ({ ...n, status: 'responded', response: { text, actions, evidence, at: Date.now() } }));
          const n = get().notices.find((x) => x.id === noticeId)!;
          patchCase(n.caseId, (c) => ({
            ...c, status: 'org_responded', reporterUnread: c.reporterUnread + 1,
            timeline: [...c.timeline, ev('org_responded', 'The organisation replied with a plan to fix the problem', 'ගැටලුව විසඳීමට සැලැස්මක් සමඟ ආයතනය පිළිතුරු දුන්නා')],
          }));
          log(audit(get().auth?.name ?? 'Organisation', 'org', 'Submitted response and corrective-action plan', 'පිළිතුර හා නිවැරදි කිරීමේ සැලැස්ම ඉදිරිපත් කළා', noticeId));
        },

        flag: (k) => setState((s) => ({ flags: { ...s.flags, [k]: true } })),
        resetDemo: () => setState((s) => ({ ...freshDB(), saved: undefined, session: { ...freshSession(), exitCount: s.session.exitCount + 1 }, settings: { ...s.settings, pin: '2580', disguise: 'calculator' } })),
      };
    },
    {
      name: 'suraki-demo-v2',
      storage: createJSONStorage(() => {
        try {
          const k = '__t';
          localStorage.setItem(k, k);
          localStorage.removeItem(k);
          return localStorage;
        } catch {
          const mem: Record<string, string> = {};
          return { getItem: (k) => mem[k] ?? null, setItem: (k, v) => void (mem[k] = v), removeItem: (k) => void delete mem[k] };
        }
      }),
      // The reporter session (unlock state, drafts, open case) is never written to storage.
      partialize: (s) => ({
        settings: s.settings, auth: s.auth, orgs: s.orgs, cases: s.cases, notices: s.notices, records: s.records, audit: s.audit,
        users: s.users, branches: s.branches, appeals: s.appeals, saved: s.saved, flags: s.flags,
      }),
    },
  ),
);

/** Looks an organisation up in the live (editable) list. */
export const orgById = (id?: string) => useApp.getState().orgs.find((o) => o.id === id);
