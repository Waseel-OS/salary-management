package com.salarymanagement;

import com.salarymanagement.config.DatabaseConfig;
import com.salarymanagement.handler.*;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;

public class App {

    public static void main(String[] args) {
        int port = DatabaseConfig.getServerPort();

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // Register API endpoints
            server.createContext("/api/auth/login", new AuthHandler());
            server.createContext("/api/employees", new EmployeeHandler());
            server.createContext("/api/salaries", new SalaryHandler());
            server.createContext("/api/payslips", new PayslipHandler());
            server.createContext("/api/dashboard/metrics", new DashboardHandler());

            // Serve frontend static files (HTML, CSS, JS, etc.) from parent workspace root
            File webRoot = new File("..").getCanonicalFile();
            if (!new File(webRoot, "index.html").exists()) {
                webRoot = new File(".").getCanonicalFile();
            }
            server.createContext("/", new StaticFileHandler(webRoot.getAbsolutePath()));

            server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(10));
            server.start();

            System.out.println("=========================================================");
            System.out.println("  Salary & Payslip Management System (Java Web Server)");
            System.out.println("=========================================================");
            System.out.println("  Access Web Application: http://localhost:" + port);
            System.out.println("  Web Root Directory:    " + webRoot.getAbsolutePath());
            System.out.println("  API Endpoints Registered:");
            System.out.println("    - POST   /api/auth/login");
            System.out.println("    - GET/POST/PUT/DELETE /api/employees");
            System.out.println("    - GET/POST/DELETE     /api/salaries");
            System.out.println("    - GET/POST            /api/payslips");
            System.out.println("    - GET                 /api/dashboard/metrics");
            System.out.println("=========================================================");
        } catch (IOException e) {
            System.err.println("Failed to start Java HTTP Web Server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
