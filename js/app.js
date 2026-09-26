/**
 * app.js - Main Application Controller
 * Connects UI events, tab routing, form validations, data tables, and modal dialogs.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let activeEmployeeForView = null;
    let activePayslipForPreview = null;

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
        const activeUser = DB.getActiveUser();
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

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = userInput.value.trim();
            const p = passInput.value.trim();

            if (DB.authenticate(u, p)) {
                showAppView(DB.getActiveUser());
            } else {
                alert('Invalid Username or Password.\n\nUse default demo login:\nUsername: admin\nPassword: admin123');
                passInput.value = '';
                passInput.focus();
            }
        });

        document.getElementById('btnLogout').addEventListener('click', () => {
            if (confirm('Are you sure you want to log out of the system?')) {
                DB.logout();
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

    function switchTab(tabName) {
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
        if (tabName === 'dashboard') refreshDashboardStats();
        if (tabName === 'employees') renderEmployeeDirectory();
        if (tabName === 'salary') { populateSalaryDropdowns(); renderSalaryHistory(); }
        if (tabName === 'payslips') { populatePayslipDropdowns(); renderPayslipsRegister(); }
        if (tabName === 'reports') renderReports();
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
    function refreshDashboardStats() {
        const m = DB.getMetrics();
        document.getElementById('dashTotalEmployees').textContent = m.totalEmployees;
        document.getElementById('dashActiveEmployees').textContent = m.activeEmployees;
        document.getElementById('dashTotalSalary').textContent = SalaryCalc.formatCurrencyShort(m.totalSalaryProcessed);
        document.getElementById('dashPayslipsGenerated').textContent = m.payslipsGenerated;

        // Render Recent Table (Limit to first 6)
        const employees = DB.getEmployees();
        const tbody = document.querySelector('#tableRecentEmployees tbody');
        tbody.innerHTML = '';

        employees.slice(0, 6).forEach(emp => {
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

        txtSearch.addEventListener('input', () => renderEmployeeDirectory());
        cmbDept.addEventListener('change', () => renderEmployeeDirectory());
        cmbStatus.addEventListener('change', () => renderEmployeeDirectory());

        document.getElementById('btnRefreshEmployees').addEventListener('click', () => {
            txtSearch.value = '';
            cmbDept.value = 'All';
            cmbStatus.value = 'All';
            renderEmployeeDirectory();
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

    function renderEmployeeDirectory() {
        const query = document.getElementById('txtEmpSearch').value.trim().toLowerCase();
        const deptFilter = document.getElementById('cmbEmpDeptFilter').value;
        const statusFilter = document.getElementById('cmbEmpStatusFilter').value;

        let list = DB.getEmployees();

        if (query) {
            list = list.filter(e => 
                e.employeeId.toLowerCase().includes(query) ||
                (e.firstName + ' ' + e.lastName).toLowerCase().includes(query) ||
                e.email.toLowerCase().includes(query) ||
                e.department.toLowerCase().includes(query)
            );
        }

        if (deptFilter !== 'All') {
            list = list.filter(e => e.department.toLowerCase() === deptFilter.toLowerCase());
        }

        if (statusFilter !== 'All') {
            list = list.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
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
        document.getElementById('addEmpId').value = DB.getNextEmployeeId();
        document.getElementById('addEmpJoinDate').value = new Date().toISOString().substring(0, 10);
        openModal('modalAddEmployee');
    }

    function resetAddForm() {
        document.getElementById('formAddEmployee').reset();
        document.getElementById('addEmpId').value = DB.getNextEmployeeId();
        document.getElementById('addEmpDob').value = '1996-05-15';
        document.getElementById('addEmpJoinDate').value = new Date().toISOString().substring(0, 10);
    }

    function saveNewEmployee() {
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
            DB.addEmployee(emp);
            closeModal('modalAddEmployee');
            alert(`Employee ${emp.firstName} ${emp.lastName} (${emp.employeeId}) registered successfully!`);
            renderEmployeeDirectory();
            refreshDashboardStats();
            populateSalaryDropdowns();
            populatePayslipDropdowns();
        } catch (ex) {
            alert('Error: ' + ex.message);
        }
    }

    function openEditEmployeeModal(empId) {
        const emp = DB.getEmployeeById(empId);
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

    function saveEditedEmployee() {
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
            DB.updateEmployee(emp);
            closeModal('modalEditEmployee');
            alert(`Employee ${emp.firstName} ${emp.lastName} updated successfully!`);
            renderEmployeeDirectory();
            refreshDashboardStats();
            populateSalaryDropdowns();
            populatePayslipDropdowns();
        } catch (ex) {
            alert('Error: ' + ex.message);
        }
    }

    function openViewEmployeeModal(empId) {
        const emp = DB.getEmployeeById(empId);
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

    function deleteEmployeeWithConfirm(empId) {
        const emp = DB.getEmployeeById(empId);
        if (!emp) return;

        if (confirm(`Are you sure you want to permanently delete employee:\n${emp.employeeId} - ${emp.firstName} ${emp.lastName}?\n\nThis will also remove their salary and payslip history.`)) {
            DB.deleteEmployee(empId);
            renderEmployeeDirectory();
            refreshDashboardStats();
            populateSalaryDropdowns();
            populatePayslipDropdowns();
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
            const emp = DB.getEmployeeById(selectEmp.value);
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
                const emp = DB.getEmployeeById(selectEmp.value);
                if (emp) basicInput.value = emp.basicSalary;
            }
            calculateSalaryFromInputs();
        });

        formSal.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSalaryRecord();
        });

        document.getElementById('btnExportSalaryHistory').addEventListener('click', () => {
            exportTableToCSV('tableProcessedSalaries', 'Processed_Salary_Records.csv');
        });
    }

    function populateSalaryDropdowns() {
        const selectEmp = document.getElementById('salSelectEmployee');
        const currentVal = selectEmp.value;
        selectEmp.innerHTML = '';

        const list = DB.getEmployees();
        list.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.employeeId;
            opt.textContent = `${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.department})`;
            selectEmp.appendChild(opt);
        });

        if (list.length > 0) {
            selectEmp.value = currentVal && list.some(e => e.employeeId === currentVal) ? currentVal : list[0].employeeId;
            const emp = DB.getEmployeeById(selectEmp.value);
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

    function saveSalaryRecord() {
        const empId = document.getElementById('salSelectEmployee').value;
        const emp = DB.getEmployeeById(empId);
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

        const salId = DB.saveSalary(salary);
        renderSalaryHistory();
        refreshDashboardStats();
        alert(`Salary record for ${emp.firstName} ${emp.lastName} (${salary.salaryMonth} ${salary.salaryYear}) saved successfully!\nNet Pay: ${SalaryCalc.formatCurrency(net)}`);
    }

    function renderSalaryHistory() {
        const salaries = DB.getSalaries();
        const tbody = document.querySelector('#tableProcessedSalaries tbody');
        tbody.innerHTML = '';

        salaries.slice().reverse().forEach(s => {
            const emp = DB.getEmployeeById(s.employeeId);
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
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id, 10);
                if (confirm(`Delete salary transaction record #${id}?`)) {
                    DB.deleteSalary(id);
                    renderSalaryHistory();
                    refreshDashboardStats();
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

        document.getElementById('btnDownloadPayslipText').addEventListener('click', () => {
            if (activePayslipForPreview) {
                const emp = DB.getEmployeeById(activePayslipForPreview.employeeId);
                const sal = DB.getSalaries().find(s => s.salaryId === activePayslipForPreview.salaryId);
                if (sal) {
                    PayslipRenderer.downloadTextSlip(emp, sal);
                }
            }
        });

        document.getElementById('btnExportPayslipsRegister').addEventListener('click', () => {
            exportTableToCSV('tablePayslipsRegister', 'Generated_Payslips_Register.csv');
        });
    }

    function populatePayslipDropdowns() {
        const selectEmp = document.getElementById('slipSelectEmployee');
        const currentVal = selectEmp.value;
        selectEmp.innerHTML = '';

        const list = DB.getEmployees();
        list.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.employeeId;
            opt.textContent = `${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.department})`;
            selectEmp.appendChild(opt);
        });

        if (list.length > 0) {
            selectEmp.value = currentVal && list.some(e => e.employeeId === currentVal) ? currentVal : list[0].employeeId;
        }
    }

    function generatePayslipAction() {
        const empId = document.getElementById('slipSelectEmployee').value;
        const month = document.getElementById('slipSelectMonth').value;
        const year = parseInt(document.getElementById('slipSelectYear').value, 10);

        const emp = DB.getEmployeeById(empId);
        if (!emp) {
            alert('Please select a valid employee.');
            return;
        }

        let salary = DB.getSalaryByEmployeeAndPeriod(empId, month, year);
        if (!salary) {
            if (confirm(`No processed salary found for ${emp.firstName} ${emp.lastName} for ${month} ${year}.\n\nWould you like to auto-calculate and generate a standard salary slip?`)) {
                const basic = emp.basicSalary;
                const hra = Math.round(basic * 0.40);
                const da = Math.round(basic * 0.10);
                const allow = 4000;
                const pf = Math.round(basic * 0.12);
                const pt = 200;
                const gross = basic + hra + da + allow;
                const ded = pf + pt;
                const net = gross - ded;

                const salObj = {
                    employeeId: empId,
                    salaryMonth: month,
                    salaryYear: year,
                    basicSalary: basic,
                    hra, da, allowances: allow, bonus: 0,
                    pf, professionalTax: pt, otherDeductions: 0,
                    grossSalary: gross, totalDeductions: ded, netSalary: net,
                    processedDate: new Date().toISOString().substring(0, 10)
                };
                const salId = DB.saveSalary(salObj);
                salary = DB.getSalaries().find(s => s.salaryId === salId);
            } else {
                return;
            }
        }

        const payslip = DB.getOrCreatePayslip(empId, salary.salaryId);
        renderPayslipsRegister();
        refreshDashboardStats();
        openPayslipPreviewModal(emp, salary, payslip);
    }

    function openPayslipPreviewModal(emp, salary, payslip) {
        activePayslipForPreview = payslip;
        const container = document.getElementById('payslipPreviewContainer');
        container.innerHTML = PayslipRenderer.renderSlipHTML(emp, salary, payslip);
        openModal('modalPayslipPreview');
    }

    function renderPayslipsRegister() {
        const payslips = DB.getPayslips();
        const tbody = document.querySelector('#tablePayslipsRegister tbody');
        tbody.innerHTML = '';

        payslips.slice().reverse().forEach(p => {
            const emp = DB.getEmployeeById(p.employeeId);
            const sal = DB.getSalaries().find(s => s.salaryId === p.salaryId);
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
            btn.addEventListener('click', () => {
                const empId = btn.dataset.emp;
                const salId = parseInt(btn.dataset.sal, 10);
                const psId = parseInt(btn.dataset.ps, 10);
                const emp = DB.getEmployeeById(empId);
                const sal = DB.getSalaries().find(s => s.salaryId === salId);
                const ps = DB.getPayslips().find(p => p.payslipId === psId);
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

        cmbType.addEventListener('change', renderReports);
        txtSearch.addEventListener('input', renderReports);
        document.getElementById('btnRefreshReport').addEventListener('click', () => {
            txtSearch.value = '';
            renderReports();
        });

        document.getElementById('btnExportActiveReportCSV').addEventListener('click', () => {
            const name = cmbType.value + '_Report.csv';
            exportTableToCSV('tableReports', name);
        });
    }

    function renderReports() {
        const type = document.getElementById('cmbReportType').value;
        const search = document.getElementById('txtReportSearch').value.trim().toLowerCase();
        const thead = document.querySelector('#tableReports thead');
        const tbody = document.querySelector('#tableReports tbody');

        thead.innerHTML = '';
        tbody.innerHTML = '';

        let recordsCount = 0;
        let totalPayout = 0;

        if (type === 'employee') {
            thead.innerHTML = `
                <tr>
                    <th>Emp ID</th><th>Employee Name</th><th>Department</th><th>Designation</th>
                    <th>Period</th><th>Basic</th><th>HRA</th><th>DA</th><th>Gross</th><th>Deductions</th><th>Net Salary</th>
                </tr>
            `;
            const salaries = DB.getSalaries();
            salaries.forEach(s => {
                const emp = DB.getEmployeeById(s.employeeId);
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
            const salaries = DB.getSalaries();
            const deptMap = {};

            salaries.forEach(s => {
                const emp = DB.getEmployeeById(s.employeeId);
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
            const salaries = DB.getSalaries();
            const pMap = {};

            salaries.forEach(s => {
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
            const payslips = DB.getPayslips();
            payslips.forEach(p => {
                const emp = DB.getEmployeeById(p.employeeId);
                const sal = DB.getSalaries().find(s => s.salaryId === p.salaryId);
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
        document.getElementById('btnSimulateTestConn').addEventListener('click', () => {
            const statusEl = document.getElementById('schemaEngineStatus');
            statusEl.innerHTML = '&bull; Testing Connection...';
            setTimeout(() => {
                statusEl.innerHTML = '&bull; MySQL Database Active (Port 3306) &bull; Connected';
                statusEl.style.color = 'var(--success-text)';
                alert('Database Connection Verified Successfully!\n\nHost: localhost:3306\nDatabase: employee_salary_management\nStatus: Online (Tables & 3NF Integrity Verified)');
            }, 500);
        });
    }

});
