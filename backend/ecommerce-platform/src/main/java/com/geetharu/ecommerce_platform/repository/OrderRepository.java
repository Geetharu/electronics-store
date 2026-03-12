package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Grabs a user's past purchases
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Grabs ALL purchases in the entire store for the Admin!
    List<Order> findAllByOrderByOrderDateDesc();

    // Checks the database to see if we already processed this exact Stripe payment!
    boolean existsByStripeSessionId(String stripeSessionId);
}