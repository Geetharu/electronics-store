package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUsername(String username);
    Optional<Wishlist> findByUsernameAndProductId(String username, Long productId);
}