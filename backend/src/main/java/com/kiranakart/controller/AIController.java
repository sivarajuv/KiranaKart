package com.kiranakart.controller;

import com.kiranakart.service.ClaudeAIService;
import com.kiranakart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired private ClaudeAIService claudeAIService;
    @Autowired private OrderService orderService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        Map<String, Object> stats = orderService.getDashboardStats();
        String shopContext = String.format(
            "Total orders: %s, Today's orders: %s, Total revenue: ₹%s, Today's revenue: ₹%s",
            stats.get("totalOrders"), stats.get("todayOrders"),
            stats.get("totalRevenue"), stats.get("todayRevenue")
        );

        String response = claudeAIService.getChatResponse(userMessage, shopContext);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
