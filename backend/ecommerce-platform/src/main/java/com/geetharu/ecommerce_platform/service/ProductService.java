package com.geetharu.ecommerce_platform.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.geetharu.ecommerce_platform.dto.CartItemDTO;
import com.geetharu.ecommerce_platform.entity.Product;
import com.geetharu.ecommerce_platform.entity.Review;
import com.geetharu.ecommerce_platform.repository.ProductRepository;
import com.geetharu.ecommerce_platform.repository.ReviewRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    private void attachReviewStats(Product product) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        product.setReviewCount(reviews.size());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            product.setAverageRating(Math.round(avg * 10.0) / 10.0);
        } else {
            product.setAverageRating(0.0);
        }
    }

    public Page<Product> getPaginatedProducts(int page, int size, String search, String category, String sortOrder, boolean includeHidden) {
        Sort sort = Sort.by(Sort.Direction.ASC, "id");

        if ("price-asc".equals(sortOrder)) sort = Sort.by(Sort.Direction.ASC, "price");
        if ("price-desc".equals(sortOrder)) sort = Sort.by(Sort.Direction.DESC, "price");

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.searchAndFilterProducts(search, category, includeHidden, pageable);

        productPage.getContent().forEach(this::attachReviewStats);
        return productPage;
    }

    // 🚀 UPDATED: Only return items that are NOT deleted for the Admin Dashboard!
    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findByIsDeletedFalseOrderByIdAsc();
        products.forEach(this::attachReviewStats);
        return products;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) attachReviewStats(product);
        return product;
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existingProduct -> {
            existingProduct.setName(updatedProduct.getName());
            existingProduct.setSku(updatedProduct.getSku());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setStockQuantity(updatedProduct.getStockQuantity());
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setHidden(updatedProduct.isHidden());
            existingProduct.setImageUrl(updatedProduct.getImageUrl());
            existingProduct.setImageGallery(updatedProduct.getImageGallery());
            return productRepository.save(existingProduct);
        }).orElse(null);
    }

    @Transactional
    public void processCheckout(List<CartItemDTO> cartItems) {
        for (CartItemDTO item : cartItems) {
            Product product = productRepository.findById(item.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + item.getId()));

            if (product.getStockQuantity() < item.getCartQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - item.getCartQuantity());
            productRepository.save(product);
        }
    }

    // 🚀 UPDATED: The TRUE Enterprise Soft Delete
    public void deleteProduct(Long id) {
        productRepository.findById(id).ifPresent(product -> {
            product.setDeleted(true); // Flips the ghost switch instead of destroying the row
            productRepository.save(product);
        });
    }
}