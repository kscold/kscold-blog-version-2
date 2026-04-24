package com.kscold.blog.shared.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * 조회 로그: 동일 IP가 1시간 안에 같은 글을 다시 열람해도 조회수 증가 X
 * - composite unique index (entityType, entityId, ipHash) → 중복 insert 차단
 * - TTL index on createdAt (3600초) → 1시간 경과 시 자동 삭제 (다시 증가 가능)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "view_logs")
@CompoundIndexes({
        @CompoundIndex(name = "uniq_view", def = "{'entityType': 1, 'entityId': 1, 'ipHash': 1}", unique = true)
})
public class ViewLog {

    @Id
    private String id;

    private String entityType;   // POST, FEED, VAULT_NOTE

    private String entityId;

    private String ipHash;

    @Indexed(expireAfterSeconds = 3600)
    private Instant createdAt;
}
