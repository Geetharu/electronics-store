package com.geetharu.ecommerce_platform.util;

import com.geetharu.ecommerce_platform.entity.User;
import com.geetharu.ecommerce_platform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password123")); // Hashed!
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println("✅ BACKEND READY: Created user 'admin' with password 'password123'");
        }
    }
}