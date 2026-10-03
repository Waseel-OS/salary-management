package com.salarymanagement.data_retriever;

import com.salarymanagement.config.DatabaseConfig;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class AdminDB {

    public boolean authenticate(String username, String password) throws SQLException {
        String sql = "SELECT * FROM admin_users WHERE username = ? AND password = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.setString(2, password);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public Map<String, Object> getMetrics() throws SQLException {
        Map<String, Object> metrics = new HashMap<>();

        try (Connection conn = DatabaseConfig.getConnection()) {
            // Total Employees
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM employees");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) metrics.put("totalEmployees", rs.getInt(1));
            }

            // Active Employees
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM employees WHERE status = 'Active'");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) metrics.put("activeEmployees", rs.getInt(1));
            }

            // Total Salary Processed
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COALESCE(SUM(net_salary), 0) FROM salaries");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) metrics.put("totalSalaryProcessed", rs.getBigDecimal(1));
            }

            // Payslips Generated
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM payslips");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) metrics.put("payslipsGenerated", rs.getInt(1));
            }
        }

        return metrics;
    }
}
