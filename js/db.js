/**
 * db.js - Client-side Database & LocalStorage Engine
 * Handles persistent state for Employees, Salaries, Payslips, and Admin authentication.
 */

const DB_KEYS = {
    EMPLOYEES: 'ems_employees',
    SALARIES: 'ems_salaries',
    PAYSLIPS: 'ems_payslips',
    ADMIN: 'ems_admin',
    ACTIVE_USER: 'ems_active_user'
};

// Initial Seed Data: 10 Realistic Employees
const INITIAL_EMPLOYEES = [
    {
        employeeId: 'EMP001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        gender: 'Male',
        dob: '1992-05-14',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        department: 'IT',
        designation: 'Senior Software Developer',
        joiningDate: '2021-06-15',
        basicSalary: 75000,
        bankAccount: 'HDFC000123456789',
        panNumber: 'ABCPS1234F',
        status: 'Active'
    },
    {
        employeeId: 'EMP002',
        firstName: 'Priya',
        lastName: 'Patel',
        gender: 'Female',
        dob: '1995-08-22',
        email: 'priya.patel@example.com',
        phone: '9876543211',
        department: 'HR',
        designation: 'HR Manager',
        joiningDate: '2022-01-10',
        basicSalary: 62000,
        bankAccount: 'SBIN000987654321',
        panNumber: 'BPYPP5678G',
        status: 'Active'
    },
    {
        employeeId: 'EMP003',
        firstName: 'Amit',
        lastName: 'Verma',
        gender: 'Male',
        dob: '1990-11-03',
        email: 'amit.verma@example.com',
        phone: '9876543212',
        department: 'Finance',
        designation: 'Senior Financial Analyst',
        joiningDate: '2020-09-01',
        basicSalary: 68000,
        bankAccount: 'ICIC000456789123',
        panNumber: 'CAAVV9012K',
        status: 'Active'
    },
    {
        employeeId: 'EMP004',
        firstName: 'Sneha',
        lastName: 'Kulkarni',
        gender: 'Female',
        dob: '1994-03-18',
        email: 'sneha.k@example.com',
        phone: '9876543213',
        department: 'Marketing',
        designation: 'Digital Marketing Lead',
        joiningDate: '2022-04-12',
        basicSalary: 55000,
        bankAccount: 'AXIS000789123456',
        panNumber: 'DESPK3456M',
        status: 'Active'
    },
    {
        employeeId: 'EMP005',
        firstName: 'Vikram',
        lastName: 'Singh',
        gender: 'Male',
        dob: '1989-12-25',
        email: 'vikram.singh@example.com',
        phone: '9876543214',
        department: 'Operations',
        designation: 'Operations Manager',
        joiningDate: '2019-11-20',
        basicSalary: 58000,
        bankAccount: 'KKBK000321654987',
        panNumber: 'EFGVS7890N',
        status: 'Active'
    },
    {
        employeeId: 'EMP006',
        firstName: 'Ananya',
        lastName: 'Roy',
        gender: 'Female',
        dob: '1997-07-09',
        email: 'ananya.roy@example.com',
        phone: '9876543215',
        department: 'IT',
        designation: 'Frontend Engineer',
        joiningDate: '2023-02-15',
        basicSalary: 48000,
        bankAccount: 'HDFC000654987321',
        panNumber: 'FGHAR2345P',
        status: 'Active'
    },
    {
        employeeId: 'EMP007',
        firstName: 'Rajesh',
        lastName: 'Gupta',
        gender: 'Male',
        dob: '1991-04-30',
        email: 'rajesh.gupta@example.com',
        phone: '9876543216',
        department: 'Finance',
        designation: 'Accounts Executive',
        joiningDate: '2021-08-05',
        basicSalary: 42000,
        bankAccount: 'PNBB000147258369',
        panNumber: 'GHIRE6789Q',
        status: 'Active'
    },
    {
        employeeId: 'EMP008',
        firstName: 'Pooja',
        lastName: 'Nair',
        gender: 'Female',
        dob: '1996-09-14',
        email: 'pooja.nair@example.com',
        phone: '9876543217',
        department: 'HR',
        designation: 'Talent Acquisition Specialist',
        joiningDate: '2023-05-01',
        basicSalary: 40000,
        bankAccount: 'SBIN000369258147',
        panNumber: 'HIJPN0123R',
        status: 'Active'
    },
    {
        employeeId: 'EMP009',
        firstName: 'Karthik',
        lastName: 'Iyer',
        gender: 'Male',
        dob: '1993-01-19',
        email: 'karthik.iyer@example.com',
        phone: '9876543218',
        department: 'IT',
        designation: 'DevOps Engineer',
        joiningDate: '2022-07-18',
        basicSalary: 70000,
        bankAccount: 'ICIC000852963741',
        panNumber: 'IJKKI4567S',
        status: 'Active'
    },
    {
        employeeId: 'EMP010',
        firstName: 'Divya',
        lastName: 'Joshi',
        gender: 'Female',
        dob: '1998-10-05',
        email: 'divya.joshi@example.com',
        phone: '9876543219',
        department: 'Marketing',
        designation: 'Content Strategist',
        joiningDate: '2023-10-10',
        basicSalary: 38000,
        bankAccount: 'BARB000963852741',
        panNumber: 'JKLDJ8901T',
        status: 'Inactive'
    }
];

