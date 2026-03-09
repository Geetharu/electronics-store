package com.geetharu.ecommerce_platform.controller;

import com.geetharu.ecommerce_platform.dto.CartItemDTO;
import com.geetharu.ecommerce_platform.entity.Product;
import com.geetharu.ecommerce_platform.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // --- PRODUCT ENDPOINTS ---

    @GetMapping("/products") // Added /products here
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/products") // Added /products here
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @GetMapping("/products/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping("/products/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

    // --- CHECKOUT ENDPOINT ---

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody List<CartItemDTO> cartItems) {
        try {
            productService.processCheckout(cartItems);
            return ResponseEntity.ok(Map.of("message", "Checkout successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}