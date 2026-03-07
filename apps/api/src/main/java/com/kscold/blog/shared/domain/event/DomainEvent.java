package com.kscold.blog.shared.domain.event;

import java.time.LocalDateTime;

/**
 * 도메인 이벤트 마커 인터페이스
 * 바운디드 컨텍스트 간 통신에 사용
 */
public interface DomainEvent {

    LocalDateTime occurredAt();
}
