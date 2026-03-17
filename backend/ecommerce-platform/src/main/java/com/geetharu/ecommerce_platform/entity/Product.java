package com.geetharu.ecommerce_platform.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sku;
    private Double price;
    private Integer stockQuantity;
    private String category;

    @Column(length = 1000)
    private String imageUrl;

    @ElementCollection
    private List<String> imageGallery;

    @Column(columnDefinition = "boolean default false")
    private boolean isHidden = false;

    // 🚀 THE FIX: Adding the proper Soft Delete column to the database
    @Column(columnDefinition = "boolean default false")
    private boolean isDeleted = false;

    @Transient
    private Double averageRating;

    @Transient
    private Integer reviewCount;

    // Constructors
    public Product() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getImageGallery() { return imageGallery; }
    public void setImageGallery(List<String> imageGallery) { this.imageGallery = imageGallery; }

    public boolean isHidden() { return isHidden; }
    public void setHidden(boolean hidden) { isHidden = hidden; }

    // 🚀 THE FIX: Getters and setters for Soft Delete
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
}