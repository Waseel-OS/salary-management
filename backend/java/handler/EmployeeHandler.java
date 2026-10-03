package com.salarymanagement.handler;

import com.salarymanagement.data_retriever.EmployeeDB;
import com.salarymanagement.model.Employee;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EmployeeHandler extends BaseHandler {

    private final EmployeeDB employeeDB = new EmployeeDB();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        handleCors(exchange);

        String method = exchange.getRequestMethod().toUpperCase();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            sendEmptyResponse(exchange, 204);
            return;
        }

        URI uri = exchange.getRequestURI();
        String path = uri.getPath(); // e.g. /api/employees or /api/employees/EMP001
        String[] parts = path.split("/");

        try {
            if ("GET".equals(method)) {
                if (parts.length == 4 && !parts[3].isEmpty()) {
                    // GET /api/employees/{id}
                    String empId = parts[3];
                    Employee emp = employeeDB.getEmployeeById(empId);
                    if (emp != null) {
                        sendJsonResponse(exchange, 200, emp);
                    } else {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", "Employee not found");
                        sendJsonResponse(exchange, 404, err);
                    }
                } else {
                    // GET /api/employees
                    List<Employee> list = employeeDB.getAllEmployees();
                    sendJsonResponse(exchange, 200, list);
                }
            } else if ("POST".equals(method)) {
                // POST /api/employees
                try (InputStream is = exchange.getRequestBody()) {
                    Employee emp = objectMapper.readValue(is, Employee.class);
                    if (employeeDB.addEmployee(emp)) {
                        sendJsonResponse(exchange, 201, emp);
                    } else {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", "Failed to create employee");
                        sendJsonResponse(exchange, 400, err);
                    }
                }
            } else if ("PUT".equals(method)) {
                // PUT /api/employees/{id} or PUT /api/employees
                try (InputStream is = exchange.getRequestBody()) {
                    Employee emp = objectMapper.readValue(is, Employee.class);
                    if (parts.length == 4 && !parts[3].isEmpty()) {
                        emp.setEmployeeId(parts[3]);
                    }
                    if (employeeDB.updateEmployee(emp)) {
                        sendJsonResponse(exchange, 200, emp);
                    } else {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", "Failed to update employee");
                        sendJsonResponse(exchange, 400, err);
                    }
                }
            } else if ("DELETE".equals(method)) {
                // DELETE /api/employees/{id}
                if (parts.length == 4 && !parts[3].isEmpty()) {
                    String empId = parts[3];
                    if (employeeDB.deleteEmployee(empId)) {
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("success", true);
                        resp.put("message", "Employee deleted");
                        sendJsonResponse(exchange, 200, resp);
                    } else {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", "Employee not found or could not be deleted");
                        sendJsonResponse(exchange, 404, err);
                    }
                } else {
                    sendEmptyResponse(exchange, 400);
                }
            } else {
                sendEmptyResponse(exchange, 405);
            }
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            sendJsonResponse(exchange, 500, err);
        }
    }
}
