package com.salarymanagement.handler;

import com.salarymanagement.data_retriever.AdminDB;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class AuthHandler extends BaseHandler {

    private final AdminDB adminDB = new AdminDB();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        handleCors(exchange);

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendEmptyResponse(exchange, 204);
            return;
        }

        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            try (InputStream is = exchange.getRequestBody()) {
                Map<String, String> body = objectMapper.readValue(is, Map.class);
                String username = body.get("username");
                String password = body.get("password");

                if (username != null && password != null && adminDB.authenticate(username, password)) {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("success", true);
                    resp.put("username", username);
                    resp.put("fullName", "System Administrator");
                    sendJsonResponse(exchange, 200, resp);
                } else {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("success", false);
                    resp.put("message", "Invalid Username or Password.");
                    sendJsonResponse(exchange, 401, resp);
                }
            } catch (Exception e) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("error", e.getMessage());
                sendJsonResponse(exchange, 500, resp);
            }
        } else {
            sendEmptyResponse(exchange, 405);
        }
    }
}
