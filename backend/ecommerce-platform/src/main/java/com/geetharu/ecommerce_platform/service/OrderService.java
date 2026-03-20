package com.geetharu.ecommerce_platform.service;

import com.geetharu.ecommerce_platform.entity.Order;
import com.geetharu.ecommerce_platform.entity.OrderItem;
import com.geetharu.ecommerce_platform.entity.Product;
import com.geetharu.ecommerce_platform.entity.User;
import com.geetharu.ecommerce_platform.repository.OrderRepository;
import com.geetharu.ecommerce_platform.repository.ProductRepository;
import com.geetharu.ecommerce_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID; // 🚀 NEW: Import Java's random string generator

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void processStripePayment(Long userId, String stripeSessionId, Double totalAmount, String cartDetails) {

        if (orderRepository.existsByStripeSessionId(stripeSessionId)) {
            System.out.println("⚠️ Duplicate Webhook Ignored for Session: " + stripeSessionId);
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PAID");
        order.setTotalAmount(totalAmount);
        order.setStripeSessionId(stripeSessionId);

        // 🚀 NEW: Generate a professional 8-character ID (e.g., ORD-7F3A9B1C)
        String generatedTrackingNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        order.setOrderTrackingNumber(generatedTrackingNumber);

        String[] items = cartDetails.split(",");
        for (String item : items) {
            if (item.isEmpty()) continue;

            String[] parts = item.split(":");
            Long productId = Long.parseLong(parts[0]);
            int quantityBought = Integer.parseInt(parts[1]);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            int newStock = product.getStockQuantity() - quantityBought;

            if (newStock < 0) {
                throw new RuntimeException("Out of stock for product: " + product.getName());
            }

            product.setStockQuantity(newStock);
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(quantityBought);
            orderItem.setPriceAtPurchase(product.getPrice());
            order.addItem(orderItem);
        }

        orderRepository.save(order);
        System.out.println("✅ SUCCESS: Secure Order saved! Tracking Number: " + generatedTrackingNumber);
    }
}