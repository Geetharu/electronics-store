package com.geetharu.ecommerce_platform.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.ArrayList;
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

    @JsonProperty("isHidden")
    private boolean isHidden;

    // Field to store the Main Cloudinary link (Thumbnail)
    @Column(length = 1000)
    private String imageUrl;

    // 🚀 NEW: The Image Gallery List!
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", length = 1000)
    private List<String> imageGallery = new ArrayList<>();

    // Transient fields for High-Performance UI (Not saved in DB)
    @Transient
    private Double averageRating = 0.0;

    @Transient
    private Integer reviewCount = 0;

    public Product() {
    }

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

    @JsonProperty("isHidden")
    public boolean isHidden() { return isHidden; }
    public void setHidden(boolean hidden) { isHidden = hidden; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // 🚀 NEW: Getters and Setters for the Gallery
    public List<String> getImageGallery() { return imageGallery; }
    public void setImageGallery(List<String> imageGallery) { this.imageGallery = imageGallery; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
}