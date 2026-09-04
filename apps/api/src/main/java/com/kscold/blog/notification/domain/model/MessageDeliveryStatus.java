package com.kscold.blog.notification.domain.model;

import java.util.List;

/**
 * 알림톡 한 건이 실제로 어떻게 됐는지 공급자(솔라피)에게 물어 얻은 결과.
 *
 * @param statusCode 공급자 상태 코드. 4000 이 수신 완료다
 * @param delivered 실제 단말에 도착했는지
 * @param text 실제로 나간 본문. 변수가 채워진 최종 문구다
 * @param logs 접수·배정·수신까지의 진행 기록
 */
public record MessageDeliveryStatus(
        String messageId,
        String groupId,
        String recipient,
        String statusCode,
        String status,
        boolean delivered,
        String text,
        String sentAt,
        String receivedAt,
        List<String> logs) {}
