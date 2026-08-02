package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(String id);

    /** 주어진 id 들을 한 번에 조회함(반복 findById 로 인한 N+1 방지용). */
    List<User> findAllById(Collection<String> ids);

    /** 특정 권한(예: ADMIN)의 사용자만 조회함. 전체 컬렉션을 훑어 필터링하지 않도록 인덱스 쿼리로 처리함. */
    List<User> findByRole(User.Role role);

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
