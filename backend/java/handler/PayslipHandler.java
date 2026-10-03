package com.salarymanagement.handler;

import com.salarymanagement.data_retriever.EmployeeDB;
import com.salarymanagement.data_retriever.PayslipDB;
import com.salarymanagement.data_retriever.SalaryDB;
import com.salarymanagement.model.Employee;
import com.salarymanagement.model.Payslip;
import com.salarymanagement.model.Salary;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PayslipHandler extends BaseHandler {

    private final PayslipDB payslipDB = new PayslipDB();
    private final SalaryDB salaryDB = new SalaryDB();
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
        String path = uri.getPath(); // /api/payslips or /api/payslips/generate

        try {
            if ("GET".equals(method)) {
                List<Payslip> list = payslipDB.getAllPayslips();
                sendJsonResponse(exchange, 200, list);
            } else if ("POST".equals(method)) {
                if (path.endsWith("/generate") || path.endsWith("/generate/")) {
                    try (InputStream is = exchange.getRequestBody()) {
                        Map<String, Object> req = objectMapper.readValue(is, Map.class);
                        String empId = (String) req.get("employeeId");
                        String month = (String) req.get("month");
                        int year = ((Number) req.get("year")).intValue();

                        Employee emp = employeeDB.getEmployeeById(empId);
                        if (emp == null) {
                            Map<String, String> err = new HashMap<>();
                            err.put("error", "Employee not found");
                            sendJsonResponse(exchange, 404, err);
                            return;
                        }

                        Salary sal = salaryDB.getSalaryByEmployeeAndPeriod(empId, month, year);
                        if (sal == null) {
                            // Auto calculate basic salary if not existing
                            BigDecimal basic = emp.getBasicSalary();
                            BigDecimal hra = basic.multiply(new BigDecimal("0.40"));
                            BigDecimal da = basic.multiply(new BigDecimal("0.10"));
                            BigDecimal allow = new BigDecimal("4000");
                            BigDecimal pf = basic.multiply(new BigDecimal("0.12"));
                            BigDecimal pt = new BigDecimal("200");

                            BigDecimal gross = basic.add(hra).add(da).add(allow);
                            BigDecimal ded = pf.add(pt);
                            BigDecimal net = gross.subtract(ded);

                            sal = new Salary();
                            sal.setEmployeeId(empId);
                            sal.setSalaryMonth(month);
                            sal.setSalaryYear(year);
                            sal.setBasicSalary(basic);
                            sal.setHra(hra);
                            sal.setDa(da);
                            sal.setAllowances(allow);
                            sal.setBonus(BigDecimal.ZERO);
                            sal.setPf(pf);
                            sal.setProfessionalTax(pt);
                            sal.setOtherDeductions(BigDecimal.ZERO);
                            sal.setGrossSalary(gross);
                            sal.setTotalDeductions(ded);
                            sal.setNetSalary(net);
                            sal.setProcessedDate(LocalDate.now());

                            int salId = salaryDB.saveOrUpdateSalary(sal);
                            sal.setSalaryId(salId);
                        }

                        Payslip slip = payslipDB.getOrCreatePayslip(empId, sal.getSalaryId());
                        sendJsonResponse(exchange, 200, slip);
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
