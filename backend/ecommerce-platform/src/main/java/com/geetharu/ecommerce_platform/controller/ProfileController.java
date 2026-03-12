package com.geetharu.ecommerce_platform.controller;

import com.geetharu.ecommerce_platform.entity.User;
import com.geetharu.ecommerce_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // 1. GET MY PROFILE
    @GetMapping
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);

        if (user != null) {
            // We build a safe map so we don't accidentally send the password to the frontend!
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("username", user.getUsername());
            profileData.put("phone", user.getPhone());
            profileData.put("address", user.getAddress());
            profileData.put("city", user.getCity());
            profileData.put("postalCode", user.getPostalCode());
            return ResponseEntity.ok(profileData);
        }
        return ResponseEntity.status(404).body("User not found");
    }

    // 2. UPDATE MY PROFILE
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);

        if (user != null) {
            user.setPhone(updates.get("phone"));
            user.setAddress(updates.get("address"));
            user.setCity(updates.get("city"));
            user.setPostalCode(updates.get("postalCode"));

            userRepository.save(user);
            return ResponseEntity.ok("Profile updated successfully!");
        }
        return ResponseEntity.status(404).body("User not found");
    }
}