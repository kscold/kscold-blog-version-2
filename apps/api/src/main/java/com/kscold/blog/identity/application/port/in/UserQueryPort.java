package com.kscold.blog.identity.application.port.in;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

/** 다른 바운디드 컨텍스트에서 사용자 정보를 조회하기 위한 인바운드 포트 Identity 컨텍스트 외부에서 사용자 정보가 필요할 때 이 포트를 사용 */
public interface UserQueryPort {

    UserInfo getUserById(String userId);

    Optional<AuthenticationInfo> findAuthenticationById(String userId);

    /** 여러 사용자를 한 번에 조회해 호출 컨텍스트에서 사용자별 반복 조회를 피한다. */
    Map<String, UserInfo> getUsersByIds(Collection<String> userIds);

    record UserInfo(
            String id,
            String username,
            String displayName,
            String avatar,
            boolean isAdmin,
            String email) {}

    record AuthenticationInfo(String id, boolean isAdmin) {}
}
