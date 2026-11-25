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
