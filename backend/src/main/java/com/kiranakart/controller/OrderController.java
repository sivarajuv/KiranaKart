package com.kiranakart.controller;

import com.kiranakart.model.Order;
import com.kiranakart.service.ClaudeAIService;
import com.kiranakart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired private OrderService orderService;
    @Autowired private ClaudeAIService claudeAIService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderService.CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/today")
    public List<Order> getTodaysOrders() {
        return orderService.getTodaysOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboard/stats")
    public Map<String, Object> getDashboardStats() {
        return orderService.getDashboardStats();
    }

    @GetMapping("/reports/top-products")
    public List<Map<String, Object>> getTopProducts() {
        return orderService.getTopSellingProducts();
    }

    @GetMapping("/reports/by-category")
    public List<Map<String, Object>> getSalesByCategory() {
        return orderService.getSalesByCategory();
    }

    @GetMapping("/reports/daily-revenue")
    public List<Map<String, Object>> getDailyRevenue() {
        return orderService.getDailyRevenue();
    }

    @GetMapping("/reports/ai-insights")
    public ResponseEntity<Map<String, String>> getAIInsights() {
        List<Map<String, Object>> salesData = orderService.getTopSellingProducts();
        String insights = claudeAIService.getInventoryInsight(salesData);
        return ResponseEntity.ok(Map.of("insights", insights));
    }
}
