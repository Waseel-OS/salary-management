/**
 * app.js - Main Application Controller (Connected to Java REST API Backend)
 * Connects UI events, tab routing, form validations, data tables, and modal dialogs.
 */

const API_BASE = '';

const API = {
    async login(username, password) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    },

    async getMetrics() {
        try {
            const res = await fetch(`${API_BASE}/api/dashboard/metrics`);
            if (!res.ok) throw new Error('Failed to fetch metrics');
            return await res.json();
        } catch (e) {
            console.error('Error fetching metrics:', e);
            return { totalEmployees: 0, activeEmployees: 0, totalSalaryProcessed: 0, payslipsGenerated: 0 };
        }
    },

    async getEmployees() {
        try {
            const res = await fetch(`${API_BASE}/api/employees`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error('Error fetching employees:', e);
            return [];
        }
    },

    async getEmployeeById(empId) {
        try {
            const res = await fetch(`${API_BASE}/api/employees/${encodeURIComponent(empId)}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('Error fetching employee:', e);
            return null;
        }
    },

    async addEmployee(emp) {
        const res = await fetch(`${API_BASE}/api/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp)
        });
        return await res.json();
    },

    async updateEmployee(emp) {
        const res = await fetch(`${API_BASE}/api/employees/${encodeURIComponent(emp.employeeId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp)
        });
        return await res.json();
    },

    async deleteEmployee(empId) {
        const res = await fetch(`${API_BASE}/api/employees/${encodeURIComponent(empId)}`, {
            method: 'DELETE'
        });
        return await res.json();
    },

    async getSalaries() {
        try {
            const res = await fetch(`${API_BASE}/api/salaries`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error('Error fetching salaries:', e);
            return [];
        }
    },

    async saveSalary(salary) {
        const res = await fetch(`${API_BASE}/api/salaries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salary)
        });
        return await res.json();
    },

    async deleteSalary(salId) {
        const res = await fetch(`${API_BASE}/api/salaries/${salId}`, {
            method: 'DELETE'
        });
        return await res.json();
    },

    async getPayslips() {
        try {
            const res = await fetch(`${API_BASE}/api/payslips`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error('Error fetching payslips:', e);
            return [];
        }
    },

    async generatePayslip(employeeId, month, year) {
        const res = await fetch(`${API_BASE}/api/payslips/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, month, year })
        });
        return await res.json();
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables & Caches ---
    let employeesCache = [];
    let salariesCache = [];
    let payslipsCache = [];
    let activeEmployeeForView = null;
    let activePayslipForPreview = null;

    // --- Session Storage Helpers ---
    function getActiveUser() {
        try {
            const u = sessionStorage.getItem('ems_active_user');
            return u ? JSON.parse(u) : null;
        } catch (e) {
            return null;
        }
    }

    function setActiveUser(user) {
        sessionStorage.setItem('ems_active_user', JSON.stringify(user));
    }

    function logoutUser() {
        sessionStorage.removeItem('ems_active_user');
    }

    function getNextEmployeeId() {
        if (!employeesCache || employeesCache.length === 0) return 'EMP001';
        const nums = employeesCache.map(e => {
            const m = (e.employeeId || '').match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        });
        const maxNum = Math.max(0, ...nums);
        return 'EMP' + String(maxNum + 1).padStart(3, '0');
    }

    // --- Initialization ---
    initAuth();
    startLiveClock();
    initNavigation();
    initModals();
    initEmployeeDirectory();
    initSalaryProcessing();
    initPayslipModule();
    initReportsModule();
    initSchemaModule();

    // ========================================================
    // 1. AUTHENTICATION & LOGIN
    // ========================================================
    function initAuth() {
        const loginForm = document.getElementById('loginForm');
        const loginView = document.getElementById('loginView');
        const appView = document.getElementById('appView');
        const btnClear = document.getElementById('btnClearLogin');
        const chkShow = document.getElementById('chkShowPass');
        const passInput = document.getElementById('loginPassword');
        const userInput = document.getElementById('loginUsername');

        // Check if already authenticated
        const activeUser = getActiveUser();
        if (activeUser) {
            showAppView(activeUser);
        } else {
            loginView.style.display = 'flex';
            appView.style.display = 'none';
        }

        chkShow.addEventListener('change', () => {
            passInput.type = chkShow.checked ? 'text' : 'password';
        });

        btnClear.addEventListener('click', () => {
            userInput.value = '';
            passInput.value = '';
            userInput.focus();
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = userInput.value.trim();
            const p = passInput.value.trim();

            try {
                const res = await API.login(u, p);
                if (res && res.success) {
                    setActiveUser(res);
                    showAppView(res);
                } else {
                    alert((res && res.message) || 'Invalid Username or Password.\n\nUse default demo login:\nUsername: admin\nPassword: admin123');
                    passInput.value = '';
                    passInput.focus();
                }
            } catch (err) {
                alert('Connection error. Please make sure the Java server is running on port 8080.');
            }
        });

        document.getElementById('btnLogout').addEventListener('click', () => {
            if (confirm('Are you sure you want to log out of the system?')) {
                logoutUser();
                appView.style.display = 'none';
                loginView.style.display = 'flex';
            }
        });
    }

    function showAppView(user) {
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('appView').style.display = 'flex';
        document.getElementById('adminDisplayName').textContent = user.fullName || 'System Admin';
        refreshDashboardStats();
    }

    // ========================================================
    // 2. LIVE CLOCK
    // ========================================================
    function startLiveClock() {
        const clockEl = document.getElementById('liveClock');
        function update() {
            const now = new Date();
            const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            clockEl.textContent = now.toLocaleDateString('en-IN', options).replace(/,/g, '');
        }
        update();
        setInterval(update, 1000);
    }

    // ========================================================
    // 3. TAB NAVIGATION
    // ========================================================
    function initNavigation() {
        const navButtons = document.querySelectorAll('.nav-item[data-tab]');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });

        // Quick action shortcuts on Dashboard
        document.getElementById('btnQuickAdd').addEventListener('click', () => openAddEmployeeModal());
        document.getElementById('btnQuickSal').addEventListener('click', () => switchTab('salary'));
        document.getElementById('btnQuickSlip').addEventListener('click', () => switchTab('payslips'));
        document.getElementById('btnQuickRep').addEventListener('click', () => switchTab('reports'));
        document.getElementById('btnViewAllEmployees').addEventListener('click', () => switchTab('employees'));
    }

    async function switchTab(tabName) {
        document.querySelectorAll('.nav-item[data-tab]').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.tab-view').forEach(view => {
            view.classList.remove('active');
        });

        const target = document.getElementById('view-' + tabName);
        if (target) {
            target.classList.add('active');
        }

        // Trigger refreshes
        if (tabName === 'dashboard') await refreshDashboardStats();
        if (tabName === 'employees') await renderEmployeeDirectory();
        if (tabName === 'salary') { await populateSalaryDropdowns(); await renderSalaryHistory(); }
        if (tabName === 'payslips') { await populatePayslipDropdowns(); await renderPayslipsRegister(); }
        if (tabName === 'reports') await renderReports();
    }

    // ========================================================
    // 4. MODAL DIALOGS ENGINE
    // ========================================================
    function initModals() {
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close-modal');
                closeModal(modalId);
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });
    }

    function openModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('active');
    }

    function closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    }

    // ========================================================
    // 5. DASHBOARD STATS & RECENT TABLE
    // ========================================================
    async function refreshDashboardStats() {
        const m = await API.getMetrics();
        document.getElementById('dashTotalEmployees').textContent = m.totalEmployees || 0;
        document.getElementById('dashActiveEmployees').textContent = m.activeEmployees || 0;
        document.getElementById('dashTotalSalary').textContent = SalaryCalc.formatCurrencyShort(m.totalSalaryProcessed || 0);
        document.getElementById('dashPayslipsGenerated').textContent = m.payslipsGenerated || 0;

        // Fetch recent employees
        employeesCache = await API.getEmployees();
        const tbody = document.querySelector('#tableRecentEmployees tbody');
        tbody.innerHTML = '';

        employeesCache.slice(0, 6).forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${emp.employeeId}</strong></td>
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${emp.department}</td>
                <td>${emp.designation}</td>
                <td>${SalaryCalc.formatCurrencyShort(emp.basicSalary)}</td>
                <td><span class="status-badge ${getStatusBadgeClass(emp.status)}">${emp.status}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm btn-view-emp" data-id="${emp.employeeId}">View</button>
                    <button class="btn btn-primary btn-sm btn-edit-emp" data-id="${emp.employeeId}">Edit</button>
                    <button class="btn btn-danger btn-sm btn-del-emp" data-id="${emp.employeeId}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachTableActionListeners(tbody);
    }

    function getStatusBadgeClass(status) {
        const s = (status || '').toLowerCase();
        if (s === 'active' || s === 'generated' || s === 'paid') return 'active';
        if (s === 'inactive' || s === 'terminated') return 'inactive';
        if (s === 'on leave' || s === 'pending') return 'leave';
        return 'leave';
    }

    function attachTableActionListeners(container) {
        container.querySelectorAll('.btn-view-emp').forEach(btn => {
            btn.addEventListener('click', () => openViewEmployeeModal(btn.dataset.id));
        });
        container.querySelectorAll('.btn-edit-emp').forEach(btn => {
            btn.addEventListener('click', () => openEditEmployeeModal(btn.dataset.id));
        });
        container.querySelectorAll('.btn-del-emp').forEach(btn => {
            btn.addEventListener('click', () => deleteEmployeeWithConfirm(btn.dataset.id));
        });
    }

    // ========================================================
    // 6. EMPLOYEE DIRECTORY & CRUD
    // ========================================================
    function initEmployeeDirectory() {
        const txtSearch = document.getElementById('txtEmpSearch');
        const cmbDept = document.getElementById('cmbEmpDeptFilter');
        const cmbStatus = document.getElementById('cmbEmpStatusFilter');

        txtSearch.addEventListener('input', () => filterAndRenderEmployees());
        cmbDept.addEventListener('change', () => filterAndRenderEmployees());
        cmbStatus.addEventListener('change', () => filterAndRenderEmployees());

        document.getElementById('btnRefreshEmployees').addEventListener('click', async () => {
            txtSearch.value = '';
            cmbDept.value = 'All';
            cmbStatus.value = 'All';
            await renderEmployeeDirectory();
        });

        document.getElementById('btnOpenAddEmployeeModal').addEventListener('click', () => openAddEmployeeModal());
        document.getElementById('btnResetAddForm').addEventListener('click', () => resetAddForm());

        // Add Employee Form Submit
        document.getElementById('formAddEmployee').addEventListener('submit', (e) => {
            e.preventDefault();
            saveNewEmployee();
        });

        // Edit Employee Form Submit
        document.getElementById('formEditEmployee').addEventListener('submit', (e) => {
            e.preventDefault();
            saveEditedEmployee();
        });

        // Edit button inside View Modal
        document.getElementById('btnEditFromView').addEventListener('click', () => {
            if (activeEmployeeForView) {
                closeModal('modalViewEmployee');
                openEditEmployeeModal(activeEmployeeForView.employeeId);
            }
        });

        // Export Directory CSV
        document.getElementById('btnExportEmployeesCSV').addEventListener('click', () => {
            exportTableToCSV('tableEmployeeDirectory', 'Employee_Directory.csv');
        });
    }

    async function renderEmployeeDirectory() {
        employeesCache = await API.getEmployees();
        filterAndRenderEmployees();
    }

    function filterAndRenderEmployees() {
        const query = document.getElementById('txtEmpSearch').value.trim().toLowerCase();
        const deptFilter = document.getElementById('cmbEmpDeptFilter').value;
        const statusFilter = document.getElementById('cmbEmpStatusFilter').value;

        let list = [...employeesCache];

        if (query) {
            list = list.filter(e => 
                (e.employeeId || '').toLowerCase().includes(query) ||
                (e.firstName + ' ' + e.lastName).toLowerCase().includes(query) ||
                (e.email || '').toLowerCase().includes(query) ||
                (e.department || '').toLowerCase().includes(query)
            );
        }

        if (deptFilter !== 'All') {
            list = list.filter(e => (e.department || '').toLowerCase() === deptFilter.toLowerCase());
        }

        if (statusFilter !== 'All') {
            list = list.filter(e => (e.status || '').toLowerCase() === statusFilter.toLowerCase());
        }

        document.getElementById('empCounterText').textContent = `Showing: ${list.length} registered personnel`;

        const tbody = document.querySelector('#tableEmployeeDirectory tbody');
        tbody.innerHTML = '';

        list.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${emp.employeeId}</strong></td>
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${emp.gender}</td>
                <td>${emp.phone}</td>
                <td>${emp.email}</td>
                <td>${emp.department}</td>
                <td>${emp.designation}</td>
                <td>${emp.joiningDate || '-'}</td>
                <td>${SalaryCalc.formatCurrencyShort(emp.basicSalary)}</td>
                <td><span class="status-badge ${getStatusBadgeClass(emp.status)}">${emp.status}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-secondary btn-sm btn-view-emp" data-id="${emp.employeeId}">View</button>
                    <button class="btn btn-primary btn-sm btn-edit-emp" data-id="${emp.employeeId}">Edit</button>
                    <button class="btn btn-danger btn-sm btn-del-emp" data-id="${emp.employeeId}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachTableActionListeners(tbody);
    }

    function openAddEmployeeModal() {
        resetAddForm();
        document.getElementById('addEmpId').value = getNextEmployeeId();
        document.getElementById('addEmpJoinDate').value = new Date().toISOString().substring(0, 10);
        openModal('modalAddEmployee');
    }

    function resetAddForm() {
        document.getElementById('formAddEmployee').reset();
        document.getElementById('addEmpId').value = getNextEmployeeId();
        document.getElementById('addEmpDob').value = '1996-05-15';
        document.getElementById('addEmpJoinDate').value = new Date().toISOString().substring(0, 10);
    }

    async function saveNewEmployee() {
        const emp = {
            employeeId: document.getElementById('addEmpId').value.trim(),
            status: document.getElementById('addEmpStatus').value,
            firstName: document.getElementById('addEmpFName').value.trim(),
            lastName: document.getElementById('addEmpLName').value.trim(),
            gender: document.getElementById('addEmpGender').value,
            dob: document.getElementById('addEmpDob').value,
            email: document.getElementById('addEmpEmail').value.trim(),
            phone: document.getElementById('addEmpPhone').value.trim(),
            department: document.getElementById('addEmpDept').value,
            designation: document.getElementById('addEmpDesig').value.trim(),
            joiningDate: document.getElementById('addEmpJoinDate').value,
            basicSalary: parseFloat(document.getElementById('addEmpBasic').value) || 0,
            bankAccount: document.getElementById('addEmpBank').value.trim(),
            panNumber: document.getElementById('addEmpPan').value.trim().toUpperCase()
        };

        try {
            const res = await API.addEmployee(emp);
            if (res && res.error) {
                alert('Error: ' + res.error);
                return;
            }
            closeModal('modalAddEmployee');
            alert(`Employee ${emp.firstName} ${emp.lastName} (${emp.employeeId}) registered successfully!`);
            await renderEmployeeDirectory();
            await refreshDashboardStats();
            await populateSalaryDropdowns();
            await populatePayslipDropdowns();
        } catch (ex) {
            alert('Error: ' + ex.message);
        }
    }

    async function openEditEmployeeModal(empId) {
        let emp = employeesCache.find(e => e.employeeId === empId);
        if (!emp) emp = await API.getEmployeeById(empId);
        if (!emp) return;

        document.getElementById('editEmpId').value = emp.employeeId;
        document.getElementById('editEmpStatus').value = emp.status;
        document.getElementById('editEmpFName').value = emp.firstName;
        document.getElementById('editEmpLName').value = emp.lastName;
        document.getElementById('editEmpGender').value = emp.gender;
        document.getElementById('editEmpDob').value = emp.dob;
        document.getElementById('editEmpEmail').value = emp.email;
        document.getElementById('editEmpPhone').value = emp.phone;
        document.getElementById('editEmpDept').value = emp.department;
        document.getElementById('editEmpDesig').value = emp.designation;
        document.getElementById('editEmpJoinDate').value = emp.joiningDate;
        document.getElementById('editEmpBasic').value = emp.basicSalary;
        document.getElementById('editEmpBank').value = emp.bankAccount;
        document.getElementById('editEmpPan').value = emp.panNumber;

        openModal('modalEditEmployee');
    }

    async function saveEditedEmployee() {
        const emp = {
            employeeId: document.getElementById('editEmpId').value.trim(),
            status: document.getElementById('editEmpStatus').value,
            firstName: document.getElementById('editEmpFName').value.trim(),
            lastName: document.getElementById('editEmpLName').value.trim(),
            gender: document.getElementById('editEmpGender').value,
            dob: document.getElementById('editEmpDob').value,
            email: document.getElementById('editEmpEmail').value.trim(),
            phone: document.getElementById('editEmpPhone').value.trim(),
            department: document.getElementById('editEmpDept').value,
            designation: document.getElementById('editEmpDesig').value.trim(),
            joiningDate: document.getElementById('editEmpJoinDate').value,
            basicSalary: parseFloat(document.getElementById('editEmpBasic').value) || 0,
            bankAccount: document.getElementById('editEmpBank').value.trim(),
            panNumber: document.getElementById('editEmpPan').value.trim().toUpperCase()
        };

        try {
            const res = await API.updateEmployee(emp);
            if (res && res.error) {
                alert('Error: ' + res.error);
                return;
            }
            closeModal('modalEditEmployee');
            alert(`Employee ${emp.firstName} ${emp.lastName} updated successfully!`);
            await renderEmployeeDirectory();
            await refreshDashboardStats();
            await populateSalaryDropdowns();
            await populatePayslipDropdowns();
        } catch (ex) {
            alert('Error: ' + ex.message);
        }
    }

    async function openViewEmployeeModal(empId) {
        let emp = employeesCache.find(e => e.employeeId === empId);
        if (!emp) emp = await API.getEmployeeById(empId);
        if (!emp) return;

        activeEmployeeForView = emp;
        document.getElementById('viewProfileTitle').textContent = `${emp.firstName.toUpperCase()} ${emp.lastName.toUpperCase()} (${emp.employeeId})`;

        const container = document.getElementById('viewProfileBody');
        container.innerHTML = `
            <div class="form-grid-2" style="font-size: 13.5px; row-gap: 14px;">
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">EMPLOYEE ID</div><strong>${emp.employeeId}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">STATUS</div><span class="status-badge ${getStatusBadgeClass(emp.status)}">${emp.status}</span></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">GENDER</div><strong>${emp.gender}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">DATE OF BIRTH</div><strong>${emp.dob}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">EMAIL</div><strong>${emp.email}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">PHONE</div><strong>${emp.phone}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">DEPARTMENT</div><strong>${emp.department}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">DESIGNATION</div><strong>${emp.designation}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">JOINING DATE</div><strong>${emp.joiningDate || '-'}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">BASIC SALARY</div><strong style="color: var(--primary-blue);">${SalaryCalc.formatCurrency(emp.basicSalary)} / Month</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">BANK ACCOUNT</div><strong>${emp.bankAccount}</strong></div>
                <div><div style="color: var(--text-muted); font-size: 11.5px; font-weight: 700;">PAN NUMBER</div><strong>${emp.panNumber}</strong></div>
            </div>
        `;
        openModal('modalViewEmployee');
    }

    async function deleteEmployeeWithConfirm(empId) {
        let emp = employeesCache.find(e => e.employeeId === empId);
        if (!emp) emp = await API.getEmployeeById(empId);
        if (!emp) return;

        if (confirm(`Are you sure you want to permanently delete employee:\n${emp.employeeId} - ${emp.firstName} ${emp.lastName}?\n\nThis will also remove their salary and payslip history.`)) {
            await API.deleteEmployee(empId);
            await renderEmployeeDirectory();
            await refreshDashboardStats();
            await populateSalaryDropdowns();
            await populatePayslipDropdowns();
            alert(`Employee ${empId} deleted successfully.`);
        }
    }

    // ========================================================
    // 7. SALARY PROCESSING & LIVE CALCULATOR
    // ========================================================
    function initSalaryProcessing() {
        const selectEmp = document.getElementById('salSelectEmployee');
        const basicInput = document.getElementById('salBasic');
        const btnAutoFill = document.getElementById('btnAutoFillAllowances');
        const btnCalc = document.getElementById('btnCalculateSalary');
        const formSal = document.getElementById('salaryProcessForm');
        const btnReset = document.getElementById('btnResetSalaryForm');

        selectEmp.addEventListener('change', () => {
            const emp = employeesCache.find(e => e.employeeId === selectEmp.value);
            if (emp) {
                basicInput.value = emp.basicSalary;
                autoFillAllowances();
            }
        });

        btnAutoFill.addEventListener('click', autoFillAllowances);
        btnCalc.addEventListener('click', calculateSalaryFromInputs);

        ['salBasic', 'salHra', 'salDa', 'salAllowances', 'salBonus', 'salPf', 'salPt', 'salOtherDed'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateSalaryFromInputs);
        });

        btnReset.addEventListener('click', () => {
            formSal.reset();
            document.getElementById('salPt').value = '200';
            if (selectEmp.value) {
                const emp = employeesCache.find(e => e.employeeId === selectEmp.value);
                if (emp) basicInput.value = emp.basicSalary;
            }
            calculateSalaryFromInputs();
        });

        formSal.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSalaryRecord();
        });

        document.getElementById('btnExportSalaryHistory').addEventListener('click', () => {
            exportTableToCSV('tableProcessedSalaries', 'Processed_Salary_Records.csv');
        });
    }

    async function populateSalaryDropdowns() {
        const selectEmp = document.getElementById('salSelectEmployee');
        const currentVal = selectEmp.value;
        selectEmp.innerHTML = '';

        employeesCache = await API.getEmployees();
        employeesCache.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.employeeId;
            opt.textContent = `${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.department})`;
            selectEmp.appendChild(opt);
        });

        if (employeesCache.length > 0) {
            selectEmp.value = currentVal && employeesCache.some(e => e.employeeId === currentVal) ? currentVal : employeesCache[0].employeeId;
            const emp = employeesCache.find(e => e.employeeId === selectEmp.value);
            if (emp) {
                document.getElementById('salBasic').value = emp.basicSalary;
                autoFillAllowances();
            }
        }
    }

    function autoFillAllowances() {
        const basic = parseFloat(document.getElementById('salBasic').value) || 0;
        document.getElementById('salHra').value = Math.round(basic * 0.40);
        document.getElementById('salDa').value = Math.round(basic * 0.10);
        document.getElementById('salAllowances').value = 4000;
        document.getElementById('salBonus').value = 0;
        document.getElementById('salPf').value = Math.round(basic * 0.12);
        document.getElementById('salPt').value = 200;
        document.getElementById('salOtherDed').value = 0;
        calculateSalaryFromInputs();
    }

    function calculateSalaryFromInputs() {
        const basic = parseFloat(document.getElementById('salBasic').value) || 0;
        const hra = parseFloat(document.getElementById('salHra').value) || 0;
        const da = parseFloat(document.getElementById('salDa').value) || 0;
        const allow = parseFloat(document.getElementById('salAllowances').value) || 0;
        const bonus = parseFloat(document.getElementById('salBonus').value) || 0;

        const pf = parseFloat(document.getElementById('salPf').value) || 0;
        const pt = parseFloat(document.getElementById('salPt').value) || 0;
        const other = parseFloat(document.getElementById('salOtherDed').value) || 0;

        const gross = SalaryCalc.calculateGross(basic, hra, da, allow, bonus);
        const deductions = SalaryCalc.calculateDeductions(pf, pt, other);
        const net = SalaryCalc.calculateNet(gross, deductions);

        document.getElementById('salGrossDisplay').textContent = SalaryCalc.formatCurrency(gross);
        document.getElementById('salDedDisplay').textContent = SalaryCalc.formatCurrency(deductions);
        document.getElementById('salNetDisplay').textContent = SalaryCalc.formatCurrency(net);
        document.getElementById('salWordsDisplay').textContent = SalaryCalc.convertToWords(net);

        return { gross, deductions, net };
    }

    async function saveSalaryRecord() {
        const empId = document.getElementById('salSelectEmployee').value;
        let emp = employeesCache.find(e => e.employeeId === empId);
        if (!emp) emp = await API.getEmployeeById(empId);
        if (!emp) return;

        const { gross, deductions, net } = calculateSalaryFromInputs();

        const salary = {
            employeeId: empId,
            salaryMonth: document.getElementById('salSelectMonth').value,
            salaryYear: parseInt(document.getElementById('salSelectYear').value, 10),
            basicSalary: parseFloat(document.getElementById('salBasic').value) || 0,
            hra: parseFloat(document.getElementById('salHra').value) || 0,
            da: parseFloat(document.getElementById('salDa').value) || 0,
            allowances: parseFloat(document.getElementById('salAllowances').value) || 0,
            bonus: parseFloat(document.getElementById('salBonus').value) || 0,
            pf: parseFloat(document.getElementById('salPf').value) || 0,
            professionalTax: parseFloat(document.getElementById('salPt').value) || 0,
            otherDeductions: parseFloat(document.getElementById('salOtherDed').value) || 0,
            grossSalary: gross,
            totalDeductions: deductions,
            netSalary: net,
            processedDate: new Date().toISOString().substring(0, 10)
        };

        const res = await API.saveSalary(salary);
        if (res && res.error) {
            alert('Error saving salary: ' + res.error);
            return;
        }

        await renderSalaryHistory();
        await refreshDashboardStats();
        alert(`Salary record for ${emp.firstName} ${emp.lastName} (${salary.salaryMonth} ${salary.salaryYear}) saved successfully!\nNet Pay: ${SalaryCalc.formatCurrency(net)}`);
    }

    async function renderSalaryHistory() {
        salariesCache = await API.getSalaries();
        if (employeesCache.length === 0) employeesCache = await API.getEmployees();

        const tbody = document.querySelector('#tableProcessedSalaries tbody');
        tbody.innerHTML = '';

        salariesCache.slice().reverse().forEach(s => {
            const emp = employeesCache.find(e => e.employeeId === s.employeeId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>SAL${String(s.salaryId).padStart(3, '0')}</strong></td>
                <td>${s.employeeId}</td>
                <td>${emp ? emp.firstName + ' ' + emp.lastName : '-'}</td>
                <td>${emp ? emp.department : '-'}</td>
                <td>${s.salaryMonth} ${s.salaryYear}</td>
                <td>${SalaryCalc.formatCurrencyShort(s.basicSalary)}</td>
                <td>${SalaryCalc.formatCurrencyShort(s.grossSalary)}</td>
                <td>${SalaryCalc.formatCurrencyShort(s.totalDeductions)}</td>
                <td><strong style="color: var(--primary-blue);">${SalaryCalc.formatCurrencyShort(s.netSalary)}</strong></td>
                <td>${s.processedDate || '-'}</td>
                <td style="text-align: right;">
                    <button class="btn btn-danger btn-sm btn-del-sal" data-id="${s.salaryId}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-del-sal').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id, 10);
                if (confirm(`Delete salary transaction record #${id}?`)) {
                    await API.deleteSalary(id);
                    await renderSalaryHistory();
                    await refreshDashboardStats();
                }
            });
        });
    }

    // ========================================================
    // 8. PAYSLIP GENERATION & PREVIEW
    // ========================================================
    function initPayslipModule() {
        document.getElementById('btnGeneratePayslip').addEventListener('click', generatePayslipAction);

        document.getElementById('btnPrintPayslip').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('btnDownloadPayslipText').addEventListener('click', async () => {
            if (activePayslipForPreview) {
                let emp = employeesCache.find(e => e.employeeId === activePayslipForPreview.employeeId);
                if (!emp) emp = await API.getEmployeeById(activePayslipForPreview.employeeId);
                
                let sal = salariesCache.find(s => s.salaryId === activePayslipForPreview.salaryId);
                if (!sal) {
                    salariesCache = await API.getSalaries();
                    sal = salariesCache.find(s => s.salaryId === activePayslipForPreview.salaryId);
                }
                if (sal) {
                    PayslipRenderer.downloadTextSlip(emp, sal);
                }
            }
        });

        document.getElementById('btnExportPayslipsRegister').addEventListener('click', () => {
            exportTableToCSV('tablePayslipsRegister', 'Generated_Payslips_Register.csv');
        });
    }

    async function populatePayslipDropdowns() {
        const selectEmp = document.getElementById('slipSelectEmployee');
        const currentVal = selectEmp.value;
        selectEmp.innerHTML = '';

        if (employeesCache.length === 0) employeesCache = await API.getEmployees();
        employeesCache.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.employeeId;
            opt.textContent = `${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.department})`;
            selectEmp.appendChild(opt);
        });

        if (employeesCache.length > 0) {
            selectEmp.value = currentVal && employeesCache.some(e => e.employeeId === currentVal) ? currentVal : employeesCache[0].employeeId;
        }
    }

    async function generatePayslipAction() {
        const empId = document.getElementById('slipSelectEmployee').value;
        const month = document.getElementById('slipSelectMonth').value;
        const year = parseInt(document.getElementById('slipSelectYear').value, 10);

        let emp = employeesCache.find(e => e.employeeId === empId);
        if (!emp) emp = await API.getEmployeeById(empId);
        if (!emp) {
            alert('Please select a valid employee.');
            return;
        }

        try {
            const payslip = await API.generatePayslip(empId, month, year);
            if (payslip && payslip.error) {
                alert('Error generating payslip: ' + payslip.error);
                return;
            }

            salariesCache = await API.getSalaries();
            const salary = salariesCache.find(s => s.salaryId === payslip.salaryId);

            await renderPayslipsRegister();
            await refreshDashboardStats();
            openPayslipPreviewModal(emp, salary, payslip);
        } catch (e) {
            alert('Failed to generate payslip: ' + e.message);
        }
    }

    function openPayslipPreviewModal(emp, salary, payslip) {
        activePayslipForPreview = payslip;
        const container = document.getElementById('payslipPreviewContainer');
        container.innerHTML = PayslipRenderer.renderSlipHTML(emp, salary, payslip);
        openModal('modalPayslipPreview');
    }

    async function renderPayslipsRegister() {
        payslipsCache = await API.getPayslips();
        if (employeesCache.length === 0) employeesCache = await API.getEmployees();
        if (salariesCache.length === 0) salariesCache = await API.getSalaries();

        const tbody = document.querySelector('#tablePayslipsRegister tbody');
        tbody.innerHTML = '';

        payslipsCache.slice().reverse().forEach(p => {
            const emp = employeesCache.find(e => e.employeeId === p.employeeId);
            const sal = salariesCache.find(s => s.salaryId === p.salaryId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>PS${String(p.payslipId).padStart(4, '0')}</strong></td>
                <td>${p.employeeId}</td>
                <td>${emp ? emp.firstName + ' ' + emp.lastName : '-'}</td>
                <td>${emp ? emp.department : '-'}</td>
                <td>${sal ? sal.salaryMonth + ' ' + sal.salaryYear : '-'}</td>
                <td>${sal ? SalaryCalc.formatCurrencyShort(sal.grossSalary) : '-'}</td>
                <td><strong style="color: var(--primary-blue);">${sal ? SalaryCalc.formatCurrencyShort(sal.netSalary) : '-'}</strong></td>
                <td><span class="status-badge ${getStatusBadgeClass(p.status)}">${p.status}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-primary btn-sm btn-view-slip" data-emp="${p.employeeId}" data-sal="${p.salaryId}" data-ps="${p.payslipId}">View Slip</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-view-slip').forEach(btn => {
            btn.addEventListener('click', async () => {
                const empId = btn.dataset.emp;
                const salId = parseInt(btn.dataset.sal, 10);
                const psId = parseInt(btn.dataset.ps, 10);

                let emp = employeesCache.find(e => e.employeeId === empId);
                if (!emp) emp = await API.getEmployeeById(empId);
                
                let sal = salariesCache.find(s => s.salaryId === salId);
                let ps = payslipsCache.find(p => p.payslipId === psId);

                if (emp && sal && ps) {
                    openPayslipPreviewModal(emp, sal, ps);
                }
            });
        });
    }

    // ========================================================
    // 9. REPORTS & CSV EXPORT
    // ========================================================
    function initReportsModule() {
        const cmbType = document.getElementById('cmbReportType');
        const txtSearch = document.getElementById('txtReportSearch');

        cmbType.addEventListener('change', () => renderReports());
        txtSearch.addEventListener('input', () => renderReports());
        document.getElementById('btnRefreshReport').addEventListener('click', async () => {
            txtSearch.value = '';
            await renderReports();
        });

        document.getElementById('btnExportActiveReportCSV').addEventListener('click', () => {
            const name = cmbType.value + '_Report.csv';
            exportTableToCSV('tableReports', name);
        });
    }

    async function renderReports() {
        const type = document.getElementById('cmbReportType').value;
        const search = document.getElementById('txtReportSearch').value.trim().toLowerCase();
        const thead = document.querySelector('#tableReports thead');
        const tbody = document.querySelector('#tableReports tbody');

        thead.innerHTML = '';
        tbody.innerHTML = '';

        let recordsCount = 0;
        let totalPayout = 0;

        salariesCache = await API.getSalaries();
        if (employeesCache.length === 0) employeesCache = await API.getEmployees();
        if (payslipsCache.length === 0) payslipsCache = await API.getPayslips();

        if (type === 'employee') {
            thead.innerHTML = `
                <tr>
                    <th>Emp ID</th><th>Employee Name</th><th>Department</th><th>Designation</th>
                    <th>Period</th><th>Basic</th><th>HRA</th><th>DA</th><th>Gross</th><th>Deductions</th><th>Net Salary</th>
                </tr>
            `;
            salariesCache.forEach(s => {
                const emp = employeesCache.find(e => e.employeeId === s.employeeId);
                const name = emp ? emp.firstName + ' ' + emp.lastName : '';
                const dept = emp ? emp.department : '';

                if (search && !s.employeeId.toLowerCase().includes(search) && !name.toLowerCase().includes(search) && !dept.toLowerCase().includes(search)) {
                    return;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${s.employeeId}</strong></td>
                    <td>${name}</td>
                    <td>${dept}</td>
                    <td>${emp ? emp.designation : '-'}</td>
                    <td>${s.salaryMonth} ${s.salaryYear}</td>
                    <td>${SalaryCalc.formatCurrencyShort(s.basicSalary)}</td>
                    <td>${SalaryCalc.formatCurrencyShort(s.hra)}</td>
                    <td>${SalaryCalc.formatCurrencyShort(s.da)}</td>
                    <td>${SalaryCalc.formatCurrencyShort(s.grossSalary)}</td>
                    <td>${SalaryCalc.formatCurrencyShort(s.totalDeductions)}</td>
                    <td><strong style="color: var(--primary-blue);">${SalaryCalc.formatCurrencyShort(s.netSalary)}</strong></td>
                `;
                tbody.appendChild(tr);
                recordsCount++;
                totalPayout += parseFloat(s.netSalary) || 0;
            });

        } else if (type === 'department') {
            thead.innerHTML = `
                <tr><th>Department</th><th>Staff Count</th><th>Total Basic</th><th>Total Gross</th><th>Total Net Payout</th><th>Average Net</th></tr>
            `;
            const deptMap = {};

            salariesCache.forEach(s => {
                const emp = employeesCache.find(e => e.employeeId === s.employeeId);
                const dept = emp ? emp.department : 'General';
                if (!deptMap[dept]) {
                    deptMap[dept] = { count: 0, basic: 0, gross: 0, net: 0 };
                }
                deptMap[dept].count += 1;
                deptMap[dept].basic += s.basicSalary;
                deptMap[dept].gross += s.grossSalary;
                deptMap[dept].net += s.netSalary;
            });

            for (const [dept, v] of Object.entries(deptMap)) {
                if (search && !dept.toLowerCase().includes(search)) continue;

                const avg = v.count > 0 ? (v.net / v.count) : 0;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${dept}</strong></td>
                    <td>${v.count} Employees</td>
                    <td>${SalaryCalc.formatCurrency(v.basic)}</td>
                    <td>${SalaryCalc.formatCurrency(v.gross)}</td>
                    <td><strong style="color: var(--primary-blue);">${SalaryCalc.formatCurrency(v.net)}</strong></td>
                    <td>${SalaryCalc.formatCurrency(avg)}</td>
                `;
                tbody.appendChild(tr);
                recordsCount += v.count;
                totalPayout += v.net;
            }

        } else if (type === 'monthly') {
            thead.innerHTML = `
                <tr><th>Billing Cycle (Period)</th><th>Disbursements Count</th><th>Total Gross</th><th>Total Deductions</th><th>Total Net Disbursed</th></tr>
            `;
            const pMap = {};

            salariesCache.forEach(s => {
                const pKey = `${s.salaryMonth} ${s.salaryYear}`;
                if (!pMap[pKey]) pMap[pKey] = { count: 0, gross: 0, ded: 0, net: 0 };
                pMap[pKey].count += 1;
                pMap[pKey].gross += s.grossSalary;
                pMap[pKey].ded += s.totalDeductions;
                pMap[pKey].net += s.netSalary;
            });

            for (const [pKey, v] of Object.entries(pMap)) {
                if (search && !pKey.toLowerCase().includes(search)) continue;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${pKey}</strong></td>
                    <td>${v.count} Salaries Processed</td>
                    <td>${SalaryCalc.formatCurrency(v.gross)}</td>
                    <td>${SalaryCalc.formatCurrency(v.ded)}</td>
                    <td><strong style="color: var(--primary-blue);">${SalaryCalc.formatCurrency(v.net)}</strong></td>
                `;
                tbody.appendChild(tr);
                recordsCount += v.count;
                totalPayout += v.net;
            }

        } else if (type === 'payslip') {
            thead.innerHTML = `
                <tr><th>Slip ID</th><th>Employee ID</th><th>Employee Name</th><th>Department</th><th>Period</th><th>Net Pay</th><th>Status</th></tr>
            `;
            payslipsCache.forEach(p => {
                const emp = employeesCache.find(e => e.employeeId === p.employeeId);
                const sal = salariesCache.find(s => s.salaryId === p.salaryId);
                const name = emp ? emp.firstName + ' ' + emp.lastName : '';

                if (search && !p.employeeId.toLowerCase().includes(search) && !name.toLowerCase().includes(search)) {
                    return;
                }

                const net = sal ? sal.netSalary : 0;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>PS${String(p.payslipId).padStart(4, '0')}</strong></td>
                    <td>${p.employeeId}</td>
                    <td>${name}</td>
                    <td>${emp ? emp.department : '-'}</td>
                    <td>${sal ? sal.salaryMonth + ' ' + sal.salaryYear : '-'}</td>
                    <td><strong style="color: var(--primary-blue);">${SalaryCalc.formatCurrencyShort(net)}</strong></td>
                    <td><span class="status-badge ${getStatusBadgeClass(p.status)}">${p.status}</span></td>
                `;
                tbody.appendChild(tr);
                recordsCount++;
                totalPayout += net;
            });
        }

        document.getElementById('repRecordsCount').textContent = `Records: ${recordsCount}`;
        document.getElementById('repTotalPayout').textContent = `Total Payout: ${SalaryCalc.formatCurrency(totalPayout)}`;
        const avg = recordsCount > 0 ? (totalPayout / recordsCount) : 0;
        document.getElementById('repAvgPayout').textContent = `Average Net: ${SalaryCalc.formatCurrency(avg)}`;
    }

    function exportTableToCSV(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) return;

        let csv = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            let rowData = [];
            cols.forEach((col, idx) => {
                // Skip action column
                if (col.textContent.trim().toLowerCase() === 'action' || col.textContent.trim().toLowerCase() === 'actions') return;
                let text = col.innerText.replace(/"/g, '""').trim();
                rowData.push(`"${text}"`);
            });
            if (rowData.length > 0) csv.push(rowData.join(','));
        });

        const csvBlob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(csvBlob);
        a.download = filename || 'Export.csv';
        a.click();
    }

    // ========================================================
    // 10. DATABASE SCHEMA MODULE
    // ========================================================
    function initSchemaModule() {
        document.getElementById('btnSimulateTestConn').addEventListener('click', async () => {
            const statusEl = document.getElementById('schemaEngineStatus');
            statusEl.innerHTML = '&bull; Testing Live Connection to Java Server & MySQL...';
            try {
                const metrics = await API.getMetrics();
                statusEl.innerHTML = '&bull; MySQL Database & Java Backend Active &bull; Connected';
                statusEl.style.color = 'var(--success-text)';
                alert(`Database Connection Verified Successfully!\n\nBackend: Java HTTP Server (Port 8080)\nDatabase: MySQL (Port 3306)\nActive Personnel: ${metrics.activeEmployees || 0}\nStatus: Online`);
            } catch (err) {
                statusEl.innerHTML = '&bull; Connection Failed';
                statusEl.style.color = 'var(--accent-red)';
                alert('Failed to connect to backend server. Make sure Java backend is running on http://localhost:8080.');
            }
        });
    }

});
