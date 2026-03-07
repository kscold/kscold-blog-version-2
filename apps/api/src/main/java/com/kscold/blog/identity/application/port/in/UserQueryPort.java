package com.kscold.blog.identity.application.port.in;

/**
 * 다른 바운디드 컨텍스트에서 사용자 정보를 조회하기 위한 인바운드 포트
 * Identity 컨텍스트 외부에서 사용자 정보가 필요할 때 이 포트를 사용
 */
public interface UserQueryPort {

    UserInfo getUserById(String userId);

    record UserInfo(
            String id,
            String displayName,
            String avatar
    ) {}
}
