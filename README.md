# Human Resource Management System (HRMS) - Operations & Offboarding Edition

This is a modern, responsive, and light-weight HRMS platform built to streamline attendance tracking, leave ledgers, statutory payroll calculations, and exit offboarding clearance pipelines.

---

## Technical Stack

- **Frontend**: React (Vite, Tailwind CSS, Lucide icons, Zustand state store, Axios).
- **Backend**: Node.js (Express, MongoDB/Mongoose, JSON Web Token auth, PDFKit generation, Zod validators).
- **Styling**: Monochrome grayscale architecture with high-contrast pastel action accents. Fits seamlessly on mobile and desktop viewports.

---

## Directory Structure

```
├── backend/            # Express REST API service
│   ├── src/
│   │   ├── controllers/# Route controller logic (attendance, leave, exits, payroll)
│   │   ├── models/     # Mongoose database schemas
│   │   ├── routes/     # Express routers
│   │   └── app.js      # Server entry point
│   └── package.json
└── frontend/           # Vite + React Client service
    ├── src/
    │   ├── components/ # Shared layouts (Mobile Frame, Bottom Navigation)
    │   ├── pages/      # Views (Home, Attendance, Leaves, Exits, Analytics, Profiles)
    │   └── store/      # Zustand authentication/theme state
    └── package.json
```

---

## Environment Configuration

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms    # your MongoDB instance URI
JWT_SECRET=super_secret_auth_token_key        # secret salt to sign JWTs
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173         # comma-separated client URLs (or *.vercel.app)
```

### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api        # backend service API prefix
```

---

## Installation & Running

### Prerequisites

Make sure you have Node.js (v18+) and MongoDB installed and running locally.

### 1. Boot Backend Service

```bash
cd backend
npm install
npm run dev
```

The server will run on `http://localhost:5000`.

### 2. Boot Frontend Client

```bash
cd ../frontend
npm install
npm run dev
```

The Vite dev server will boot on `http://localhost:5173`. Open this URL in your web browser.

---

## Seed Data & Test Accounts

A database seeder script is provided to populate MongoDB with a mock company workforce. To seed the database, run:

```bash
cd backend
node seed.js
```

### Pre-configured Login Accounts

All pre-configured accounts share the common password: **`password123123123`**.

| Name | Email | Role | Department | Default Mock Data |
| :--- | :--- | :--- | :--- | :--- |
| **Vikrant Mehta** | `admin@hrms.com` | `ADMIN` | Managing Director | Full access to payroll engine, exits clearance, and metrics. |
| **Sneha Reddy** | `hr@hrms.com` | `hr@hrms.com` (Role: `HR`) | Human Resources | Access to onboarding, staff list reviews, and clearance controls. |
| **Rahul Sharma** | `emp1@hrms.com` | `EMPLOYEE` | Engineering | 5-day check-in logs (1 LATE exception), 1 approved sick leave. |
| **Priya Patel** | `emp2@hrms.com` | `EMPLOYEE` | Engineering | 5-day check-in logs (1 EARLY_EXIT exception), 1 rejected leave. |
| **Amit Verma** | `emp3@hrms.com` | `EMPLOYEE` | Sales & Marketing | 5-day check-in logs, 1 approved annual leave. |
| **Vikram Malhotra** | `emp4@hrms.com` | `EMPLOYEE` | Finance | Active **PENDING resignation request** (ready for clearance review). |

---

## Features Reference

For a comprehensive description of all modules (Clock exceptions, Payroll deductions, Exit clearances, Analytics) and how to access them, see the [FEATURES.md](FEATURES.md) file in the root directory.
