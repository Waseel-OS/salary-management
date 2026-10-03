package com.salarymanagement.data_retriever;

import com.salarymanagement.config.DatabaseConfig;
import com.salarymanagement.model.Employee;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmployeeDB {

    public List<Employee> getAllEmployees() throws SQLException {
        List<Employee> list = new ArrayList<>();
        String sql = "SELECT * FROM employees ORDER BY employee_id";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSetToEmployee(rs));
            }
        }
        return list;
    }

    public Employee getEmployeeById(String employeeId) throws SQLException {
        String sql = "SELECT * FROM employees WHERE employee_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, employeeId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEmployee(rs);
                }
            }
        }
        return null;
    }

    public boolean addEmployee(Employee emp) throws SQLException {
        String sql = "INSERT INTO employees (employee_id, first_name, last_name, gender, dob, email, phone, department, designation, joining_date, basic_salary, bank_account, pan_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, emp.getEmployeeId());
            stmt.setString(2, emp.getFirstName());
            stmt.setString(3, emp.getLastName());
            stmt.setString(4, emp.getGender());
            stmt.setDate(5, Date.valueOf(emp.getDob()));
            stmt.setString(6, emp.getEmail());
            stmt.setString(7, emp.getPhone());
            stmt.setString(8, emp.getDepartment());
            stmt.setString(9, emp.getDesignation());
            stmt.setDate(10, Date.valueOf(emp.getJoiningDate()));
            stmt.setBigDecimal(11, emp.getBasicSalary());
            stmt.setString(12, emp.getBankAccount());
            stmt.setString(13, emp.getPanNumber());
            stmt.setString(14, emp.getStatus() != null ? emp.getStatus() : "Active");
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean updateEmployee(Employee emp) throws SQLException {
        String sql = "UPDATE employees SET first_name=?, last_name=?, gender=?, dob=?, email=?, phone=?, department=?, designation=?, joining_date=?, basic_salary=?, bank_account=?, pan_number=?, status=? WHERE employee_id=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, emp.getFirstName());
            stmt.setString(2, emp.getLastName());
            stmt.setString(3, emp.getGender());
            stmt.setDate(4, Date.valueOf(emp.getDob()));
            stmt.setString(5, emp.getEmail());
            stmt.setString(6, emp.getPhone());
            stmt.setString(7, emp.getDepartment());
            stmt.setString(8, emp.getDesignation());
            stmt.setDate(9, Date.valueOf(emp.getJoiningDate()));
            stmt.setBigDecimal(10, emp.getBasicSalary());
            stmt.setString(11, emp.getBankAccount());
            stmt.setString(12, emp.getPanNumber());
            stmt.setString(13, emp.getStatus());
            stmt.setString(14, emp.getEmployeeId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteEmployee(String employeeId) throws SQLException {
        String sql = "DELETE FROM employees WHERE employee_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, employeeId);
            return stmt.executeUpdate() > 0;
        }
    }

    private Employee mapResultSetToEmployee(ResultSet rs) throws SQLException {
        Employee emp = new Employee();
        emp.setEmployeeId(rs.getString("employee_id"));
        emp.setFirstName(rs.getString("first_name"));
        emp.setLastName(rs.getString("last_name"));
        emp.setGender(rs.getString("gender"));
        Date dob = rs.getDate("dob");
        if (dob != null) emp.setDob(dob.toLocalDate());
        emp.setEmail(rs.getString("email"));
        emp.setPhone(rs.getString("phone"));
        emp.setDepartment(rs.getString("department"));
        emp.setDesignation(rs.getString("designation"));
        Date joiningDate = rs.getDate("joining_date");
        if (joiningDate != null) emp.setJoiningDate(joiningDate.toLocalDate());
        emp.setBasicSalary(rs.getBigDecimal("basic_salary"));
        emp.setBankAccount(rs.getString("bank_account"));
        emp.setPanNumber(rs.getString("pan_number"));
        emp.setStatus(rs.getString("status"));
        return emp;
    }
}
