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

---

# Phase 3: Role & module-based access (section 7)

| Item | Status | Verified how |
|------|--------|--------------|
| Role Management (create / rename / delete roles) | Done | Real controllers against a SQLite DB: 11 checks pass |
| Role Access (View / Add / Update / Delete per module) | Done | Same run; add/update/delete imply view; unknown modules ignored |
| Backend enforcement | Done | 22 guard checks pass (14 custom-role, 7 built-in, 1 helper) |
| Existing roles not broken | Done | ADMIN, FRONT_DESK, ACCOUNTANT, VIEW_ONLY behave as before in the guard test |
| UI hiding | Partly done | Sidebar, "Create Record" buttons and "Create ..." menu links hide. **Edit/delete icons inside data tables are not hidden yet** (the server still refuses them) |
| Not clicked through in the running app | - | UI compiles only |

## Design
- **Built-in roles are untouched.** A user gets a custom role through a new `customRoleId`; the user is stored with the base role
  `VIEW_ONLY` as a safe default, and the permission engine replaces the old rule list for that user.
- **One table decides everything** (`permissions.service.ts`): path -> module, HTTP method -> action
  (GET view, POST add, PUT/PATCH update, DELETE delete; a few POSTs such as hold/lost/attendance mark count as update).
  Modules: enquiry, admission/students, payments, course, faculty, batch, lab, source, stationary, attendance, tasks, tests,
  expenses, reports, users, settings.
- **Read from the database on every request** (5 s cache), so changing a user's role or a role's permissions applies at once, no re-login.
- **Always off for custom roles:** audit log, role management, tenant list. Non-module GETs (dashboard, analytics) stay readable.
- **Database (tenant):** `AccessRole`, `AccessRolePermission`, `RoleUser.customRoleId` (applied with `db push`). Existing data is preserved
  (checked on a database that already held batches).
- **API:** `GET/POST /access-roles`, `PUT/DELETE /access-roles/:id`, `PUT /access-roles/:id/permissions` (ADMIN only), `GET /my-permissions` (any user).
- **UI:** sidebar "Role Access" page (roles list + permission grid), custom roles appear in the user create/edit forms,
  and `Can` / `usePermissions` hide actions the role does not have.
- Role and permission changes are written to the activity log.

## Limits
- A user with a custom role is single-role across companies (the per-company role picker still applies to built-in roles).
- Deleting a role that still has users is refused; move the users first.

---

# Phase 4: backup, branding, health, audit, updates, validation (final)

## Final status of all 17 sections

| # | Section | Status | Verified how |
|---|---------|--------|--------------|
| 1 | Date / time pickers | Done | tsc; native picker + icon in every date/time field |
| 2 | First-run server configuration | Already existed (`mode-setup.html`) | Code read |
| 3 | Institute branding (Super Admin only) | Done | 12 checks on real DBs |
| 4 | Idle logout | Done (now a server-wide setting) | tsc; not exercised in the app |
| 5 | Subscription security | Done | 27 checks |
| 6 | System clock protection | Done | in the 27 checks |
| 7 | Roles & module permissions | Done, edit/hide buttons now hidden too | 22 + 11 checks |
| 8 | Master dropdown refresh | Done | tsc only |
| 9 | Direct admission | Done | tsc only |
| 10 | Batch without lab | Done | migration + DB test |
| 11 | Lab time slots | Done | 5 validator checks |
| 12 | Source Config | Reviewed, unchanged | explanation above |
| 13 | Global mode flag | Done | build-config checks |
| 14 | Activation key + devices | Done (server PC) | 27 checks |
| 15 | Two instances | Lock already existed; message added | syntax only |
| 17 | Extra requirements | See below | see below |
| 16 | Full testing | **Partly**: see "Test results" and "Not tested" | |

