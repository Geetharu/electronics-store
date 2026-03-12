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

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserOrders() {
        // 1. Find out exactly who is making the request using their secure token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username).orElse(null);

        if (user != null) {
            // 2. Fetch their specific orders, sorted newest to oldest
            List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
            return ResponseEntity.ok(orders);
        }

        return ResponseEntity.status(401).body("Unauthorized: User not found");
    }
}