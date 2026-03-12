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

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    // 🚀 THE MAGIC SHIELD: If ANY line of code in this method fails,
    // Spring Boot instantly UNDOES all database changes. No lost inventory!
    @Transactional
    public void processStripePayment(Long userId, String stripeSessionId, Double totalAmount, String cartDetails) {

        // 1. Anti-Duplicate Check
        if (orderRepository.existsByStripeSessionId(stripeSessionId)) {
            System.out.println("⚠️ Duplicate Webhook Ignored for Session: " + stripeSessionId);
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Create the master receipt
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PAID");
        order.setTotalAmount(totalAmount);
        order.setStripeSessionId(stripeSessionId); // 🔒 Save the ID to prevent duplicates

        // 3. Process items and deduct stock safely
        String[] items = cartDetails.split(",");
        for (String item : items) {
            if (item.isEmpty()) continue;

            String[] parts = item.split(":");
            Long productId = Long.parseLong(parts[0]);
            int quantityBought = Integer.parseInt(parts[1]);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            int newStock = product.getStockQuantity() - quantityBought;

            // If someone bought the last item 1 millisecond before this user,
            // this throws an error and triggers the @Transactional ROLLBACK!
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

        // 4. Final Save
        orderRepository.save(order);
        System.out.println("✅ SUCCESS: Secure Order saved for User ID: " + userId);
    }
}