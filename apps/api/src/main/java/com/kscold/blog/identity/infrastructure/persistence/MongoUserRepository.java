package com.kscold.blog.identity.infrastructure.persistence;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MongoUserRepository implements UserRepository {

    private final SpringDataUserRepository delegate;

    @Override
    public Optional<User> findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return delegate.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return delegate.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return delegate.existsByUsername(username);
    }

    @Override
    public User save(User user) {
        return delegate.save(user);
    }

    @Override
    public long count() {
        return delegate.count();
    }
}

interface SpringDataUserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
