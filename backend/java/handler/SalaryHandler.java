package com.salarymanagement.handler;

import com.salarymanagement.data_retriever.SalaryDB;
import com.salarymanagement.model.Salary;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SalaryHandler extends BaseHandler {

    private final SalaryDB salaryDB = new SalaryDB();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        handleCors(exchange);

        String method = exchange.getRequestMethod().toUpperCase();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            sendEmptyResponse(exchange, 204);
            return;
        }

        URI uri = exchange.getRequestURI();
        String path = uri.getPath(); // /api/salaries or /api/salaries/{id}
        String[] parts = path.split("/");

        try {
            if ("GET".equals(method)) {
                if (parts.length == 4 && !parts[3].isEmpty()) {
                    int salId = Integer.parseInt(parts[3]);
                    Salary sal = salaryDB.getSalaryById(salId);
                    if (sal != null) {
                        sendJsonResponse(exchange, 200, sal);
                    } else {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", "Salary record not found");
                        sendJsonResponse(exchange, 404, err);
                    }
                } else {
                    List<Salary> list = salaryDB.getAllSalaries();
                    sendJsonResponse(exchange, 200, list);
                }
            } else if ("POST".equals(method)) {
                try (InputStream is = exchange.getRequestBody()) {
                    Salary salary = objectMapper.readValue(is, Salary.class);
                    int salId = salaryDB.saveOrUpdateSalary(salary);
                    salary.setSalaryId(salId);
                    sendJsonResponse(exchange, 200, salary);
                }
            } else if ("DELETE".equals(method)) {
                if (parts.length == 4 && !parts[3].isEmpty()) {
                    int salId = Integer.parseInt(parts[3]);
                    if (salaryDB.deleteSalary(salId)) {
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("success", true);
                        resp.put("message", "Salary deleted");
                        sendJsonResponse(exchange, 200, resp);
                    } else {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", "Salary record not found");
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
