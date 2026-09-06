package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.User;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(String id);

    /** 인증·복구 경로에서 활성 계정만 조회한다. */
    Optional<User> findActiveById(String id);

    /** 인증 경로에서 활성 계정의 현재 역할만 projection으로 조회한다. */
    Optional<User.Role> findActiveRoleById(String id);

    /** 주어진 id 들을 한 번에 조회함(반복 findById 로 인한 N+1 방지용). */
    List<User> findAllById(Collection<String> ids);

    /** 공개 프로필 보강에 필요한 활성 사용자만 id 목록으로 조회한다. */
    List<User> findAllActiveById(Collection<String> ids);

    /** 특정 권한(예: ADMIN)의 사용자만 조회함. 전체 컬렉션을 훑어 필터링하지 않도록 인덱스 쿼리로 처리함. */
    List<User> findByRole(User.Role role);

    Optional<User> findByEmail(String email);

    /** 공개 인증·복구 경로에서 활성 이메일 계정만 조회한다. */
    Optional<User> findActiveByEmail(String email);

    /** 탈퇴와 경합해도 계정을 되살리지 않도록 활성 계정의 비밀번호만 원자적으로 변경한다. */
    boolean updatePasswordIfActive(String id, String encodedPassword);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    User save(User user);

    Optional<User> findActiveByUsername(String username);

    /** 공용 프로필 집계에 사용할 활성 사용자 목록. */
    List<User> findAllActive();

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
