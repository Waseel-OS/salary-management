/**
 * payslip.js - Formats and Renders Official Corporate Salary Slips
 */

const PayslipRenderer = {
    renderSlipHTML: (employee, salary, payslip) => {
        const empName = employee ? `${employee.firstName} ${employee.lastName}` : (salary.employeeName || salary.employeeId);
        const dept = employee ? employee.department : (salary.department || '-');
        const desig = employee ? employee.designation : (salary.designation || '-');
        const joinDate = employee && employee.joiningDate ? employee.joiningDate : 'N/A';
        const bankAc = employee ? employee.bankAccount : 'N/A';
        const pan = employee ? employee.panNumber : 'N/A';
        const genDate = payslip && payslip.generatedDate ? payslip.generatedDate : new Date().toLocaleDateString('en-IN');

        return `
            <div class="payslip-doc" id="payslipPrintArea">
                <div class="slip-company">
                    <h2>HEALTHFIRST ENTERPRISES PVT. LTD.</h2>
                    <p>Employee Salary & Payslip Management System</p>
                    <div class="slip-period">SALARY PAYSLIP - ${(salary.salaryMonth || '').toUpperCase()} ${salary.salaryYear || ''}</div>
                </div>

                <div class="slip-meta-grid">
                    <div class="slip-meta-row"><span class="slip-meta-label">Employee ID:</span><span class="slip-meta-val">${salary.employeeId}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">Employee Name:</span><span class="slip-meta-val">${empName}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">Department:</span><span class="slip-meta-val">${dept}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">Designation:</span><span class="slip-meta-val">${desig}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">Joining Date:</span><span class="slip-meta-val">${joinDate}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">Bank A/C No:</span><span class="slip-meta-val">${bankAc}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">PAN Number:</span><span class="slip-meta-val">${pan}</span></div>
                    <div class="slip-meta-row"><span class="slip-meta-label">Payment Mode:</span><span class="slip-meta-val">Direct Bank Transfer</span></div>
                </div>

                <div class="slip-finance-grid">
                    <div class="slip-col-box">
                        <div class="slip-col-title earn">EARNINGS</div>
                        <div class="slip-line-item"><span>Basic Salary</span><span>${SalaryCalc.formatCurrency(salary.basicSalary)}</span></div>
                        <div class="slip-line-item"><span>House Rent Allowance (HRA)</span><span>${SalaryCalc.formatCurrency(salary.hra)}</span></div>
                        <div class="slip-line-item"><span>Dearness Allowance (DA)</span><span>${SalaryCalc.formatCurrency(salary.da)}</span></div>
                        <div class="slip-line-item"><span>Special Allowances</span><span>${SalaryCalc.formatCurrency(salary.allowances)}</span></div>
                        <div class="slip-line-item"><span>Performance Bonus</span><span>${SalaryCalc.formatCurrency(salary.bonus)}</span></div>
                        <div class="slip-line-total"><span>GROSS EARNINGS</span><span>${SalaryCalc.formatCurrency(salary.grossSalary)}</span></div>
                    </div>

                    <div class="slip-col-box">
                        <div class="slip-col-title ded">DEDUCTIONS</div>
                        <div class="slip-line-item"><span>Provident Fund (PF)</span><span>${SalaryCalc.formatCurrency(salary.pf)}</span></div>
                        <div class="slip-line-item"><span>Professional Tax (PT)</span><span>${SalaryCalc.formatCurrency(salary.professionalTax)}</span></div>
                        <div class="slip-line-item"><span>Other Deductions</span><span>${SalaryCalc.formatCurrency(salary.otherDeductions)}</span></div>
                        <div style="height: 48px;"></div>
                        <div class="slip-line-total"><span>TOTAL DEDUCTIONS</span><span>${SalaryCalc.formatCurrency(salary.totalDeductions)}</span></div>
                    </div>
                </div>

                <div class="slip-net-banner">
                    <div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--primary-navy);">NET SALARY PAYABLE:</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${SalaryCalc.convertToWords(salary.netSalary)}</div>
                    </div>
                    <div class="slip-net-amount">${SalaryCalc.formatCurrency(salary.netSalary)}</div>
                </div>

                <div class="slip-footer">
                    <div>
                        <div><strong>Generated On:</strong> ${genDate}</div>
                        <div><strong>Status:</strong> Verified & Approved</div>
                        <div style="margin-top: 4px; font-style: italic;">Note: Computer generated slip, no physical signature required.</div>
                    </div>
                    <div class="slip-signatory">
                        <div class="line"></div>
                        <div style="font-weight: 700; color: var(--primary-navy);">Authorized Signatory</div>
                    </div>
                </div>
            </div>
        `;
    },

    downloadTextSlip: (employee, salary) => {
        const empName = employee ? `${employee.firstName} ${employee.lastName}` : salary.employeeId;
        const text = `
=================================================================
                 HEALTHFIRST ENTERPRISES PVT. LTD.              
         Employee Salary & Payslip Management System            
=================================================================
SALARY SLIP FOR: ${salary.salaryMonth} ${salary.salaryYear}

Employee ID     : ${salary.employeeId}
Employee Name   : ${empName}
Department      : ${employee ? employee.department : '-'}
Designation     : ${employee ? employee.designation : '-'}
Bank Account    : ${employee ? employee.bankAccount : 'N/A'}
PAN Number      : ${employee ? employee.panNumber : 'N/A'}
-----------------------------------------------------------------
EARNINGS                                | DEDUCTIONS
-----------------------------------------------------------------
Basic Salary        : ${salary.basicSalary} | Provident Fund (PF)  : ${salary.pf}
HRA                 : ${salary.hra} | Professional Tax     : ${salary.professionalTax}
DA                  : ${salary.da} | Other Deductions     : ${salary.otherDeductions}
Special Allowances  : ${salary.allowances} |
Performance Bonus   : ${salary.bonus} |
-----------------------------------------------------------------
GROSS SALARY        : ${salary.grossSalary} | TOTAL DEDUCTIONS     : ${salary.totalDeductions}
=================================================================
NET SALARY PAYABLE  : ${SalaryCalc.formatCurrency(salary.netSalary)}
IN WORDS            : ${SalaryCalc.convertToWords(salary.netSalary)}
=================================================================
`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Payslip_${salary.employeeId}_${salary.salaryMonth}_${salary.salaryYear}.txt`;
        a.click();
    }
};
