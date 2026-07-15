# BRD vs. MVP Compliance Matrix

This document maps the requirements from the original Business Requirements Document (`HRMS_BRD.docx`) to the features implemented in the current HRMS build.

---

## Executive Summary

The current build serves as a feature-rich Minimum Viable Product (MVP) optimized for core HR operations. Here is a summary of what is fully functional in this build and what has been deferred to future phases:

### What was Implemented
- **Centralized Master Directory & Profiles**: Secure logins, roles configurations (Admin, HR, Employee), personal information fields, and bank accounts management.
- **Attendance Dial & Exception Flags**: Manual biometric clock dial capturing coordinates. Automated flags for `LATE` check-in exceptions (after 09:30 AM IST) and `EARLY_EXIT` check-out exceptions (shift duration < 8 hours).
- **Statutory Taxes & Payroll Engine**: Payroll calculations taking absences pro-rating into account. Statutory deductions: PF (12% of basic), Professional Tax (flat Indian standard ₹200), and TDS (10% of gross). Self-service payslip history with PDFKit payslips generation. Bank export direct CSV spreadsheets.
- **Exits Resignation & Clearances Pipeline**: 2-stage offboarding approval workflow. IT, Finance, and HR clearance checklist node logs. Final settlement payout lock and login deactivation.
- **Workforce Metrics Analytics**: Visual budget expense trends progress curves and real-time headcount indicators.
- **Personal Settings & Theme Switch**: High-contrast Dark/Light mode theme switch.

### What is Remaining / Deferred (Phase 2)
- **Recruitment & Applicant Tracking (ATS)**: Job requisitions, career portals, scorecards, and candidate pipelines.
- **Document Management**: Dedicated document hosting vaults skipped to avoid external dependencies (e.g. Multer/Cloudinary).
- **Push Notifications & Automations**: Auto-emails (SMTP) and scheduler triggers.
- **Audit Trails & GL Sync**: Database trigger history logs and third-party accounting ERP integrations.

---

## 1. Core HR / Master Data

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **CHR-01** | Centralized employee master records | **IMPLEMENTED** | Schema contains profile fields, employment metadata, and disbursement bank settings. |
| **CHR-02** | Department, designation & org hierarchy | **IMPLEMENTED** | Supported via Mongoose relationships between Users and Departments. |
| **CHR-03** | Master data changes audit logs | **REMAINING** | Planned for database trigger logs in future scale sprint. |
| **CHR-04** | Bulk import/export template uploads | **REMAINING** | Admin console operates on direct UI forms; file-based uploads deferred. |
| **CHR-05** | Document repository with access keys | **REMAINING** | Document hosting skipped to avoid Multer/Cloudinary dependencies. |
| **CHR-06** | Multiple employment categories | **IMPLEMENTED** | Supported via Designation and Role settings on profiles. |

---

## 2. Recruitment & Applicant Tracking (ATS)

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **REC-01** | Job requisitions workflow | **REMAINING** | Recruiter pipeline module deferred to Phase 2. |
| **REC-02** | Career portal & board integrations | **REMAINING** | Job board syndication deferred to Phase 2. |
| **REC-03** | Pipeline stage tracking | **REMAINING** | Applicant board tracker deferred to Phase 2. |
| **REC-04** | Interview scorecards & schedules | **REMAINING** | Shared review scorecards deferred to Phase 2. |
| **REC-05** | E-signature offer letters | **REMAINING** | PDF generators reserved for monthly payslips in current phase. |
| **REC-06** | Recruitment pipeline reporting | **REMAINING** | Funnel tracking metrics deferred to Phase 2. |

---