// Initial Seed Salaries (September 2026)
const INITIAL_SALARIES = [
    { salaryId: 1, employeeId: 'EMP001', salaryMonth: 'September', salaryYear: 2026, basicSalary: 75000, hra: 30000, da: 7500, allowances: 5000, bonus: 5000, pf: 9000, professionalTax: 200, otherDeductions: 1000, grossSalary: 122500, totalDeductions: 10200, netSalary: 112300, processedDate: '2026-09-20' },
    { salaryId: 2, employeeId: 'EMP002', salaryMonth: 'September', salaryYear: 2026, basicSalary: 62000, hra: 24800, da: 6200, allowances: 4000, bonus: 3000, pf: 7440, professionalTax: 200, otherDeductions: 500, grossSalary: 100000, totalDeductions: 8140, netSalary: 91860, processedDate: '2026-09-20' },
    { salaryId: 3, employeeId: 'EMP003', salaryMonth: 'September', salaryYear: 2026, basicSalary: 68000, hra: 27200, da: 6800, allowances: 4500, bonus: 4000, pf: 8160, professionalTax: 200, otherDeductions: 800, grossSalary: 110500, totalDeductions: 9160, netSalary: 101340, processedDate: '2026-09-20' },
    { salaryId: 4, employeeId: 'EMP004', salaryMonth: 'September', salaryYear: 2026, basicSalary: 55000, hra: 22000, da: 5500, allowances: 3500, bonus: 2000, pf: 6600, professionalTax: 200, otherDeductions: 500, grossSalary: 88000, totalDeductions: 7300, netSalary: 80700, processedDate: '2026-09-20' },
    { salaryId: 5, employeeId: 'EMP005', salaryMonth: 'September', salaryYear: 2026, basicSalary: 58000, hra: 23200, da: 5800, allowances: 3800, bonus: 2500, pf: 6960, professionalTax: 200, otherDeductions: 600, grossSalary: 93300, totalDeductions: 7760, netSalary: 85540, processedDate: '2026-09-20' },
    { salaryId: 6, employeeId: 'EMP006', salaryMonth: 'September', salaryYear: 2026, basicSalary: 48000, hra: 19200, da: 4800, allowances: 3000, bonus: 2000, pf: 5760, professionalTax: 200, otherDeductions: 400, grossSalary: 77000, totalDeductions: 6360, netSalary: 70640, processedDate: '2026-09-20' },
    { salaryId: 7, employeeId: 'EMP007', salaryMonth: 'September', salaryYear: 2026, basicSalary: 42000, hra: 16800, da: 4200, allowances: 2800, bonus: 1500, pf: 5040, professionalTax: 200, otherDeductions: 300, grossSalary: 67300, totalDeductions: 5540, netSalary: 61760, processedDate: '2026-09-20' },
    { salaryId: 8, employeeId: 'EMP008', salaryMonth: 'September', salaryYear: 2026, basicSalary: 40000, hra: 16000, da: 4000, allowances: 2500, bonus: 1500, pf: 4800, professionalTax: 200, otherDeductions: 300, grossSalary: 64000, totalDeductions: 5300, netSalary: 58700, processedDate: '2026-09-20' },
    { salaryId: 9, employeeId: 'EMP009', salaryMonth: 'September', salaryYear: 2026, basicSalary: 70000, hra: 28000, da: 7000, allowances: 4800, bonus: 4500, pf: 8400, professionalTax: 200, otherDeductions: 900, grossSalary: 114300, totalDeductions: 9500, netSalary: 104800, processedDate: '2026-09-20' }
];

