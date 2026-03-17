package com.geetharu.ecommerce_platform.controller;

import com.geetharu.ecommerce_platform.entity.Product;
import com.geetharu.ecommerce_platform.entity.Wishlist;
import com.geetharu.ecommerce_platform.repository.WishlistRepository;
import com.geetharu.ecommerce_platform.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "${cors.allowed.origin}")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final ProductService productService;

    public WishlistController(WishlistRepository wishlistRepository, ProductService productService) {
        this.wishlistRepository = wishlistRepository;
        this.productService = productService;
    }

    // 1. Get all wishlist items for the logged-in user
    @GetMapping
    public ResponseEntity<List<Product>> getMyWishlist() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Wishlist> wishlists = wishlistRepository.findByUsername(username);

        // Extract just the Products from the Wishlist entities to send to React
        List<Product> products = wishlists.stream()
                .map(Wishlist::getProduct)
                .collect(Collectors.toList());

        return ResponseEntity.ok(products);
    }

    // 2. The "Toggle" Endpoint (Add or Remove based on current state)
    @PostMapping("/toggle/{productId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long productId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<Wishlist> existing = wishlistRepository.findByUsernameAndProductId(username, productId);

        if (existing.isPresent()) {
            // It's already in the wishlist, so remove it!
            wishlistRepository.delete(existing.get());
            return ResponseEntity.ok().body(Map.of("message", "Removed from wishlist", "isFavorited", false));
        } else {
            // It's not in the wishlist, so add it!
            try {
                Product product = productService.getProductById(productId);
                if (product == null) {
                    return ResponseEntity.notFound().build();
                }

                Wishlist wishlist = new Wishlist();
                wishlist.setUsername(username);
                wishlist.setProduct(product);
                wishlistRepository.save(wishlist);

                return ResponseEntity.ok().body(Map.of("message", "Added to wishlist", "isFavorited", true));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
            }
        }
    }
}