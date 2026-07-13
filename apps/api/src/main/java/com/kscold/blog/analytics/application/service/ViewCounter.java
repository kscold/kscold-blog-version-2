package com.kscold.blog.analytics.application.service;

import com.kscold.blog.analytics.domain.model.ViewLog;
import com.kscold.blog.analytics.domain.port.out.ViewLogRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * 조회수 집계 컴포넌트. - 동일 IP가 1시간 내 같은 엔티티를 다시 열람해도 카운트 증가 X - Mongo $inc atomic update 로 race condition
 * 방지
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ViewCounter {

    private final ViewLogRepository viewLogRepository;

    /**
     * entity의 views 필드를 1 증가시킴. 중복 IP면 false 반환.
     *
     * @param collectionName Post/Feed/VaultNote의 Mongo 컬렉션명
     * @param entityId 문서 ID
     * @param entityType ViewLog 분류 키 (POST/FEED/VAULT_NOTE)
     * @param clientIp 클라이언트 IP
     * @return 실제로 증가했으면 true
     */
    public boolean incrementIfUnique(
            String collectionName, String entityId, String entityType, String clientIp) {
        if (!StringUtils.hasText(entityId) || !StringUtils.hasText(clientIp)) {
            return false;
        }

        String ipHash = hash(clientIp);

        ViewLog viewLog =
                ViewLog.builder()
                        .entityType(entityType)
                        .entityId(entityId)
                        .ipHash(ipHash)
                        .createdAt(Instant.now())
                        .build();
        if (!viewLogRepository.insertViewLogIfUnique(viewLog)) {
            // 이미 1시간 내 조회 → 증가 skip
            return false;
        }

        viewLogRepository.incrementViews(collectionName, entityId);
        return true;
    }

    private String hash(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return raw;
        }
    }
}