// Initial Seed Payslips
const INITIAL_PAYSLIPS = [
    { payslipId: 1, employeeId: 'EMP001', salaryId: 1, generatedDate: '2026-09-21 10:30:00', status: 'Generated' },
    { payslipId: 2, employeeId: 'EMP002', salaryId: 2, generatedDate: '2026-09-21 10:35:00', status: 'Generated' },
    { payslipId: 3, employeeId: 'EMP003', salaryId: 3, generatedDate: '2026-09-21 10:40:00', status: 'Generated' },
    { payslipId: 4, employeeId: 'EMP004', salaryId: 4, generatedDate: '2026-09-21 10:45:00', status: 'Generated' },
    { payslipId: 5, employeeId: 'EMP005', salaryId: 5, generatedDate: '2026-09-21 10:50:00', status: 'Generated' },
    { payslipId: 6, employeeId: 'EMP006', salaryId: 6, generatedDate: '2026-09-21 10:55:00', status: 'Generated' },
    { payslipId: 7, employeeId: 'EMP007', salaryId: 7, generatedDate: '2026-09-21 11:00:00', status: 'Generated' },
    { payslipId: 8, employeeId: 'EMP008', salaryId: 8, generatedDate: '2026-09-21 11:05:00', status: 'Generated' },
    { payslipId: 9, employeeId: 'EMP009', salaryId: 9, generatedDate: '2026-09-21 11:10:00', status: 'Generated' }
];

class DB {
    static init() {
        if (!localStorage.getItem(DB_KEYS.EMPLOYEES)) {
            localStorage.setItem(DB_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
        }
        if (!localStorage.getItem(DB_KEYS.SALARIES)) {
            localStorage.setItem(DB_KEYS.SALARIES, JSON.stringify(INITIAL_SALARIES));
        }
        if (!localStorage.getItem(DB_KEYS.PAYSLIPS)) {
            localStorage.setItem(DB_KEYS.PAYSLIPS, JSON.stringify(INITIAL_PAYSLIPS));
        }
        if (!localStorage.getItem(DB_KEYS.ADMIN)) {
            localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify({ username: 'admin', password: 'admin123', fullName: 'System Administrator' }));
        }
    }

    static resetDemoData() {
        localStorage.setItem(DB_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
        localStorage.setItem(DB_KEYS.SALARIES, JSON.stringify(INITIAL_SALARIES));
        localStorage.setItem(DB_KEYS.PAYSLIPS, JSON.stringify(INITIAL_PAYSLIPS));
        localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify({ username: 'admin', password: 'admin123', fullName: 'System Administrator' }));
    }

    // --- Admin Authentication ---
    static authenticate(username, password) {
        const admin = JSON.parse(localStorage.getItem(DB_KEYS.ADMIN) || '{}');
        if (admin.username === username && admin.password === password) {
            localStorage.setItem(DB_KEYS.ACTIVE_USER, JSON.stringify(admin));
            return true;
        }
        return false;
    }

    static getActiveUser() {
        const u = localStorage.getItem(DB_KEYS.ACTIVE_USER);
        return u ? JSON.parse(u) : null;
    }

    static logout() {
        localStorage.removeItem(DB_KEYS.ACTIVE_USER);
    }

    // --- Employee Operations (CRUD) ---
    static getEmployees() {
        return JSON.parse(localStorage.getItem(DB_KEYS.EMPLOYEES) || '[]');
    }

    static getEmployeeById(id) {
        return this.getEmployees().find(e => e.employeeId === id) || null;
    }

    static getNextEmployeeId() {
        const employees = this.getEmployees();
        let max = 0;
        employees.forEach(e => {
            if (e.employeeId.startsWith('EMP')) {
                const num = parseInt(e.employeeId.substring(3), 10);
                if (!isNaN(num) && num > max) max = num;
            }
        });
        return 'EMP' + String(max + 1).padStart(3, '0');
    }

    static addEmployee(employee) {
        const employees = this.getEmployees();
        if (employees.some(e => e.email.toLowerCase() === employee.email.toLowerCase())) {
            throw new Error('Email address already registered.');
        }
        employees.push(employee);
        localStorage.setItem(DB_KEYS.EMPLOYEES, JSON.stringify(employees));
        return true;
    }

