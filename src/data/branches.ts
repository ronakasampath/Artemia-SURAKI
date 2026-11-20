import type { Appeal, Branch } from '../lib/types';
import { D } from './time';

export function seedBranches(): Branch[] {
  return [
    { id: 'br-1', orgId: 'org-a', name: 'Head office', city: 'Colombo 03', staff: 120, contact: 'Welfare officer · ext 210' },
    { id: 'br-2', orgId: 'org-a', name: 'Factory 1', city: 'Biyagama', staff: 640, contact: 'Shift welfare officer' },
    { id: 'br-3', orgId: 'org-a', name: 'Factory 2', city: 'Katunayake', staff: 410, contact: 'Shift welfare officer' },
    { id: 'br-4', orgId: 'org-b', name: 'Main campus', city: 'Kandy', staff: 900, contact: 'Student welfare unit' },
  ];
}

export function seedAppeals(now: number): Appeal[] {
  return [
    {
      id: 'ap-1', orgId: 'org-a', kind: 'extension', noticeId: 'n-a0', reason: 'Training provider could only start in the second week.', status: 'decided', at: now - 112 * D,
      decision: { en: 'Granted: 14 extra days', si: 'අනුමතයි: අමතර දින 14ක්' },
    },
  ];
}
