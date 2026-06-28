package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

final class AdminNightWebMapper {

    private AdminNightWebMapper() {
    }

    static AdminNightRequest.SlotInfo toSlot(SlotBody slot) {
        if (slot == null) {
            return null;
        }

        return AdminNightRequest.SlotInfo.builder()
                .slotKey(slot.slotKey())
                .date(slot.date())
                .weekday(slot.weekday())
                .timeLabel(slot.timeLabel())
                .focus(slot.focus())
                .badgeLabel(slot.badgeLabel())
                .build();
    }

    static RequestResponse toResponse(AdminNightRequest request) {
        return new RequestResponse(
                request.getId(),
                request.getUserId(),
                request.getRequesterName(),
                request.getRequesterEmail(),
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getStatus(),
                toSlotResponse(request.getPreferredSlot()),
                toSlotResponse(request.getScheduledSlot()),
                request.getReviewNote(),
                request.getDecidedByName(),
                request.getDecidedAt(),
                request.getCreatedAt()
        );
    }

    static CalendarEntryResponse toCalendarEntry(AdminNightRequest request) {
        return new CalendarEntryResponse(
                request.getId(),
                maskName(request.getRequesterName()),
                request.getTaskTitle(),
                request.getParticipationMode(),
                toSlotResponse(request.getScheduledSlot()),
                request.getCreatedAt()
        );
    }

    static ProgramVoteResponse toProgramVoteResponse(AdminNightProgramVote vote) {
        return new ProgramVoteResponse(
                vote.getId(),
                vote.getProgramKey(),
                vote.getUserId(),
                vote.getRequesterName(),
                vote.getRequesterEmail(),
                vote.getContactEmail(),
                vote.getContact(),
                vote.getInterestLevel(),
                vote.getPreferredFormat(),
                vote.getExperienceLevel(),
                vote.getSessionStyle(),
                vote.getSessionLength(),
                vote.getFoodPreference(),
                safeList(vote.getPreferredDays()),
                safeList(vote.getPreferredTimes()),
                safeList(vote.getInterestedTopics()),
                vote.getDesiredTakeaways(),
                vote.getMessage(),
                vote.getCreatedAt(),
                vote.getUpdatedAt()
        );
    }

    static ProgramVoteSummaryResponse toProgramVoteSummary(String programKey, List<AdminNightProgramVote> votes) {
        return new ProgramVoteSummaryResponse(
                programKey,
                votes.size(),
                countEnum(votes.stream().map(AdminNightProgramVote::getInterestLevel).filter(Objects::nonNull).map(Enum::name).toList()),
                countEnum(votes.stream().map(AdminNightProgramVote::getPreferredFormat).filter(Objects::nonNull).map(Enum::name).toList()),
                countEnum(votes.stream().map(AdminNightProgramVote::getExperienceLevel).filter(Objects::nonNull).map(Enum::name).toList()),
                countEnum(votes.stream().map(AdminNightProgramVote::getSessionStyle).filter(Objects::nonNull).map(Enum::name).toList()),
                countEnum(votes.stream().map(AdminNightProgramVote::getSessionLength).filter(Objects::nonNull).map(Enum::name).toList()),
                countEnum(votes.stream().map(AdminNightProgramVote::getFoodPreference).filter(Objects::nonNull).map(Enum::name).toList()),
                countEnum(votes.stream().flatMap(vote -> safeList(vote.getPreferredDays()).stream()).map(Enum::name).toList()),
                countValues(votes.stream().flatMap(vote -> safeList(vote.getPreferredTimes()).stream()).toList()),
                countValues(votes.stream().flatMap(vote -> safeList(vote.getInterestedTopics()).stream()).toList()),
                votes.stream()
                        .map(vote -> vote.getUpdatedAt() != null ? vote.getUpdatedAt() : vote.getCreatedAt())
                        .filter(Objects::nonNull)
                        .max(LocalDateTime::compareTo)
                        .orElse(null)
        );
    }

    private static SlotResponse toSlotResponse(AdminNightRequest.SlotInfo slot) {
        if (slot == null) {
            return null;
        }

        return new SlotResponse(
                slot.getSlotKey(),
                slot.getDate(),
                slot.getWeekday(),
                slot.getTimeLabel(),
                slot.getFocus(),
                slot.getBadgeLabel()
        );
    }

    private static String maskName(String name) {
        if (name == null || name.isBlank()) {
            return "익명";
        }
        if (name.length() == 1) {
            return name + "*";
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + "*" + name.charAt(name.length() - 1);
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private static Map<String, Long> countEnum(List<String> values) {
        return countValues(values);
    }

    private static Map<String, Long> countValues(List<String> values) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String value : values) {
            if (value == null || value.isBlank()) {
                continue;
            }
            counts.merge(value, 1L, Long::sum);
        }
        return counts;
    }
}
