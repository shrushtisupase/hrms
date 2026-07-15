# HRMS Feature Guide & Access Reference

This document provides a detailed breakdown of all implemented features in the HRMS application, describing their core logic and how to access them based on your user role.

---

## 1. Attendance & Clock Exceptions

### Feature Description
- **Check-in / Check-out**: Staff register daily attendance logs using a large fingerprint dial. It logs check-in/out times, hours worked, and geographical coordinates.
- **Late Arrivals Exceptions**: Check-ins logged after **09:30 AM local time** (calculated with a local `+5:30` IST timezone offset) are automatically flagged as **`LATE`**.
- **Early Exit Exceptions**: Check-outs completed with a total shift duration of **less than 8 hours** are flagged as **`EARLY_EXIT`**.
- **Historical Audit Logs**: Provides a historical review of checked-in/out times, hours worked, status flags, and search options.

### How to Access
- **For Employees**:
  1. Go to the **Home** tab in the bottom navigation. Tap the large green **Check In** fingerprint dial to start.
  2. To clock out, tap the fingerprint dial again.
  3. Tap the **Logs** tab in the bottom navigation to view your personal history.
  4. Tap the **Filter by Date** button to toggle the start and end date pickers.
- **For Admins & HR**:
  1. Go to the **Home** tab in the bottom navigation.
  2. Tap the **"View Global Attendance History"** shortcut button under the metrics cards.
  3. You can review all employee check-in logs, search for staff by their email, and filter by start/end dates.

---

## 2. Leaves Ledger & Balances

### Feature Description
- **Dynamic Leave Entitlements**: Tracks annual caps: **Sick Leaves (12 days)**, **Casual Leaves (10 days)**, and **Annual Leaves (15 days)**.
- **Entitlements Balance Check**: Dynamically counts approved leaves to present remaining balances.
- **Leaves Review**: Managers evaluate active applications and record approval remarks.

### How to Access
- **For Employees**:
  1. Go to the **Leaves** tab in the bottom navigation.
  2. The cards grid at the top displays your remaining entitlements: **Casual Leaves**, **Sick Leaves**, and **Annual Leaves** (out of their respective caps).
  3. To request leave, tap the **Plus** button in the header, complete dates/reason, and submit.
- **For Admins & HR**:
  1. Go to the **Leaves** tab in the bottom navigation.
  2. Switch to the **"Review Staff"** sub-view toggle.
  3. Inside each leave application card, the panel displays the applicant's remaining balances (**sick**, **casual**, and **annual**) to help you verify their balance history before approving or rejecting.

---

## 3. Statutory Taxes & Payroll Engine

### Feature Description
- **Gross Payout Components**: Calculates salary breakdowns: **Basic (50%)**, **HRA (30%)**, and **Special Allowance (20%)** matching the employee's base salary rate.
- **Statutory Deductions**: Deducts **PF (12% of basic)**, flat **PT (₹200)**, and **TDS (10% of gross earnings)**.
- **Absences Pro-rating**: Automatically deducts wages for days marked absent during the month.
- **Payslip Generator**: Generates an itemized PDF payslip on demand listing basic salary breakdowns, tax item deductions, and final net payable sums.
- **CSV Bank Export**: Generates a standard direct CSV disbursement file containing employee names, bank account numbers, IFSC codes, and net salaries for corporate banking upload.

### How to Access
- **For Employees (Self-Service Payslips)**:
  1. Go to the **Profile** tab in the bottom navigation.
  2. Scroll down to see the **"My Salary Payslips"** listing card (visible for standard employees only).
  3. Review your monthly net salary and tap **"Download Slip"** to download the itemized PDF payslip.
- **For Admins & HR**:
  1. Go to the **Ops** tab in the bottom navigation.
  2. Scroll to the **"Payroll Engine"** sub-view (active by default).
  3. Select the desired Month and Year, then tap **"Execute Payroll Calculation"** to process the run.
  4. Tap **"Download Bank Disbursement CSV File"** to export the banking spreadsheet.
  5. Scroll down to see calculated payroll lists. Tap **"Payslip"** next to any record to download the individual employee PDF.

---

## 4. Resignation Clearance Pipeline (2-Stage Approval)

### Feature Description
- **Request Submission**: Employees apply for resignation, select their desired Last Working Day (LWD), and state their reasons.
- **Decision Phase**: Managers review pending exit requests and click "Accept Request" (marking them approved/in notice) or "Reject Request" (exit cancelled). Employees remain active to clock in during notice.
- **Clearance checklists**: Once the exit request is approved, IT, Finance, and HR clearance checkmarks are activated. Departments can record remarks and mark clearance nodes as `CLEARED`.
- **Finalization & F&F Settlement**: Once all checkpoints are cleared, the manager finalizes the exit. This deactivates the employee login, computes the final basic salary F&F settlement amount, and registers the completed exit logs.

### How to Access
- **For Employees**:
  1. Go to the **Profile** tab in the bottom navigation.
  2. Scroll down and tap **"Request Resignation & Clearances"** (this button is hidden for admins).
  3. Fill in the requested Last Working Day, explain your reason, and tap **"Submit Resignation Request"**.
  4. Once submitted, you can track the real-time checklist status of your IT, Finance, and HR clearance nodes on this same page.
- **For Admins & HR**:
  1. Go to the **Exits** tab in the bottom navigation.
  2. **Accepting Requests**: Review incoming exits under the **"Resignation Requests Decision Board"** section. Tap **"Accept & Start Clearance"** to approve.
  3. **Checklist Audits**: In the **"Active Clearances Pipeline"** section, tap any record to expand it. Type in asset remarks, and tap **"Mark as Cleared"** for IT, Finance, or HR checkmarks.
  4. **Disbursing Exits**: Once all checkmarks show `CLEARED`, tap **"Complete Clearance & Disburse F&F"** to deactivate the account and log the final settlement.

---

## 5. Workforce Metrics Analytics

### Feature Description
- **Real-Time Counters**: Shows active headcount, checked-in staff today, and staff currently on approved leave.
- **Exception Flags Tracker**: Renders dynamic progress indicators tracking Late check-ins, Early Exits, and Absentees.
- **Clearance Pipeline Tracker**: Tracks active pending exit cases, cleared exits, and settled payouts.
- **Visual Budget Trends**: Displays monthly payroll expense curves using pure responsive CSS progress bars.

### How to Access
- **For Admins & HR only**:
  1. Go to the **Charts** tab in the bottom navigation. The workforce analytics dashboard opens instantly.

---

## 6. Personal Profile & Theme configuration

### Feature Description
- **Bank Details form**: Allows employees to self-manage and update their bank name, account number, and IFSC code for direct payroll deposits.
- **Passcode Reset**: Enables employees to change their secret login password.
- **Theme switch**: High-contrast monochrome Dark Mode / Light Mode toggle.

### How to Access
- **For All Users**:
  1. Go to the **Profile** tab in the bottom navigation.
  2. **Update Profile**: Fill in your address, contact phone, or bank details under the **"Personal Information"** form card. Tap **"Update Information"**.
  3. **Reset Passcode**: Enter your current and new password under **"Change Secret Passcode"** form card. Tap **"Update Secret Passcode"**.
  4. **Toggle Theme**: Tap the **"Monochrome Dark Mode"** switch button to toggle theme.
