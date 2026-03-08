package com.geetharu.ecommerce_platform.service;

import com.geetharu.ecommerce_platform.entity.Product;
import com.geetharu.ecommerce_platform.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // method to fetch all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    // method to save a product
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    // method to fetch a single product by its ID
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
    // method to update an existing product
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
    // method to delete a product
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    // custom query to fetch products by category
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }
}