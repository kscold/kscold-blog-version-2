package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

record SlotResponse(
        String slotKey,
        LocalDate date,
        String weekday,
        String timeLabel,
        String focus,
        String badgeLabel
) {}

record RequestResponse(
        String id,
        String userId,
        String requesterName,
        String requesterEmail,
        String taskTitle,
        String message,
        AdminNightRequest.ParticipationMode participationMode,
        AdminNightRequest.Status status,
        SlotResponse preferredSlot,
        SlotResponse scheduledSlot,
        String reviewNote,
        String decidedByName,
        LocalDateTime decidedAt,
        LocalDateTime createdAt
) {}

record CalendarEntryResponse(
        String id,
        String requesterLabel,
        String taskTitle,
        AdminNightRequest.ParticipationMode participationMode,
        SlotResponse scheduledSlot,
        LocalDateTime createdAt
) {}

record ProgramVoteResponse(
        String id,
        String programKey,
        String userId,
        String requesterName,
        String requesterEmail,
        String contactEmail,
        String contact,
        AdminNightProgramVote.InterestLevel interestLevel,
        AdminNightProgramVote.PreferredFormat preferredFormat,
        AdminNightProgramVote.ExperienceLevel experienceLevel,
        AdminNightProgramVote.SessionStyle sessionStyle,
        AdminNightProgramVote.SessionLength sessionLength,
        AdminNightProgramVote.FoodPreference foodPreference,
        List<AdminNightProgramVote.PreferredDay> preferredDays,
        List<String> preferredTimes,
        List<String> interestedTopics,
        String desiredTakeaways,
        String message,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

record ProgramVoteSummaryResponse(
        String programKey,
        long totalVotes,
        Map<String, Long> interestLevelCounts,
        Map<String, Long> preferredFormatCounts,
        Map<String, Long> experienceLevelCounts,
        Map<String, Long> sessionStyleCounts,
        Map<String, Long> sessionLengthCounts,
        Map<String, Long> foodPreferenceCounts,
        Map<String, Long> preferredDayCounts,
        Map<String, Long> preferredTimeCounts,
        Map<String, Long> interestedTopicCounts,
        LocalDateTime updatedAt
) {}
