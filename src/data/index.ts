/** All mock data in one place. Each module can be edited on its own. */
import { seedCases } from './cases';
import { seedNotices } from './notices';
import { seedRecords } from './records';
import { seedAudit } from './audit';
import { seedUsers } from './users';
import { seedAppeals, seedBranches } from './branches';
import { ORGS } from './orgs';

export { D, H } from './time';
export { ORGS } from './orgs';
export { DEMO_ACCOUNTS } from './users';
export { AUTHORITY } from './notices';

export function freshData(now = Date.now()) {
  return {
    orgs: ORGS.map((o) => ({ ...o })),
    cases: seedCases(now),
    notices: seedNotices(now),
    records: seedRecords(now),
    audit: seedAudit(now),
    users: seedUsers(now),
    branches: seedBranches(),
    appeals: seedAppeals(now),
  };
}
