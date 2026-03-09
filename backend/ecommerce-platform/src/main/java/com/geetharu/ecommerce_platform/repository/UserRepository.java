package com.geetharu.ecommerce_platform.repository;

import com.geetharu.ecommerce_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // This tells Spring it's a database component
public interface UserRepository extends JpaRepository<User, Long> {
    // This finds the user in the database by their username
    Optional<User> findByUsername(String username);
}