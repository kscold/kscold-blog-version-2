package com.kscold.blog.adminnight.application.dto;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;

import java.util.List;

public record AdminNightProgramVoteCommand(
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
        String message
) {}
