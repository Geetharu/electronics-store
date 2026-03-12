package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 🚀 Grabs all reviews for a specific product, newest first!
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    // 🚀 Checks if a user has ALREADY reviewed this product (prevent spamming)
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}