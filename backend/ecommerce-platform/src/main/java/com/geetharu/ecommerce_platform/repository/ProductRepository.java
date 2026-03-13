package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    // 🚀 NEW: The Ultimate Enterprise Search & Filter Query!
    @Query("SELECT p FROM Product p WHERE " +
            "(:category = 'All' OR p.category = :category) AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:includeHidden = true OR p.isHidden = false)")
    Page<Product> searchAndFilterProducts(
            @Param("search") String search,
            @Param("category") String category,
            @Param("includeHidden") boolean includeHidden,
            Pageable pageable
    );
}