export type Lang = 'en' | 'si';
export type Bi = { en: string; si: string };
export type Text = string | Bi;

export type Category = 'harassment' | 'intimidation' | 'discrimination' | 'physical' | 'unsafe' | 'other';
export type Urgency = 'immediate' | 'high' | 'standard' | 'low';
export type Verification = 'not_assessed' | 'consistent' | 'corroborated' | 'not_established';
export type CaseStatus =
  | 'received'
  | 'in_review'
  | 'awaiting_reporter'
  | 'referred'
  | 'org_notified'
  | 'org_responded'
  | 'outcome_recorded'
  | 'closed';
export type PlaceType = 'workplace' | 'university' | 'transport' | 'hotel' | 'public' | 'online' | 'other';
export type WhenKey = 'today' | 'week' | 'month' | 'earlier';
export type ContactPref = 'messages' | 'counsellor' | 'none';
export type DisguiseId = 'calculator' | 'money' | 'study' | 'social';

export type FlagKind = 'phone' | 'email' | 'nic' | 'time' | 'date' | 'person' | 'unique_role' | 'own_name';
export interface PrivacyFlag {
  id: string;
  kind: FlagKind;
  text: string; // exact matched text
  start: number;
  end: number;
}

export interface Triage {
  category: Category;
  secondary?: Category;
  urgency: Urgency;
  confidence: number; // 0..1
  reasons: Bi[];
  matched: string[];
  privacyFlags: PrivacyFlag[];
  duplicateOf?: string;
}

export interface Message {
  id: string;
  from: 'reporter' | 'reviewer' | 'system';
  text: Text;
  at: number;
}

export interface TimelineEvent {
  id: string;
  at: number;
  step: CaseStatus | 'triaged' | 'note';
  label: Bi;
  detail?: Bi;
  reporterVisible: boolean;
}

export interface Evidence {
  id: string;
  name: string;
  kind: 'image' | 'audio' | 'doc';
  size: string;
}

export interface CaseFile {
  id: string;
  ref: string; // SRK-XXXX-XXXX
  code: string; // access code shown to reporter
  createdAt: number;
  category: Category;
  placeType: PlaceType;
  orgId?: string;
  orgText?: string;
  district: string;
  when: WhenKey;
  ongoing: boolean;
  description: string;
  lang: Lang;
  evidence: Evidence[];
  contact: ContactPref;
  wantsSupport: boolean;
  ai: Triage;
  human?: { category: Category; urgency: Urgency; by: string; at: number; overridden: boolean };
  verification: Verification;
  status: CaseStatus;
  messages: Message[];
  timeline: TimelineEvent[];
  referrals: { to: '1938' | '109'; at: number }[];
  noticeId?: string;
  assignedTo: string;
  mine?: boolean; // belongs to the signed-in demo user
  source?: 'app' | 'phone_1938' | 'police_109' | 'walk_in' | 'email';
  editedAt?: number;
  fresh?: boolean; // submitted during this demo session (used by the guide checklist)
  reporterUnread: number;
  reviewerUnread: number;
  retaliation?: boolean;
}

export interface Organization {
  id: string;
  name: Bi;
  type: PlaceType;
  district: Bi;
  sector: Bi;
  verified: boolean;
}

export interface CorrectiveAction {
  id: string;
  title: Text;
  due: number;
  status: 'planned' | 'in_progress' | 'done' | 'verified';
}

export interface Notice {
  id: string;
  caseId: string;
  orgId: string;
  issuedAt: number;
  authority: Bi;
  title: Bi;
  summary: Bi;
  required: Bi[];
  dueAt: number;
  status: 'sent' | 'acknowledged' | 'responded' | 'verified' | 'appealed';
  acknowledgedAt?: number;
  response?: { text: string; actions: CorrectiveAction[]; evidence: string[]; at: number };
  outcome?: { text: Bi; at: number };
  publication?: 'none' | 'pending' | 'approved' | 'declined';
}

export interface PublicRecord {
  id: string;
  orgId: string;
  kind: 'notice' | 'corrective' | 'appeal' | 'update';
  title: Bi;
  body: Bi;
  authority: Bi;
  at: number;
  status: Bi;
  source: string;
  fromNotice?: string;
}

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  role: 'reporter' | 'reviewer' | 'officer' | 'org' | 'admin' | 'publication' | 'system';
  action: Bi;
  target: string;
}

export type StaffRole = 'officer' | 'authorised' | 'publication' | 'oversight' | 'org' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  orgId?: string;
  active: boolean;
  mfa: boolean;
  createdAt: number;
}

export interface Branch {
  id: string;
  orgId: string;
  name: string;
  city: string;
  staff: number;
  contact: string;
}

export interface Appeal {
  id: string;
  orgId: string;
  kind: 'extension' | 'correction' | 'appeal';
  noticeId?: string;
  reason: string;
  status: 'open' | 'decided' | 'withdrawn';
  decision?: Bi;
  at: number;
}

export type AuthRole = 'user' | 'officer' | 'org' | 'admin';
export interface Auth {
  role: AuthRole;
  id: string;
  name: string;
  orgId?: string;
}
