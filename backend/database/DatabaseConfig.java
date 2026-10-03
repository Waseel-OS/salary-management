package com.salarymanagement.config;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseConfig {

    private static final Properties properties = new Properties();

    static {
        try (InputStream input = DatabaseConfig.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input != null) {
                properties.load(input);
            } else {
                // Fallback default properties
                properties.setProperty("db.url", "jdbc:mysql://localhost:3306/app_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
                properties.setProperty("db.username", "root");
                properties.setProperty("db.password", "root");
                properties.setProperty("server.port", "8080");
            }
            // Register JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (Exception e) {
            System.err.println("Warning/Error loading db.properties: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                properties.getProperty("db.url"),
                properties.getProperty("db.username"),
                properties.getProperty("db.password")
        );
    }

    public static int getServerPort() {
        try {
            return Integer.parseInt(properties.getProperty("server.port", "8080"));
        } catch (NumberFormatException e) {
            return 8080;
        }
    }
}