    static updateEmployee(employee) {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.employeeId === employee.employeeId);
        if (index === -1) throw new Error('Employee not found.');
        
        // Check email uniqueness
        if (employees.some((e, i) => i !== index && e.email.toLowerCase() === employee.email.toLowerCase())) {
            throw new Error('Email address is already in use by another employee.');
        }
        employees[index] = employee;
        localStorage.setItem(DB_KEYS.EMPLOYEES, JSON.stringify(employees));
        return true;
    }

    static deleteEmployee(employeeId) {
        let employees = this.getEmployees();
        employees = employees.filter(e => e.employeeId !== employeeId);
        localStorage.setItem(DB_KEYS.EMPLOYEES, JSON.stringify(employees));

        // Cascade delete salaries & payslips
        let salaries = this.getSalaries().filter(s => s.employeeId !== employeeId);
        localStorage.setItem(DB_KEYS.SALARIES, JSON.stringify(salaries));

        let payslips = this.getPayslips().filter(p => p.employeeId !== employeeId);
        localStorage.setItem(DB_KEYS.PAYSLIPS, JSON.stringify(payslips));
        return true;
    }

    // --- Salary Operations ---
    static getSalaries() {
        return JSON.parse(localStorage.getItem(DB_KEYS.SALARIES) || '[]');
    }

    static getSalaryByEmployeeAndPeriod(employeeId, month, year) {
        return this.getSalaries().find(s => 
            s.employeeId === employeeId && 
            s.salaryMonth.toLowerCase() === month.toLowerCase() && 
            parseInt(s.salaryYear, 10) === parseInt(year, 10)
        ) || null;
    }

    static saveSalary(salary) {
        const salaries = this.getSalaries();
        const existingIndex = salaries.findIndex(s => 
            s.employeeId === salary.employeeId && 
            s.salaryMonth.toLowerCase() === salary.salaryMonth.toLowerCase() && 
            parseInt(s.salaryYear, 10) === parseInt(salary.salaryYear, 10)
        );

        if (existingIndex !== -1) {
            salary.salaryId = salaries[existingIndex].salaryId;
            salaries[existingIndex] = salary;
        } else {
            let maxId = 0;
            salaries.forEach(s => { if (s.salaryId > maxId) maxId = s.salaryId; });
            salary.salaryId = maxId + 1;
            salaries.push(salary);
        }
        localStorage.setItem(DB_KEYS.SALARIES, JSON.stringify(salaries));
        return salary.salaryId;
    }

    static deleteSalary(salaryId) {
        let salaries = this.getSalaries().filter(s => s.salaryId !== salaryId);
        localStorage.setItem(DB_KEYS.SALARIES, JSON.stringify(salaries));
        let payslips = this.getPayslips().filter(p => p.salaryId !== salaryId);
        localStorage.setItem(DB_KEYS.PAYSLIPS, JSON.stringify(payslips));
        return true;
    }

    // --- Payslip Operations ---
    static getPayslips() {
        return JSON.parse(localStorage.getItem(DB_KEYS.PAYSLIPS) || '[]');
    }

    static getOrCreatePayslip(employeeId, salaryId) {
        const payslips = this.getPayslips();
        let slip = payslips.find(p => p.employeeId === employeeId && p.salaryId === salaryId);
        if (slip) return slip;

        let maxId = 0;
        payslips.forEach(p => { if (p.payslipId > maxId) maxId = p.payslipId; });
        slip = {
            payslipId: maxId + 1,
            employeeId: employeeId,
            salaryId: salaryId,
            generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'Generated'
        };
        payslips.push(slip);
        localStorage.setItem(DB_KEYS.PAYSLIPS, JSON.stringify(payslips));
        return slip;
    }

    // --- Dashboard Metrics ---
    static getMetrics() {
        const employees = this.getEmployees();
        const salaries = this.getSalaries();
        const payslips = this.getPayslips();

        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(e => e.status === 'Active').length;
        const totalSalaryProcessed = salaries.reduce((acc, s) => acc + (parseFloat(s.netSalary) || 0), 0);
        const payslipsGenerated = payslips.length;

        return {
            totalEmployees,
            activeEmployees,
            totalSalaryProcessed,
            payslipsGenerated
        };
    }
}

// Auto-initialize on script load
DB.init();
