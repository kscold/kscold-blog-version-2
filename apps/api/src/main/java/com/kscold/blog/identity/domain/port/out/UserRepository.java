package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    User save(User user);
    Optional<User> findByUsername(String username);
    long count();

    /** 전체 사용자 목록 (최신 가입순) */
    List<User> findAllOrderByCreatedAtDesc();

    /** 특정 기간 이후 가입자 수 */
    long countByCreatedAtAfter(LocalDateTime after);

    /** 특정 기간 이후 가입자 목록 */
    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);

    /** 영구 삭제 (하드 딜리트) */
    void deleteById(String id);
}
