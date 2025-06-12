package com.devflow.user.repository;

import com.devflow.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = ?1 OR u.email = ?1")
    Optional<User> findByUsernameOrEmail(String usernameOrEmail);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);
}