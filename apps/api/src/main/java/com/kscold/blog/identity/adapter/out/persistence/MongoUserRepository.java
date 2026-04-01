package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB 인터페이스 (인프라 계층)
 */
public interface MongoUserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findAllByOrderByCreatedAtDesc();
    long countByCreatedAtAfter(LocalDateTime after);
    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);
}
