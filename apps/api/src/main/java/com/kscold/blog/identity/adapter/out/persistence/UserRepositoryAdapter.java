package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/** UserRepository 포트 구현체 Spring Data MongoDB를 감싸는 어댑터 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final MongoUserRepository mongoUserRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public User save(User user) {
        return mongoUserRepository.save(user);
    }

    @Override
    public Optional<User> findById(String id) {
        return mongoUserRepository.findById(id);
    }

    @Override
    public Optional<User> findActiveById(String id) {
        return mongoUserRepository.findActiveById(id);
    }

    @Override
    public Optional<User.Role> findActiveRoleById(String id) {
        return mongoUserRepository
                .findActiveRoleById(id)
                .map(MongoUserRepository.ActiveRoleProjection::getRole);
    }

    @Override
    public List<User> findAllById(Collection<String> ids) {
        return mongoUserRepository.findAllById(ids).stream().toList();
    }

    @Override
    public List<User> findAllActiveById(Collection<String> ids) {
        return mongoUserRepository.findAllActiveById(ids);
    }

    @Override
    public List<User> findByRole(User.Role role) {
        return mongoUserRepository.findByRole(role);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return mongoUserRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findActiveByEmail(String email) {
        return mongoUserRepository.findActiveByEmail(email);
    }

    @Override
    public boolean updatePasswordIfActive(String id, String encodedPassword) {
        Query query = Query.query(Criteria.where("_id").is(id).and("deletedAt").is(null));
        Update update =
                new Update().set("password", encodedPassword).set("updatedAt", LocalDateTime.now());
        return mongoTemplate.updateFirst(query, update, User.class).getModifiedCount() == 1;
    }

    @Override
    public Optional<User> findActiveByUsername(String username) {
        return mongoUserRepository.findActiveByUsername(username);
    }

    @Override
    public List<User> findAllActive() {
        return mongoUserRepository.findAllActive();
    }

    @Override
    public boolean existsByEmail(String email) {
        return mongoUserRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return mongoUserRepository.existsByUsername(username);
    }

    @Override
    public long count() {
        return mongoUserRepository.count();
    }

    @Override
    public List<User> findAllOrderByCreatedAtDesc() {
        return mongoUserRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public long countByCreatedAtAfter(LocalDateTime after) {
        return mongoUserRepository.countByCreatedAtAfter(after);
    }

    @Override
    public List<User> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after) {
        return mongoUserRepository.findByCreatedAtAfterOrderByCreatedAtDesc(after);
    }

    @Override
    public void deleteById(String id) {
        mongoUserRepository.deleteById(id);
    }
}
