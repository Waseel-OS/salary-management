/**
 * salaryCalc.js - Salary Formulas, Indian Currency Formatter & Number-to-Words Converter
 */

const SalaryCalc = {
    calculateGross: (basic, hra, da, allowances, bonus) => {
        return Math.max(0, (parseFloat(basic) || 0) + (parseFloat(hra) || 0) + (parseFloat(da) || 0) + (parseFloat(allowances) || 0) + (parseFloat(bonus) || 0));
    },

    calculateDeductions: (pf, pt, other) => {
        return Math.max(0, (parseFloat(pf) || 0) + (parseFloat(pt) || 0) + (parseFloat(other) || 0));
    },

    calculateNet: (gross, deductions) => {
        return Math.max(0, gross - deductions);
    },

    formatCurrency: (amount) => {
        const val = parseFloat(amount) || 0;
        return '₹ ' + val.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatCurrencyShort: (amount) => {
        const val = Math.round(parseFloat(amount) || 0);
        return '₹ ' + val.toLocaleString('en-IN');
    },

    convertToWords: (amount) => {
        let n = Math.floor(parseFloat(amount) || 0);
        if (n === 0) return 'Rupees Zero Only';

        const units = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function helper(num) {
            if (num < 20) return units[num];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
            if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + helper(num % 100) : '');
            if (num < 100000) return helper(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + helper(num % 1000) : '');
            if (num < 10000000) return helper(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + helper(num % 100000) : '');
            return helper(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + helper(num % 10000000) : '');
        }

        return 'Rupees ' + helper(n).trim() + ' Only';
    }
};