## Section 17 items
| Item | Status |
|------|--------|
| Institute / company hierarchy and isolation | Existing design kept. Found and fixed 3 attendance endpoints that read a batch by id with no company check. Other services already filter by company. A full line-by-line audit of every controller was **not** done. |
| Signed offline licence | Done (phase 2) |
| Device management in portal | Done: SaaS admin page `/saas/keys`, institute Super Admin list + deactivate with transfer limit |
| Automatic backup and restore | Done: schedule (every 12 h / daily / weekly), folder outside app data, optional external copy, retention, log, "last successful backup", failure banner, restore from the list, safety backup before restore. **Closed a hole:** the old `POST /restore` had no login and accepted any file path; it was removed (restore runs only from the desktop app) |
| Multi-PC LAN stability | Connection indicator, automatic reconnect, warning when a save may not have completed, duplicate-submit guard (identical POST in flight is cancelled). Client PCs already have no database of their own. |
| Application updates | Super Admin page: check, download, backup, install, version history, rollback request. Auto-download and silent install are off. Checksums verified by electron-updater. |
| Audit logs | Every successful add/edit/delete is recorded automatically with user, role, module, record id, time and IP; sign-in, sign-out and failed sign-in too. Shown in the Activity page with search by user. |
| Read-only mode after expiry | Already enforced by `subscriptionGuard` (view, reports, export allowed; add/edit/delete blocked; renewal online). Unchanged. |
| System health dashboard | Done: server, databases, versions, subscription, licence check, device, backup, internet, online/offline |
| Validation and duplicates | Server-side mobile (10 digits), email, date checks on enquiry and admission; duplicate student by contact/email; enquiry cannot be admitted twice; overlapping lab slots refused |

## Files changed in this phase (main ones)
Server: `services/backup.service.ts`, `controllers/system.backup.controller.ts`, `routes/system.backup.routes.ts`,
`controllers/system.health.controller.ts`, `controllers/branding.controller.ts`, `controllers/session.settings.controller.ts`,
`middlewares/auditTrail.middleware.ts`, `utils/auditContext.ts`, `utils/activityLogger.ts`, `validators/common.ts`,
`controllers/auth.controller.ts`, `controllers/attendance.controller.ts`, `controllers/log.controller.ts`,
`controllers/admission.controller.ts`, `services/enquiry.service.ts`, `app.ts`, tenant schema (both files).
Desktop: `installer/electron-main.js`, `installer/preload.js`.
Frontend: master pages `health`, `branding`, `updates`; `UserBackupCard`, `SessionSettingsCard`, `ConnectionStatus`, `BackupAlert`,
`PermissionStyles`, `IdleLogout`, `useBranding`, `apiClient`, `AppSidebar`, `AppHeader`, `SignInForm`, table components (`data-perm` markers).

## Database changes (all applied by `prisma db push`, existing data preserved)
- Tenant: `Batch.labTimeSlotId` optional, `Batch.classType`; `AccessRole`, `AccessRolePermission`, `RoleUser.customRoleId`;
  `ActivityLog.actorId/actorName/actorRole/module/ip`.
- Central: `ActivationKey`, `ActivationDevice`.
- New local files in the user-data folder: `activation.json`, `backup-config.json`, `backup-log.json`, `session-settings.json`, `update-history.json`, `uploads/branding/`.

## Test results (automated, scratch databases, throwaway keys)
| Area | Checks | Result |
|------|--------|--------|
| Activation, licence, clock, standalone 364 days, renewal, devices | 27 | all pass |
| Signed build config (valid, tampered, missing, env key swap) | 3 | all pass |
| Permission guard (custom + built-in roles) | 22 | all pass |
| Role controllers on a real DB | 11 | all pass |
| Backup (encrypted, restore round trip, retention, external copy, schedule, failure/clear) | 24 | all pass |
| Branding (access, validation, duplicate name, logo replace/remove, public read) | 12 | all pass |
| Audit trail (who/what/module/record, no duplicates, no GET/failed) | 4 | all pass |
| Field validators | 10 | all pass |
| Lab slot validator | 5 | all pass |
| Batch migration with existing data | manual | pass |
| TypeScript: server and frontend | - | clean |

## Not tested (needs a person and real PCs)
- No screen was opened in a browser or the desktop app. Nothing was run as an installed EXE and no EXE was built.
- Two PCs on a LAN, the connection indicator going red/green, two EXE instances, Windows sleep/lock sign-out.
- Real online portal (Razorpay payment -> renewal), real GitHub update download and rollback.
- The device id lookup was only run through Git Bash (it fell back to hostname + MAC); on Windows from Electron it uses the registry MachineGuid.
- Load / simultaneous writes from many PCs.

## Pending issues and decisions
1. **LAN client PCs are not separate activations** (only the server PC). Decide whether each client needs its own key.
2. **Existing customers need activation keys** before upgrading.
3. `package.json` scripts: run the server build first, then `npm run build:enabled` or `npm run build:standalone` (needs the private key on the build PC).
4. The native date picker shows the date in the Windows regional format; saved values are consistent.
5. Rollback relies on the old release being published on GitHub as `vX.Y.Z` with its `latest.yml`; the pre-update backup is the data safety net.
6. A technically skilled administrator who controls the PC, the executable and the database cannot be fully stopped offline (as the document notes).
7. Idle timeout, backup settings, branding and updates are in the **Master** (Super Admin) area; the institute `ADMIN` role does not see them.
8. Remaining audit work: a full line-by-line review of company isolation across all controllers.

