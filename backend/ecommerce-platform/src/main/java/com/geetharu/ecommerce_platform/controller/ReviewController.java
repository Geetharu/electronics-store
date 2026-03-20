package com.geetharu.ecommerce_platform.controller;

import com.geetharu.ecommerce_platform.entity.Order;
import com.geetharu.ecommerce_platform.entity.OrderItem;
import com.geetharu.ecommerce_platform.entity.Product;
import com.geetharu.ecommerce_platform.entity.Review;
import com.geetharu.ecommerce_platform.entity.User;
import com.geetharu.ecommerce_platform.repository.OrderRepository;
import com.geetharu.ecommerce_platform.repository.ProductRepository;
import com.geetharu.ecommerce_platform.repository.ReviewRepository;
import com.geetharu.ecommerce_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;

    // 🌍 PUBLIC: Anyone can read the reviews for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        // We map the data so we only send safe info to the frontend (hide user passwords, etc.)
        List<Map<String, Object>> safeReviews = reviews.stream().map(review -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", review.getId());
            map.put("rating", review.getRating());
            map.put("comment", review.getComment());
            map.put("createdAt", review.getCreatedAt());
            map.put("username", review.getUser().getUsername()); // Just send the name!
            return map;
        }).toList();

        return ResponseEntity.ok(safeReviews);
    }

    // 🔒 SECURE: Ask the backend "Am I allowed to review this?"
    @GetMapping("/product/{productId}/can-review")
    public ResponseEntity<Boolean> checkCanReview(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.ok(false);
        }

        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.ok(false);

        boolean canReview = verifyPurchaseAndDelivery(user.getId(), productId);
        return ResponseEntity.ok(canReview);
    }

    // 🔒 SECURE: Actually save the review to the database
    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addReview(@PathVariable Long productId, @RequestBody Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("Please log in to review.");
        }

        // 🛑 Hacker Check: Verify they actually bought it again just in case they bypassed the frontend!
        if (!verifyPurchaseAndDelivery(user.getId(), productId)) {
            return ResponseEntity.status(403).body("You can only review items that have been delivered to you.");
        }

        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (optionalProduct.isEmpty()) {
            return ResponseEntity.status(404).body("Product not found.");
        }

        // Create and save the review!
        Review review = new Review();
        review.setRating((Integer) payload.get("rating"));
        review.setComment((String) payload.get("comment"));
        review.setCreatedAt(LocalDateTime.now());
        review.setProduct(optionalProduct.get());
        review.setUser(user);

        reviewRepository.save(review);
        return ResponseEntity.ok("Review posted successfully!");
    }

    // ==========================================
    // 👑 ADMIN ONLY: Moderation Features
    // ==========================================

    // 1. Fetch ALL reviews across the whole store (Ignores deleted products!)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllReviews() {

        // 🚀 FIXED: Uses the new query to only fetch reviews for active products
        List<Review> reviews = reviewRepository.findByProductIsDeletedFalseOrderByCreatedAtDesc();

        List<Map<String, Object>> adminReviews = reviews.stream().map(review -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", review.getId());
            map.put("rating", review.getRating());
            map.put("comment", review.getComment());
            map.put("createdAt", review.getCreatedAt());
            map.put("username", review.getUser().getUsername());
            map.put("productName", review.getProduct().getName());
            return map;
        }).toList();

        return ResponseEntity.ok(adminReviews);
    }

    // 2. Delete a review permanently
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        if (reviewRepository.existsById(reviewId)) {
            reviewRepository.deleteById(reviewId);
            return ResponseEntity.ok("Review deleted successfully.");
        }
        return ResponseEntity.status(404).body("Review not found.");
    }

    // ==========================================
    // 🧠 HELPER: The "Verified Purchase" Logic
    // ==========================================
    private boolean verifyPurchaseAndDelivery(Long userId, Long productId) {
        // Rule 1: No double reviews allowed
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            return false;
        }

        // Rule 2: Did they buy it AND is it delivered?
        List<Order> userOrders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        for (Order order : userOrders) {
            if ("DELIVERED".equals(order.getStatus())) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct().getId().equals(productId)) {
                        return true; // PASSED! They bought it and it arrived!
                    }
                }
            }
        }
        return false; // FAILED.
    }
}