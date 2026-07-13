package com.kscold.blog.adminnight.adapter.in.web.dto.response;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramVoteResponse {

    private String id;
    private String programKey;
    private String userId;
    private String requesterName;
    private String requesterEmail;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