---

# Phase 5: one server per company, Server/Client keys, local mode

## Business model implemented
- Buying creates an **institute**; it has several **companies** (branches). One server PC = one company = its own database.
- Every company has exactly **two keys**, created automatically on the portal: a **Server key** (1 PC) and a **Client key** (unlimited PCs / laptops).
- **First server install:** sign in -> choose the company -> the portal registers this PC on that company's Server key and returns both keys. The server stores them in its local database, so nobody types the Server key.
- **Client PCs / laptops:** type the company's Client key once. It is checked **on the server, offline**, against a hash inside the server's portal-signed licence (so it cannot be edited in the local DB). Each client gets a private token; clients are listed and can be blocked (lost laptop). The server PC itself is exempt.
- One PC can be the server of only one company; a company has one server (replace it by deactivating the old one on the portal).

## Local mode (SUBSCRIPTION_MODE is anything but ENABLED)
- **No Server key, no Client key, no portal calls, no client check.** Clients just connect.
- The app is valid for `LOCAL_LICENSE_MONTHS` (default **6**) from its first start, then view-only. Start date is kept in two places with a PC-bound seal; clock rollback is detected. Renewal = a portal-signed code (one use, one PC) pasted in System Settings; the SaaS admin makes it at `/saas/keys`.
- In a packaged build the mode and the months are read at BUILD time (`server/.env.prod`) and signed into `build-config.json`, so editing `.env` after install changes nothing. (`npm run build:standalone` for local mode, `npm run build:enabled` for keys.)

## Tests (scratch DBs, throwaway keys)
| Area | Checks | Result |
|------|--------|--------|
| Keyed mode: company keys, claim, one server per company, client key offline, unlimited clients, gate, revoke, deactivate, auto keys | 37 | all pass |
| Local mode: months (6 and 12), no keys anywhere, two-copy protection, clock, renewal codes | 21 | all pass |
| Setup wizard, client key screen, setup UI, System Settings cards | - | compile only, **not run in the app** |

## Fixed: login page flicker
The login page reloaded itself in a loop. My new login branding call hit a backend that did not have that route yet and got a 401; the app's global 401 handler logs out and reloads `/signin`, which repeated. Fixed: public calls use a client without the 401 logout, a 401 with no signed-in session never logs out, and the logout never reloads the sign-in page. Restart the backend so it has the new routes.

## Environment files
- Loaded by code: `server/.env.dev` or `server/.env.prod` (by `APP_ENV`), then `server/.env`, then `server/.env.portal` (portal only). **`.env.production` is not read by anything** (unused leftover).
- New variables: `SUBSCRIPTION_MODE` (ENABLED or anything else), `LOCAL_LICENSE_MONTHS`.

---

# Class module (for institutes without a computer lab)

- **What it is:** the same screens and rules as Lab, for institutes that have classrooms instead of PC labs. A class has a name, a room/location, a **seat capacity** and time slots. Saving it creates **one batch per time slot automatically**, exactly like a lab. Students admitted to those batches take a seat the same way lab students take a PC; a full class is refused with "the batch is full".
- **How:** classes are stored in the lab tables with a new `Lab.kind` (`LAB` default, or `CLASS`), so batches, admission, faculty and attendance all work unchanged. Lab and Class lists are separate; classes never appear in the lab list or in the Batch form's lab picker. A class cannot be edited through the lab screen or the other way round.
- **Where:** sidebar "Class" (Class List / Create Class), routes `/dashboard/class`, `/dashboard/class/create`; API `/all-class`, `/create-class`, `/edit-class/:id`; its own permission module "Class & Time Slots" in Role Access (built-in roles follow the Lab rules: ADMIN creates/edits, others read).
- **Database change:** `Lab.kind` (both schemas). PostgreSQL dev databases need `npm run db:push:dev -- --apply`, then restart the backend; the installed app adds it on its own.
- **Tested:** 22 checks on a real database (create class, batch per slot, lab unaffected, separate lists, validation, cross-kind edit refused, add-slot creates a batch, permissions). Screens compile but were not clicked through.
