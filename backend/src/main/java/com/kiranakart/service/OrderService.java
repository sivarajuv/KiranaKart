package com.kiranakart.service;

import com.kiranakart.model.*;
import com.kiranakart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private ProductRepository productRepository;

    public record CreateOrderRequest(
        String customerName,
        String customerPhone,
        Order.PaymentMethod paymentMethod,
        String upiTransactionId,
        String cardLast4,
        String cardType,
        List<CartItem> items
    ) {}

    public record CartItem(Long productId, Integer quantity) {}

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setOrderNumber("ORD-" + System.currentTimeMillis());
        order.setCustomerName(request.customerName());
        order.setCustomerPhone(request.customerPhone());
        order.setPaymentMethod(request.paymentMethod());
        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setUpiTransactionId(request.upiTransactionId());
        order.setCardLast4(request.cardLast4());
        order.setCardType(request.cardType());

        Order savedOrder = orderRepository.save(order);
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : request.items()) {
            Product product = productRepository.findById(cartItem.productId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.productId()));

            if (product.getStock() < cartItem.quantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);
            item.setProduct(product);
            item.setQuantity(cartItem.quantity());
            item.setUnitPrice(product.getPrice());
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.quantity()));
            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            product.setStock(product.getStock() - cartItem.quantity());
            productRepository.save(product);
            orderItems.add(orderItemRepository.save(item));
        }

        savedOrder.setTotalAmount(total);
        savedOrder.setItems(orderItems);
        return orderRepository.save(savedOrder);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getTodaysOrders() {
        return orderRepository.findTodaysOrders();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Map<String, Object> getDashboardStats() {
        List<Order> allOrders = orderRepository.findCompletedOrders();
        List<Order> todaysOrders = orderRepository.findTodaysOrders();

        BigDecimal totalRevenue = allOrders.stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal todayRevenue = todaysOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> paymentMethodCount = new HashMap<>();
        for (Order order : allOrders) {
            String method = order.getPaymentMethod().name();
            paymentMethodCount.merge(method, 1L, Long::sum);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", allOrders.size());
        stats.put("todayOrders", todaysOrders.size());
        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", todayRevenue);
        stats.put("paymentMethodStats", paymentMethodCount);

        return stats;
    }

    public List<Map<String, Object>> getTopSellingProducts() {
        List<Object[]> results = orderItemRepository.findTopSellingProducts();
        List<Map<String, Object>> topProducts = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("productId", row[0]);
            item.put("productName", row[1]);
            item.put("category", row[2]);
            item.put("totalQuantity", row[3]);
            item.put("totalRevenue", row[4]);
            topProducts.add(item);
        }
        return topProducts;
    }

    public List<Map<String, Object>> getSalesByCategory() {
        List<Object[]> results = orderItemRepository.findSalesByCategory();
        List<Map<String, Object>> categoryStats = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", row[0]);
            item.put("totalQuantity", row[1]);
            item.put("totalRevenue", row[2]);
            categoryStats.add(item);
        }
        return categoryStats;
    }

    public List<Map<String, Object>> getDailyRevenue() {
        List<Order> orders = orderRepository.findCompletedOrders();
        Map<String, BigDecimal> dailyMap = new LinkedHashMap<>();
        for (Order order : orders) {
            String date = order.getCreatedAt().toLocalDate().toString();
            dailyMap.merge(date, order.getTotalAmount(), BigDecimal::add);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        dailyMap.forEach((date, revenue) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("date", date);
            item.put("revenue", revenue);
            result.add(item);
        });
        return result;
    }
}
