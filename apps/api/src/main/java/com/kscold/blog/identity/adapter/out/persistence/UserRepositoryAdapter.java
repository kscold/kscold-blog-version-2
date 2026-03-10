package com.kscold.blog.identity.adapter.out.persistence;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * UserRepository 포트 구현체
 * Spring Data MongoDB를 감싸는 어댑터
 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final MongoUserRepository mongoUserRepository;

    @Override
    public User save(User user) {
        return mongoUserRepository.save(user);
    }

    @Override
    public Optional<User> findById(String id) {
        return mongoUserRepository.findById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return mongoUserRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return mongoUserRepository.findByUsername(username);
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
}
