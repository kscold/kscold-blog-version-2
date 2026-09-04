package com.kscold.blog.notification.domain.port.out;

/** 메일과 외부 알림에 넣을 공개 서비스 URL을 환경 설정에 맞게 조립한다. */
public interface PublicUrlResolver {

    String resolvePublicUrl(String path);
}