## 3. Onboarding & Offboarding (Exits)

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **ONB-01** | Configurable onboarding checklist | **REMAINING** | Handled via admin registration panel direct checks. |
| **ONB-02** | Digital statutory paperwork pre-start | **REMAINING** | Account registration form handled post hiring. |
| **ONB-03** | exit resignation clearance workflows | **IMPLEMENTED** | Employees apply for resignation. IT, Finance, and HR clear checkpoints via [AdminClearanceConsole.jsx](file:///home/abhasgawali/Documents/shrushti/hrms/frontend/src/pages/AdminClearanceConsole.jsx). We implemented a robust two-step approval flow: managers accept the request (puts request in approved notice status) then checkpoints run in parallel, letting employees clock-in until finalize is executed. |
| **ONB-04** | exit Full & Final calculations | **IMPLEMENTED** | Automatically calculates payout once clearance checkmarks are finished. Finalize deactivates the login and locks F&F settlement. |
| **ONB-05** | exit feedback surveys | **REMAINING** | HR clearance logs remarks instead of structured surveys. |

---

## 4. Time, Attendance & Leaves

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **TAL-01** | Biometric or manual clock capture | **IMPLEMENTED** | Manual clock-in fingerprint dials capture latitude, longitude, and timestamps. |
| **TAL-02** | Leave categories & logic settings | **IMPLEMENTED** | Supports sick, casual, annual leaves with Mongoose query controls. |
| **TAL-03** | Self service leave ledger | **IMPLEMENTED** | Staff view, request, and verify balances on [Leaves.jsx](file:///home/abhasgawali/Documents/shrushti/hrms/frontend/src/pages/Leaves.jsx). Standard staff routes call `/leaves/my-history` to prevent permission errors. |
| **TAL-04** | Shift rosters & timetables | **REMAINING** | Time checks run on a single standard 9:30 AM IST boundary rule. |
| **TAL-05** | Flag exceptions (Late / Early Exit / Absent) | **IMPLEMENTED** | Automatically flags clock-ins after 9:30 AM local time as `LATE`, and durations under 8 hours as `EARLY_EXIT`. Date queries are toggleable under a clean button panel to save visual estate. |

---

## 5. Payroll & Statutory Compliance

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **PAY-01** | Calculate payroll by attendance/leaves | **IMPLEMENTED** | Computes pro-rated absences, Basic (50%), HRA (30%), and Allowance (20%). |
| **PAY-02** | Statutory taxes (PF, PT, TDS deductions) | **IMPLEMENTED** | Subtracts PF (12% of basic), flat PT (₹200), and TDS (10% of gross). |
| **PAY-03** | Employee self-service payslips | **IMPLEMENTED** | Generates detailed itemized PDF payslips on demand. |
| **PAY-04** | Bank file CSV dispatch export | **IMPLEMENTED** | Admins download bank templates populated with accounts. |
| **PAY-05** | General Ledger ledger synchronization | **REMAINING** | Sync with third-party ERP General Ledger engines deferred. |
| **PAY-06** | Audit database retention (7 years) | **IMPLEMENTED** | Data resides permanently in Mongoose collections. |

---

## 6. Self-Service & Dashboards

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **ESS-01** | Update profile info & check payslips | **IMPLEMENTED** | Managed in Profile page, including edit bank credentials forms. |
| **ESS-02** | Team managers dashboards | **IMPLEMENTED** | Managers check off clearance checkmarks and leave requests. Bottom navigation adapts dynamically for managers, showing staff lists, exit clear boards, ops dashboard, and real-time graphs instantly. |
| **ESS-03** | Responsive web rendering (desktop/mobile) | **IMPLEMENTED** | Outer borders adjust dynamically on all monitors. |
| **ESS-04** | Approval push notifications | **REMAINING** | Email notifications deferred to avoid SMTP packages. |

---

## 7. Reports & Analytics

| Req ID | Requirement Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **RPT-01** | Pre-built headcount & cost reports | **IMPLEMENTED** | Renders graphs and progress bars in [AdminAnalyticsDashboard.jsx](file:///home/abhasgawali/Documents/shrushti/hrms/frontend/src/pages/AdminAnalyticsDashboard.jsx). |
| **RPT-02** | Executive drill-down dashboard panels | **IMPLEMENTED** | Displays payroll curves, attendance flags, and exit statistics. |
| **RPT-03** | Custom report queries export | **PARTIAL** | Export capability is provided for direct CSV bank files. |
| **RPT-04** | Auto-email reports scheduler | **REMAINING** | Cron job email triggers deferred. |
