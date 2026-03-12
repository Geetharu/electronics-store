package com.geetharu.ecommerce_platform.service;

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
    private final ReviewRepository reviewRepository; // 🚀 NEW: Brought in the reviews!

    public ProductService(ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    // 🧠 HELPER: Calculates the stars on the fly!
    private void attachReviewStats(Product product) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        product.setReviewCount(reviews.size());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            product.setAverageRating(Math.round(avg * 10.0) / 10.0); // Rounds to 1 decimal (e.g., 4.5)
        } else {
            product.setAverageRating(0.0);
        }
    }

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        products.forEach(this::attachReviewStats); // 🚀 Attach stats to every product
        return products;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) attachReviewStats(product); // 🚀 Attach stats
        return product;
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existingProduct -> {
            existingProduct.setName(updatedProduct.getName());
            existingProduct.setSku(updatedProduct.getSku());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setStockQuantity(updatedProduct.getStockQuantity());
            existingProduct.setCategory(updatedProduct.getCategory());
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

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        List<Product> products = productRepository.findByCategory(category);
        products.forEach(this::attachReviewStats); // 🚀 Attach stats
        return products;
    }
}