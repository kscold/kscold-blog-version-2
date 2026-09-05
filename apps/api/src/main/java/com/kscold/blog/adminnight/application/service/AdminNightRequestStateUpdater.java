package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import java.time.LocalDateTime;

final class AdminNightRequestStateUpdater {

    private AdminNightRequestStateUpdater() {}

    static void markResubmitted(AdminNightRequest request) {
        request.setScheduledSlot(null);
        request.setReviewNote(null);
        request.setStatus(AdminNightRequest.Status.PENDING);
        request.setDecidedAt(null);
        request.setDecidedByUserId(null);
        request.setDecidedByName(null);
    }

    static void approve(
            AdminNightRequest request,
            AdminNightRequest.SlotInfo scheduledSlot,
            DecisionActor actor) {
        request.setStatus(AdminNightRequest.Status.APPROVED);
        request.setScheduledSlot(scheduledSlot);
        request.setReviewNote(null);
        applyDecision(request, actor);
    }

    static void requestMoreInfo(AdminNightRequest request, String reviewNote, DecisionActor actor) {
        request.setStatus(AdminNightRequest.Status.INFO_REQUESTED);
        request.setScheduledSlot(null);
        request.setReviewNote(reviewNote);
        applyDecision(request, actor);
    }

    static void reject(AdminNightRequest request, String reviewNote, DecisionActor actor) {
        request.setStatus(AdminNightRequest.Status.REJECTED);
        request.setScheduledSlot(null);
        request.setReviewNote(reviewNote);
        applyDecision(request, actor);
    }

    private static void applyDecision(AdminNightRequest request, DecisionActor actor) {
        request.setDecidedAt(actor.decidedAt());
        request.setDecidedByUserId(actor.userId());
        request.setDecidedByName(actor.displayName());
    }

    record DecisionActor(String userId, String displayName, LocalDateTime decidedAt) {

        static DecisionActor from(UserQueryPort.UserInfo admin) {
            return new DecisionActor(admin.id(), admin.displayName(), LocalDateTime.now());
        }
    }
}
