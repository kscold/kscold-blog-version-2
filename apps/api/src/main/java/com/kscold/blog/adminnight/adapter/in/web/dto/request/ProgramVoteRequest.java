package com.kscold.blog.adminnight.adapter.in.web.dto.request;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProgramVoteRequest {

    @Size(max = 40, message = "이름은 최대 40자입니다")
    private String requesterName;

    @Email(message = "이메일 형식이 올바르지 않습니다")
    @Size(max = 120, message = "이메일은 최대 120자입니다")
    private String contactEmail;

    @Size(max = 20, message = "연락처가 너무 깁니다")
    private String contact;

    private AdminNightProgramVote.InterestLevel interestLevel;
    private AdminNightProgramVote.PreferredFormat preferredFormat;
    private AdminNightProgramVote.ExperienceLevel experienceLevel;
    private AdminNightProgramVote.SessionStyle sessionStyle;
    private AdminNightProgramVote.SessionLength sessionLength;
    private AdminNightProgramVote.FoodPreference foodPreference;

    @Size(max = 3, message = "희망 요일이 너무 많습니다")
    private List<AdminNightProgramVote.PreferredDay> preferredDays;

    @Size(max = 8, message = "가능한 시간대가 너무 많습니다")
    private List<@Size(max = 80, message = "시간대 항목이 너무 깁니다") String> preferredTimes;

    @Size(max = 12, message = "관심 주제가 너무 많습니다")
    private List<@Size(max = 80, message = "관심 주제 항목이 너무 깁니다") String> interestedTopics;

    @Size(max = 1000, message = "얻어가고 싶은 내용이 너무 깁니다")
    private String desiredTakeaways;

    @Size(max = 1000, message = "추가 메시지가 너무 깁니다")
    private String message;
}
