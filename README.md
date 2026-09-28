# Dayflow - Human Resource Management System (HRMS)
> *Every workday, perfectly aligned.*

Dayflow is a modern, enterprise-grade Human Resource Management System (HRMS) built with React 18, Vite, and custom CSS design system tokens. It features role-based access control (Admin/HR Officer vs Employee), attendance tracking with live punch in/out, leave request workflows with instant feedback, confidential payroll breakdowns with printable payslips, and interactive HR business intelligence analytics.

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Role Portals**: Dedicated workspaces for **Admin / HR Officer** and **Employees**.
- **Sign In / Sign Up**: Email verification modal with OTP simulation, security rules, and pre-configured 1-click demo buttons.
- **Instant Persona Switcher**: Seamlessly switch between HR Admin (`Eleanor Vance`) and Employees (`Alex Rivera`, `Marcus Chen`, `Sophia Rodriguez`, `Devon Knight`).

### 2. Dashboards
- **Employee Portal**: Live digital clock, interactive Punch In / Out (Office & Remote), leave balance overview, take-home salary snapshot, and company announcements.
- **Admin Command Center**: Executive KPIs (Total Headcount, On Duty Today, Pending Approvals, Monthly Payroll Cost), real-time check-in stream, and quick approval queue.

### 3. Employee Profile Management
- **View Profile**: 4 distinct views — *Personal Details*, *Job & Organization*, *Salary Structure*, and *Documents & Certifications*.
- **Role-Gated Permissions**:
  - **Employee**: Can update contact details (phone, residential address, avatar, emergency contact).
  - **Admin**: Full edit privileges for organization hierarchy, role, department, designation, salary, and status.

### 4. Attendance Management
- **Live Clock In/Out**: Automatically calculates shift duration and logs status (`Present`, `Half-day`, `Leave`, `Absent`).
- **Personal View**: Daily and weekly summary logs.
- **Company-Wide Monitor**: Filter by date, department, and status with manual attendance regularization.

### 5. Leave & Time-Off Management
- **Employee**: Apply for leave (Paid, Sick, Casual, Unpaid) with auto-calculated duration, date range validation, and balance checks.
- **Admin Approval Desk**: 1-click approve/reject or custom feedback comments that immediately sync with attendance logs and leave balances.

### 6. Payroll & Salary Management
- **Employee View**: Read-only breakdown of base pay, HRA, special allowances, PF, and income tax deductions.
- **Printable Payslip Generator**: Generate and print formatted corporate salary slips (PDF-ready).
- **Admin Control**: Company-wide payroll master to adjust compensation components per employee.

### 7. Analytics & Reports
- Department headcount distribution, monthly attendance trends, and leave type utilization.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm` or `yarn`

### Installation & Local Run
```bash
# 1. Clone the repository
git clone <your-github-repo-url>
cd dayflow

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin / HR Officer** | Eleanor Vance | `admin@dayflow.com` | `password123` |
| **Senior Full Stack Engineer** | Alex Rivera | `alex@dayflow.com` | `password123` |
| **Lead Product Designer** | Marcus Chen | `marcus@dayflow.com` | `password123` |
| **Product Marketing Manager** | Sophia Rodriguez | `sophia@dayflow.com` | `password123` |
| **DevOps & Cloud Architect** | Devon Knight | `devon@dayflow.com` | `password123` |

*(You can also click any avatar in the top demo bar for instant 1-click login!)*

---

## 🛠️ Tech Stack
- **Framework**: React 18
- **Bundler**: Vite
- **Icons**: Lucide React
- **Styling**: Custom CSS Design Tokens, Glassmorphism, Dark/Light theme toggle
- **Persistence**: Centralized state with LocalStorage sync
