package com.kscold.blog.adminnight.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_night_program_votes")
public class AdminNightProgramVote {

    @Id private String id;

    private String programKey;
    private String userId;
    private String requesterName;
    private String requesterEmail;
    private String contactEmail;
    private String contact;
    private InterestLevel interestLevel;
    private PreferredFormat preferredFormat;
    private ExperienceLevel experienceLevel;
    private SessionStyle sessionStyle;
    private SessionLength sessionLength;
    private FoodPreference foodPreference;

    @Builder.Default private List<PreferredDay> preferredDays = new ArrayList<>();

    @Builder.Default private List<String> preferredTimes = new ArrayList<>();

    @Builder.Default private List<String> interestedTopics = new ArrayList<>();

    private String desiredTakeaways;
    private String message;

    @CreatedDate private LocalDateTime createdAt;

    @LastModifiedDate private LocalDateTime updatedAt;

    public enum InterestLevel {
        CURIOUS,
        WANT_TO_ATTEND,
        READY_IF_SCHEDULE_FITS
    }

    public enum PreferredFormat {
        ONLINE,
        OFFLINE,
        HYBRID,
        FLEXIBLE
    }

    public enum ExperienceLevel {
        NEW_TO_AGENT,
        BUILT_TOY,
        BUILDING_PRODUCT,
        OPERATING_SERVICE
    }

    public enum SessionStyle {
        LECTURE,
        WORKSHOP,
        NETWORKING,
        MIXED
    }

    public enum SessionLength {
        SHORT_90,
        STANDARD_120,
        HALF_DAY,
        SERIES
    }

    public enum FoodPreference {
        NO_NEED,
        DRINKS_ONLY,
        LIGHT_SNACK,
        MEAL
    }

    public enum PreferredDay {
        FRIDAY,
        SATURDAY,
        SUNDAY
    }
}
