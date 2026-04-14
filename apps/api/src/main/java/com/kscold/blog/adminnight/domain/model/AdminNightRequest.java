package com.kscold.blog.adminnight.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_night_requests")
public class AdminNightRequest {

    @Id
    private String id;

    private String userId;
    private String requesterName;
    private String requesterEmail;
    private String taskTitle;
    private String message;
    private ParticipationMode participationMode;
    private SlotInfo preferredSlot;
    private SlotInfo scheduledSlot;
    private String reviewNote;

    @Builder.Default
    private Status status = Status.PENDING;

    private String decidedByUserId;
    private String decidedByName;
    private LocalDateTime decidedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING,
        INFO_REQUESTED,
        APPROVED,
        REJECTED
    }

    public enum ParticipationMode {
        ONLINE,
        OFFLINE,
        FLEXIBLE
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotInfo {
        private String slotKey;
        private LocalDate date;
        private String weekday;
        private String timeLabel;
        private String focus;
        private String badgeLabel;
    }
}
