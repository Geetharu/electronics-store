package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
}