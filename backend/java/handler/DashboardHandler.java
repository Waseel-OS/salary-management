package handler;

import data_retriever.AdminDB;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DashboardHandler extends BaseHandler {

    private final AdminDB adminDB = new AdminDB();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        handleCors(exchange);

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendEmptyResponse(exchange, 204);
            return;
        }

        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                Map<String, Object> metrics = adminDB.getMetrics();
                sendJsonResponse(exchange, 200, metrics);
            } catch (Exception e) {
                Map<String, String> err = new HashMap<>();
                err.put("error", e.getMessage());
                sendJsonResponse(exchange, 500, err);
            }
        } else {
            sendEmptyResponse(exchange, 405);
        }
    }
}
