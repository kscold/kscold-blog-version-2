package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.time.LocalDate;
import java.util.List;

record CreateRequestBody(
        String requesterName,
        String taskTitle,
        String message,
        AdminNightRequest.ParticipationMode participationMode,
        SlotBody preferredSlot) {}

record ApproveRequestBody(SlotBody scheduledSlot) {}

record ReviewRequestBody(String reviewNote) {}

record ProgramVoteBody(
        String requesterName,
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
        String message) {}

record SlotBody(
        String slotKey,
        LocalDate date,
        String weekday,
        String timeLabel,
        String focus,
        String badgeLabel) {}
