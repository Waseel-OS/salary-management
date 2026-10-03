package data_retriever;

import config.DatabaseConfig;
import model.Salary;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SalaryDB {

    public List<Salary> getAllSalaries() throws SQLException {
        List<Salary> list = new ArrayList<>();
        String sql = "SELECT * FROM salaries ORDER BY salary_id DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSetToSalary(rs));
            }
        }
        return list;
    }

    public Salary getSalaryByEmployeeAndPeriod(String employeeId, String month, int year) throws SQLException {
        String sql = "SELECT * FROM salaries WHERE employee_id = ? AND LOWER(salary_month) = LOWER(?) AND salary_year = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, employeeId);
            stmt.setString(2, month);
            stmt.setInt(3, year);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToSalary(rs);
                }
            }
        }
        return null;
    }

    public Salary getSalaryById(int salaryId) throws SQLException {
        String sql = "SELECT * FROM salaries WHERE salary_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, salaryId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToSalary(rs);
                }
            }
        }
        return null;
    }

    public int saveOrUpdateSalary(Salary salary) throws SQLException {
        Salary existing = getSalaryByEmployeeAndPeriod(salary.getEmployeeId(), salary.getSalaryMonth(), salary.getSalaryYear());
        if (existing != null) {
            String sql = "UPDATE salaries SET basic_salary=?, hra=?, da=?, allowances=?, bonus=?, pf=?, professional_tax=?, other_deductions=?, gross_salary=?, total_deductions=?, net_salary=?, processed_date=? WHERE salary_id=?";
            try (Connection conn = DatabaseConfig.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setBigDecimal(1, salary.getBasicSalary());
                stmt.setBigDecimal(2, salary.getHra());
                stmt.setBigDecimal(3, salary.getDa());
                stmt.setBigDecimal(4, salary.getAllowances());
                stmt.setBigDecimal(5, salary.getBonus());
                stmt.setBigDecimal(6, salary.getPf());
                stmt.setBigDecimal(7, salary.getProfessionalTax());
                stmt.setBigDecimal(8, salary.getOtherDeductions());
                stmt.setBigDecimal(9, salary.getGrossSalary());
                stmt.setBigDecimal(10, salary.getTotalDeductions());
                stmt.setBigDecimal(11, salary.getNetSalary());
                stmt.setDate(12, Date.valueOf(salary.getProcessedDate()));
                stmt.setInt(13, existing.getSalaryId());
                stmt.executeUpdate();
                return existing.getSalaryId();
            }
        } else {
            String sql = "INSERT INTO salaries (employee_id, salary_month, salary_year, basic_salary, hra, da, allowances, bonus, pf, professional_tax, other_deductions, gross_salary, total_deductions, net_salary, processed_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (Connection conn = DatabaseConfig.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setString(1, salary.getEmployeeId());
                stmt.setString(2, salary.getSalaryMonth());
                stmt.setInt(3, salary.getSalaryYear());
                stmt.setBigDecimal(4, salary.getBasicSalary());
                stmt.setBigDecimal(5, salary.getHra());
                stmt.setBigDecimal(6, salary.getDa());
                stmt.setBigDecimal(7, salary.getAllowances());
                stmt.setBigDecimal(8, salary.getBonus());
                stmt.setBigDecimal(9, salary.getPf());
                stmt.setBigDecimal(10, salary.getProfessionalTax());
                stmt.setBigDecimal(11, salary.getOtherDeductions());
                stmt.setBigDecimal(12, salary.getGrossSalary());
                stmt.setBigDecimal(13, salary.getTotalDeductions());
                stmt.setBigDecimal(14, salary.getNetSalary());
                stmt.setDate(15, Date.valueOf(salary.getProcessedDate()));
                stmt.executeUpdate();
                try (ResultSet keys = stmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        return keys.getInt(1);
                    }
                }
            }
        }
        return -1;
    }

    public boolean deleteSalary(int salaryId) throws SQLException {
        String sql = "DELETE FROM salaries WHERE salary_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, salaryId);
            return stmt.executeUpdate() > 0;
        }
    }

    private Salary mapResultSetToSalary(ResultSet rs) throws SQLException {
        Salary s = new Salary();
        s.setSalaryId(rs.getInt("salary_id"));
        s.setEmployeeId(rs.getString("employee_id"));
        s.setSalaryMonth(rs.getString("salary_month"));
        s.setSalaryYear(rs.getInt("salary_year"));
        s.setBasicSalary(rs.getBigDecimal("basic_salary"));
        s.setHra(rs.getBigDecimal("hra"));
        s.setDa(rs.getBigDecimal("da"));
        s.setAllowances(rs.getBigDecimal("allowances"));
        s.setBonus(rs.getBigDecimal("bonus"));
        s.setPf(rs.getBigDecimal("pf"));
        s.setProfessionalTax(rs.getBigDecimal("professional_tax"));
        s.setOtherDeductions(rs.getBigDecimal("other_deductions"));
        s.setGrossSalary(rs.getBigDecimal("gross_salary"));
        s.setTotalDeductions(rs.getBigDecimal("total_deductions"));
        s.setNetSalary(rs.getBigDecimal("net_salary"));
        Date processedDate = rs.getDate("processed_date");
        if (processedDate != null) s.setProcessedDate(processedDate.toLocalDate());
        return s;
    }
}
