package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 🚀 NEW: Admin Dashboard - Only fetch products that are NOT deleted
    List<Product> findByIsDeletedFalseOrderByIdAsc();

    // 🌟 UPDATED: Enterprise Search & Filter Query (Now ignores deleted items)
    @Query("SELECT p FROM Product p WHERE " +
            "p.isDeleted = false AND " +
            "(:category = 'All' OR p.category = :category) AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:includeHidden = true OR p.isHidden = false)")
    Page<Product> searchAndFilterProducts(
            @Param("search") String search,
            @Param("category") String category,
            @Param("includeHidden") boolean includeHidden,
            Pageable pageable
    );

    // 🚀 UPDATED: The Cross-Sell Engine Query (Now ignores deleted items)
    List<Product> findTop4ByCategoryAndIdNotAndIsHiddenFalseAndIsDeletedFalse(String category, Long id);
}