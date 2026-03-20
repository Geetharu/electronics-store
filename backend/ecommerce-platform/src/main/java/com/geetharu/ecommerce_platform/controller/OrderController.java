package com.geetharu.ecommerce_platform.controller;

import com.geetharu.ecommerce_platform.entity.Order;
import com.geetharu.ecommerce_platform.entity.User;
import com.geetharu.ecommerce_platform.repository.OrderRepository;
import com.geetharu.ecommerce_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // 👤 NORMAL USER: Get my own orders
    @GetMapping
    public ResponseEntity<?> getUserOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username).orElse(null);

        if (user != null) {
            List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
            return ResponseEntity.ok(orders);
        }

        return ResponseEntity.status(401).body("Unauthorized: User not found");
    }

    // 👑 ADMIN ONLY: Get every order in the store
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        // Security Check: Are they an Admin?
        if (user != null && "ROLE_ADMIN".equals(user.getRole())) {
            List<Order> allOrders = orderRepository.findAllByOrderByOrderDateDesc();
            return ResponseEntity.ok(allOrders);
        }

        return ResponseEntity.status(403).body("Forbidden: Admins only");
    }

    // 👑 ADMIN ONLY: Update the shipping status of an order
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user != null && "ROLE_ADMIN".equals(user.getRole())) {
            Order order = orderRepository.findById(id).orElse(null);

            if (order != null) {
                String newStatus = body.get("status");
                order.setStatus(newStatus);

                // Stamp the exact time the admin changed the status!
                if ("SHIPPED".equals(newStatus)) {
                    if (order.getShippedAt() == null) {
                        order.setShippedAt(java.time.LocalDateTime.now());
                    }
                    // 🚀 NEW: Save the FedEx/UPS details sent by the Admin!
                    order.setShippingCarrier(body.get("carrier"));
                    order.setShippingTrackingNumber(body.get("trackingNumber"));

                } else if ("DELIVERED".equals(newStatus) && order.getDeliveredAt() == null) {
                    order.setDeliveredAt(java.time.LocalDateTime.now());
                } else if ("CANCELLED".equals(newStatus) && order.getCancelledAt() == null) {
                    order.setCancelledAt(java.time.LocalDateTime.now());
                }

                orderRepository.save(order);
                return ResponseEntity.ok(order);
            }
            return ResponseEntity.status(404).body("Order not found");
        }

        return ResponseEntity.status(403).body("Forbidden: Admins only");
    }
}