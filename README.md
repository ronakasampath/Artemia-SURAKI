# SURAKI · සුරැකි

Team **atomicIR** · Artemia 2.0 · Women's Safety

A privacy-first reporting and institutional-accountability system, built as a bilingual (සිංහල / English) web prototype. Everything runs in the browser. All people, cases and organisations are fictional.

## Signing in

The app opens on a sign-in page. Choose a demo account, or type its email with the password `demo1234`.

| Account | Email | What it opens |
| --- | --- | --- |
| Demo user | user@suraki.demo | The secret view (a calculator by default). Type **2580** then **=** to open the user dashboard. |
| Demo user · mobile view | user@suraki.demo | The same account on a simulated phone with back / home / recent-apps buttons. The home-screen icon follows the saved secret view. |
| Demo government officer | officer@suraki.demo | Independent Review Desk: case queue, AI suggestions, messages, referrals, notices, publication, audit trail. |
| Demo organisation | hr@company-a.demo | Example Company A: notices, response, corrective actions, branches, appeals, public profile. |
| Demo admin | admin@suraki.demo | Access rules, accounts, organisation registry, security, audit trail. Cannot read reports. |

The public directory (`#/directory`) needs no sign-in. "How to use this system" (`#/guide`) explains every account, how to open each secret view, and has a live checklist for the full journey.

## Secret view (user only)

Only the user can change which everyday app Suraki pretends to be. The page title and icon follow it.

| Secret view | How to open Suraki |
| --- | --- |
| Calculator (default) | Type the PIN, press = |
| Kasi (money diary, like a banking app) | + Add, enter the PIN as the amount, Save |
| Padama (course app, like an LMS) | Search for the PIN, press Enter |
| Katha (social feed) | Post the PIN |

A wrong PIN behaves like the normal app. **Exit** (or Esc twice) wipes the screen and returns to the cover.

## Create, edit, delete (front end only)

| Role | Create | Edit | Delete |
| --- | --- | --- | --- |
| User | New complaint, messages, retaliation report | Complaint details (until a reviewer starts), secret view, PIN, settings | Withdraw a complaint (until the organisation is contacted) |
| Government officer | Log a case received by phone / 109 / walk-in / email, notices, messages, referrals | Triage, verification, status, notices (until answered) | Officer-logged cases, notices (until answered), published records |
| Organisation | Response, corrective actions, branches, appeals | Action status, branches | Actions, branches, withdraw appeals |
| Admin | Accounts, organisations | Accounts (role, two-factor, access), organisations (verify) | Accounts, organisations without reports |

Changes are saved in the browser (localStorage). "Reset demo data" on the guide page restores the original mock data.

## Where things are

```
src/
  data/        mock data, one file per kind (orgs, cases, notices, records, users, branches, audit)
  lib/         store (all actions), routing, translations, rule-based triage
  auth/        sign-in page
  guide/       how-to-use page
  user/        user web dashboard (home, complaints, edit, inbox, secret view)
  mobile/      simulated phone for the mobile view
  reporter/    screens shared by the user dashboard and the phone (report wizard, case, messages, help, settings)
  covers/      the four secret views
  portals/     officer, organisation, admin dashboards and the public directory
```

## Routes

`#/login` · `#/guide` · `#/directory` · `#/user` · `#/mobile` · `#/officer` · `#/org` · `#/admin` · `#/app` (the phone app on its own, for installing on a real phone)

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Offline backup: `SINGLE=1 npm run build` makes `dist-single/index.html`, a single file that opens without internet.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com choose **Add New → Project** and import the repository.
3. Keep the detected settings (Vite, `npm run build`, output `dist`) and press **Deploy**.

Or from a terminal: `npm i -g vercel`, then `vercel --prod`. `vercel.json` is included.

## Notes

- 109 and 1938 are shown as proposed partners and are not connected.
- The AI assistance is a transparent rule-based classifier (`src/lib/triage.ts`) that lists the words behind each suggestion. Officers confirm or change every suggestion.
- In a real deployment, reports would live on a secured server, not in the browser.
