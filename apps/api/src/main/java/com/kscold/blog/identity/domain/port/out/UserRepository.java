package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.User;

import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    User save(User user);
    Optional<User> findByUsername(String username);
    long count();
}
