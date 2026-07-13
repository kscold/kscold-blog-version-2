package com.kscold.blog.analytics.domain.port.out;

import com.kscold.blog.analytics.domain.model.ViewLog;

/** 조회 로그 영속 · 조회수 증가 포트 */
public interface ViewLogRepository {

    /**
     * ViewLog를 저장한다. composite unique index 충돌(1시간 내 동일 IP·엔티티 중복 조회)이면 저장하지 않고 false를 반환한다.
     *
     * @return 실제로 저장됐으면 true, 중복이면 false
     */
    boolean insertViewLogIfUnique(ViewLog viewLog);

    /** collectionName 컬렉션에서 entityId 문서의 views 필드를 atomic $inc(+1) 한다. */
    void incrementViews(String collectionName, String entityId);
}
