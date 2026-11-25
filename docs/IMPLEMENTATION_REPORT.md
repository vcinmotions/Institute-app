# Enhancement Implementation Report (phase 1)

Source: "new changes for work.docx" (25-11-2026). Work is done in phases; this file is
updated as each phase completes. Nothing is marked done unless it was implemented
and checked as described in the "Verified how" column.

## Status

| # | Section | Status | Verified how |
|---|---------|--------|--------------|
| 1 | Date / time pickers | Done (code) | tsc passes; **not yet clicked through in the running app** |
| 8 | Master dropdown auto-refresh | Done (code) | tsc passes; not yet exercised in the running app |
| 9 | Direct admission | Done (code) | tsc passes; not yet exercised in the running app |
| 10 | Batch without lab / class types | Done | Migration run on a scratch SQLite DB with existing data; null-lab batches inserted and read back |
| 11 | Lab time slots | Done (code) | Validator unit-checked (5 cases pass); list refresh relies on item 8 |
| 12 | Source Config review | Done (explanation below) | Code read only, nothing changed |
| 2-7, 13-15, 17 | Server config, branding, idle logout, subscription security, roles, standalone mode, activation, backup, etc. | **Not started** | - |

## Changes in this phase

**Database** (`server/prisma/institute/schema.prisma`, `schema.sqlite.prisma`, new migration
`20261125000000_batch_optional_lab`)
- `Batch.labTimeSlotId` is now optional.
- New `Batch.classType` (default `REGULAR`; values `REGULAR`, `IELTS`, `LAB`, or any custom text).
- Existing batches keep their lab and become `LAB`. The unique key `(labTimeSlotId, clientAdminId)` is kept,
  so one lab slot still has one batch, while any number of lab-less batches are allowed.

**Backend**
- `batch.controller.ts`: lab optional, `classType` accepted, duplicate-slot check only when a lab is chosen.
- `course.controller.ts`: PC allocation only when the batch has a lab slot (type fix for the nullable column).
- `utils/timeSlots.ts` (new) + `lab.controller.ts`: lab create/update reject bad `HH:MM`, end <= start,
  and overlapping slots on the same lab (a `Daily` slot overlaps every day).
- `admission.controller.ts`: duplicate protection. An enquiry that is already admitted is rejected (409).
  Any admission (direct or from an enquiry) is rejected when a student with the same contact or email exists.

**Frontend**
- `BatchCreateForm.tsx`: Class Type selector (Regular / IELTS / Lab-based / Other), lab optional
  (required only for Lab-based). Other screens that built labels from `batch.labTimeSlot.*` would have crashed
  on a lab-less batch; they now use `lib/batchLabel.ts`.
- `createAdmission.tsx` + admission list: `?id=` is now optional. The "+ Direct Admission" button opens the
  same form with no enquiry. Inquiry-based admission is unchanged.
- `LabCreateForm.tsx`: client-side slot validation (required, end after start, overlap).
- `ReactQueryProvider.tsx`: every successful create/update/delete mutation now invalidates all queries, so new
  or changed master records appear in every list and dropdown without a restart or reload.
- `globals.css` / `InputField.tsx`: the native calendar/clock icon had been hidden globally; it now shows inside
  every date, time and datetime-local field, and clicking the field opens the picker. This gives the Date of
  Birth fields their calendar icon.
- New `components/form/input/DateField.tsx`: replaces free-text `DD-MM-YYYY` boxes (enquiry DOB and enquiry
  date, faculty joining date, payment date, opening-balance admission date) with a real date picker. State and
  API still use `DD-MM-YYYY`, so the backend is unchanged.

## Section 12: Source Config explained

- **What it is:** a master list of lead sources (e.g. Walk-in, Instagram, Google, Referral). Table `SourceType`
  (`name`, unique `slug`). Menu: Master > Source Config. Routes: `POST /create-source`, `GET /source`,
  `GET /source/all`. Create is admin-only (`roleGuard`).
- **Where it is used:**
  - Enquiry form: the Source dropdown lists these records.
  - `enquiry.service.ts`: on create/edit the chosen slug is looked up and saved as `Enquiry.sourceId`.
    An unknown slug fails with "Provided Source Type not found".
  - Reports: the report filter by source (`report.service.ts`) and the "Source Channel" column.
- **Example:** an institute adds "Instagram" and "Walk-in". A receptionist enters an enquiry and picks
  "Instagram". Later the owner filters the enquiry report by source = Instagram to see how many leads came
  from there and how many were converted, so marketing spend can be judged.
- **Verdict:** actively used (enquiries and reports). Left untouched. Gaps worth a decision: there is no
  edit or delete for sources, and one old code path in `enquiry.controller.ts` writes a free-text `source`
  field that does not exist on the model.

## Pending / limitations
- Sections 2-7, 13-15 and 17 are not implemented yet. The existing code already has a signed-license
  subscription service, a view-only guard on expiry (`subscriptionGuard`), a single-instance lock and a
  Standalone/LAN mode screen, so those sections need hardening and an audit report, not new systems.
