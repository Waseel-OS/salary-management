package data_retriever;

import com.salarymanagement.config.DatabaseConfig;
import model.Payslip;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PayslipDB {

    public List<Payslip> getAllPayslips() throws SQLException {
        List<Payslip> list = new ArrayList<>();
        String sql = "SELECT * FROM payslips ORDER BY payslip_id DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSetToPayslip(rs));
            }
        }
        return list;
    }

    public Payslip getPayslipByEmployeeAndSalary(String employeeId, int salaryId) throws SQLException {
        String sql = "SELECT * FROM payslips WHERE employee_id = ? AND salary_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, employeeId);
            stmt.setInt(2, salaryId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToPayslip(rs);
                }
            }
        }
        return null;
    }

    public Payslip getOrCreatePayslip(String employeeId, int salaryId) throws SQLException {
        Payslip existing = getPayslipByEmployeeAndSalary(employeeId, salaryId);
        if (existing != null) {
            return existing;
        }

        String sql = "INSERT INTO payslips (employee_id, salary_id, generated_date, status) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            stmt.setString(1, employeeId);
            stmt.setInt(2, salaryId);
            stmt.setTimestamp(3, now);
            stmt.setString(4, "Generated");
            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    Payslip p = new Payslip();
                    p.setPayslipId(keys.getInt(1));
                    p.setEmployeeId(employeeId);
                    p.setSalaryId(salaryId);
                    p.setGeneratedDate(now.toLocalDateTime());
                    p.setStatus("Generated");
                    return p;
                }
            }
        }
        return null;
    }

    private Payslip mapResultSetToPayslip(ResultSet rs) throws SQLException {
        Payslip p = new Payslip();
        p.setPayslipId(rs.getInt("payslip_id"));
        p.setEmployeeId(rs.getString("employee_id"));
        p.setSalaryId(rs.getInt("salary_id"));
        Timestamp ts = rs.getTimestamp("generated_date");
        if (ts != null) p.setGeneratedDate(ts.toLocalDateTime());
        p.setStatus(rs.getString("status"));
        return p;
    }
}
