# Employee Salary & Payslip Management System (Web Application)

A professional, enterprise-grade Employee Salary and Payslip Management Web Application built with modern HTML5, CSS3, and JavaScript with offline persistence and built-in local development server.

---

## 🚀 How to Run the Website

### Option 1: 1-Click Localhost Launcher (Recommended)
Double-click [`run_localhost.bat`](run_localhost.bat) or [`start_web.bat`](start_web.bat).
- Automatically starts the local HTTP server on port 8080.
- Automatically opens **http://localhost:8080/** in your default web browser.

### Option 2: Command Line (Python)
```bash
python web_server.py 8080
```
Then open: **[http://localhost:8080/](http://localhost:8080/)**

### Option 3: Direct Browser Launch
Double-click [`index.html`](index.html) to open directly in any browser (Chrome, Edge, Firefox, Brave).

---

## 🔑 Login Credentials

| Field | Value |
| :--- | :--- |
| **Username** | `admin` |
| **Password** | `admin123` |

---

## 🌟 Key Features

1. **Enterprise Dashboard**:
   - Live KPI cards: Total Employees (10), Active Employees (9), Total Salary Disbursed (₹8,41,440), Payslips Generated (10).
   - Real-time digital clock and Administrator status badge.
   - Quick navigation to common payroll actions.

2. **Employee Directory (Full CRUD)**:
   - **Add Employee**: 14 validated fields with auto-increment ID generation (`EMP011`).
   - **Edit & View Profile**: Modal inspection and updates.
   - **Delete Record**: Deletion with confirmation.
   - **Live Search & Filter**: Instant search across Name, Email, Role, Department, and Status.

3. **Payroll & Salary Computation**:
   - Real-time payroll formulas:
     - **HRA**: 40% of Basic Pay
     - **DA**: 20% of Basic Pay
     - **PF**: 12% of Basic Pay
     - **Professional Tax (PT)**: ₹200 standard deduction
   - Instant computation of Gross Salary, Total Deductions, and Net Pay.
   - Bilingual Indian currency number-to-words converter (e.g. *"Rupees Seventy Three Thousand Eight Hundred Only"*).

4. **Official Payslip Document & PDF Export**:
   - Authentic corporate salary slip format with company header, employee details, and two-column earnings/deductions breakdown.
   - **Print / Save as PDF**: Optimized print styles (`@media print`) for clean printing and PDF generation.
   - **Save as Text**: Download formatted text payslip.

5. **Payroll Reports & CSV Export**:
   - Department-wise salary allocation report.
   - Monthly payroll distribution breakdown.
   - 1-Click CSV export of the master payroll register.

6. **DBMS & Schema Visualizer**:
   - Visual schema view showing the relational structures of `employees`, `salary`, `payslips`, and `admin` tables matching MySQL specifications.

---

## 📁 File Structure

```
employee-salary-management-system/
├── index.html            # Main Single Page Application interface
├── css/
│   └── style.css         # Modern enterprise stylesheet (Navy / Royal Blue theme)
├── js/
│   ├── app.js            # Routing, controllers, modals & event listeners
│   ├── db.js             # LocalStorage database pre-seeded with 10 employees
│   ├── payslip.js        # Salary slip generator & print handler
│   └── salaryCalc.js     # Payroll formulas & Indian number-to-words converter
├── screenshots/          # High-resolution screenshots of all 11 system screens
├── web_server.py         # Lightweight Python HTTP server for localhost:8080
├── run_localhost.bat     # 1-Click launcher: starts server & opens browser
├── start_web.bat         # 1-Click launcher
└── README.md             # This documentation file
```
