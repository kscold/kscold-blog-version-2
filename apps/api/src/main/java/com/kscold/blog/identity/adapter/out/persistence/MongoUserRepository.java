package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

/** Spring Data MongoDB 인터페이스 (인프라 계층) */
public interface MongoUserRepository extends MongoRepository<User, String> {

    interface ActiveAuthenticationProjection {
        User.Role getRole();

        Long getCredentialVersion();

        String getUsername();

        User.Profile getProfile();
    }

    @Query(
            value = "{ '_id': ?0, 'deletedAt': null }",
            fields =
                    "{ 'role': 1, 'credentialVersion': 1, 'username': 1, 'profile.displayName': 1 }")
    Optional<ActiveAuthenticationProjection> findActiveAuthenticationById(String id);

    @Query("{ '_id': ?0, 'deletedAt': null }")
    Optional<User> findActiveById(String id);

    Optional<User> findByEmail(String email);

    @Query("{ 'email': ?0, 'deletedAt': null }")
    Optional<User> findActiveByEmail(String email);

    @Query("{ 'username': ?0, 'deletedAt': null }")
    Optional<User> findActiveByUsername(String username);

    @Query("{ '_id': { '$in': ?0 }, 'deletedAt': null }")
    List<User> findAllActiveById(Collection<String> ids);

    @Query("{ 'deletedAt': null }")
    List<User> findAllActive();

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findByRole(User.Role role);

    long countByCreatedAtAfter(LocalDateTime after);

    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);
}