- No automated UI tests exist in the repo; items marked "not yet exercised" need a manual run.
- Native date pickers show the date in the operating-system locale. The stored/sent value is consistent,
  but the on-screen order (DD/MM vs MM/DD) follows Windows regional settings.

---

# Phase 2: licensing, activation, idle logout, single instance

## Status

| # | Section | Status | Verified how |
|---|---------|--------|--------------|
| 5 | Subscription security | Done (code) | 27-check script on a scratch DB, all pass (see below) |
| 6 | System date/time protection | Done (code) | Back 5 days, forward 400 days, forward-then-back, delete local files: all tested |
| 13 | Global mode flag (Enabled / Standalone 364 days) | Done (code) | Signed build config: valid accepted, tampered/missing rejected, `.env` key swap ignored |
| 14 | Activation key + device tracking | Done (code) | Key issue, PC limit, transfer limit, deactivate, re-verify all tested; UI compiles but **not clicked through** |
| 4 | Idle logout | Did not exist; added | Compiles; **not exercised in the running app** |
| 15 | Two EXE instances | Lock already existed; added a message | Syntax checked only; needs a manual double-launch |
| 2 | First-run server configuration | Already implemented (`mode-setup.html` shows when no saved config) | Code read only |
| 3, 7, 17 (backup, roles, audit, health, updates, branding) | **Not started** | - |

## Audit findings (what the old code did)
- A signed licence and clock guard existed, but **enforcement and the public key came from `server/.env`**: deleting
  `SUBSCRIPTION_API_URL` switched checks off, and swapping `SUBSCRIPTION_PUBLIC_KEY` let anyone sign their own licence.
  The local "last seen" MAC used `JWT_SECRET` from the same `.env`.
- Idle logout did not exist. The 60 s heartbeat only keeps the login seat; tokens last 30 days.
- Single-instance lock existed but a second launch quit silently.

## What changed
- **Embedded public key** (`server/src/config/licensePublicKey.ts`). Packaged builds ignore the env key.
- **Signed build config** (`server/build-config.json` beside `dist`, created by `scripts/sign-build-config.js`).
  Mode `ENABLED` or `STANDALONE`, API/portal URL. Commands: `npm run build:enabled`, `npm run build:standalone`
  (run the server build first so `server/dist` exists, then these). Needs the private key on the build PC only
  (`SUBSCRIPTION_PRIVATE_KEY`, `server/.env.portal`, or `--key-file`). Missing/modified file = app locked.
- **Local MAC key** is now bound to the PC (hash of the Windows MachineGuid), not `.env`.
- **Activation** (`activation.service.ts`, `activation.controller.ts`, routes `/device-activation/*` on the EXE,
  `/activation/*`, `/saas/activation-*`, `/portal/activation*` on the portal). The portal signs a licence naming the
  institute, company and PC. Edited files, or a licence copied to another PC, are rejected.
  `activationGate` blocks every API call, including login, until the PC is activated.
- **Standalone expiry** comes from the signed licence: later of first activation + 364 days and the institute's paid
  expiry. Renewing or extending online (payment, SaaS admin) restores Add/Update/Delete at the next check. Suspending
  the institute makes it view-only. Deleting local files and re-activating returns the same date (tested).
- **Database changes (central):** `ActivationKey`, `ActivationDevice` in both central schemas. The apps apply schema
  with `prisma db push`, so no migration is needed. A migration file was added for reference only.
- **UI:** `ActivationGate` (activation screen), `/saas/keys` (SaaS admin: generate key, limits, devices,
  deactivate/reactivate), `PortalDevices` in the institute portal (Companies tab), `IdleLogout`.
- **Idle logout:** default 30 min (`localStorage idleTimeoutMinutes`, 0 = off), 60 s warning with "Stay signed in",
  and sign-out after Windows sleep/lock if the timeout passed while away.

## Tests run (scratch DB, throwaway keys; 27 checks, all passed)
Key format; invalid key rejected; activation; 364-day validity; institute and company shown; second PC blocked at
limit; edited expiry rejected; licence for another PC rejected; clock back 5 days flagged; after 364 days view-only;
a forward jump then back is flagged until re-verified online; delete local data + re-activate keeps the same expiry;
online renewal restores access; suspension makes view-only; super admin deactivation locks the PC at its next
check; the PC cannot re-activate itself; transfer limit enforced; portal lists key, limit, active PCs, devices.

## Limitations and decisions needed
- **No fully offline defence against an admin who controls the PC.** A PC kept offline and frozen at one date is not
  detectable (as the document notes); it is caught at the next online check.
- **LAN clients:** activation is per machine running the backend (the server PC). Client PCs that only open the
  server's app are not counted as separate activations. If each client PC must hold an activation, that needs an
  Electron-side check and a decision on how many keys a LAN site buys.
- **Existing installs** will ask for an activation key on first launch after upgrade. Create keys for current
  customers before shipping.
- The hosted portal is detected by `SUBSCRIPTION_PRIVATE_KEY`; never ship `.env.portal` inside the EXE.
- `server/.env` still contains the old `SUBSCRIPTION_*` values; they are ignored in packaged builds.
- Idle timeout has no settings screen yet.
