package com.kscold.blog.adminnight.application.dto.command;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminNightProgramVoteCommand {

    private String requesterName;

    private String contactEmail;

    private String contact;

    private AdminNightProgramVote.InterestLevel interestLevel;

    private AdminNightProgramVote.PreferredFormat preferredFormat;

    private AdminNightProgramVote.ExperienceLevel experienceLevel;

    private AdminNightProgramVote.SessionStyle sessionStyle;

    private AdminNightProgramVote.SessionLength sessionLength;

    private AdminNightProgramVote.FoodPreference foodPreference;

    private List<AdminNightProgramVote.PreferredDay> preferredDays;

    private List<String> preferredTimes;

    private List<String> interestedTopics;

    private String desiredTakeaways;

    private String message;
}
