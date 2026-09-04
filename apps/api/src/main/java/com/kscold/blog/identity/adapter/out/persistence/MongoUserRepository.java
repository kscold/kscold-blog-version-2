package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

/** Spring Data MongoDB 인터페이스 (인프라 계층) */
public interface MongoUserRepository extends MongoRepository<User, String> {

    interface ActiveRoleProjection {
        User.Role getRole();
    }

    @Query(value = "{ '_id': ?0, 'deletedAt': null }", fields = "{ 'role': 1 }")
    Optional<ActiveRoleProjection> findActiveRoleById(String id);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findByRole(User.Role role);

    long countByCreatedAtAfter(LocalDateTime after);

    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);
}
