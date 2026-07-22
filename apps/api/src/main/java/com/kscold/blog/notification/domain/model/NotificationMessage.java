package com.kscold.blog.notification.domain.model;

import java.util.List;

/**
 * 단방향 알림 한 건.
 *
 * @param channel 보낼 채널 종류
 * @param title 임베드 제목
 * @param description 본문
 * @param fields 부가 정보(라벨-값). 비어 있어도 됨
 */
public record NotificationMessage(
        NotificationChannel channel, String title, String description, List<Field> fields) {

    public NotificationMessage {
        fields = fields == null ? List.of() : List.copyOf(fields);
    }

    public static NotificationMessage of(
            NotificationChannel channel, String title, String description) {
        return new NotificationMessage(channel, title, description, List.of());
    }

    /** 임베드에 표시할 라벨-값 한 쌍 */
    public record Field(String name, String value) {}
}
