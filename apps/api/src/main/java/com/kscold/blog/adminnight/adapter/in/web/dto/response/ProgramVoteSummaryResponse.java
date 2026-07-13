package com.kscold.blog.adminnight.adapter.in.web.dto.response;

import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramVoteSummaryResponse {

    private String programKey;
    private long totalVotes;
    private Map<String, Long> interestLevelCounts;
    private Map<String, Long> preferredFormatCounts;
    private Map<String, Long> experienceLevelCounts;
    private Map<String, Long> sessionStyleCounts;
    private Map<String, Long> sessionLengthCounts;
    private Map<String, Long> foodPreferenceCounts;
    private Map<String, Long> preferredDayCounts;
    private Map<String, Long> preferredTimeCounts;
    private Map<String, Long> interestedTopicCounts;
    private LocalDateTime updatedAt;

    public static ProgramVoteSummaryResponse from(
            String programKey, List<AdminNightProgramVote> votes) {
        return ProgramVoteSummaryResponse.builder()
                .programKey(programKey)
                .totalVotes(votes.size())
                .interestLevelCounts(
                        countEnum(
                                votes.stream()
                                        .map(AdminNightProgramVote::getInterestLevel)
                                        .filter(Objects::nonNull)
                                        .map(Enum::name)
                                        .toList()))
                .preferredFormatCounts(
                        countEnum(
                                votes.stream()
                                        .map(AdminNightProgramVote::getPreferredFormat)
                                        .filter(Objects::nonNull)
                                        .map(Enum::name)
                                        .toList()))
                .experienceLevelCounts(
                        countEnum(
                                votes.stream()
                                        .map(AdminNightProgramVote::getExperienceLevel)
                                        .filter(Objects::nonNull)
                                        .map(Enum::name)
                                        .toList()))
                .sessionStyleCounts(
                        countEnum(
                                votes.stream()
                                        .map(AdminNightProgramVote::getSessionStyle)
                                        .filter(Objects::nonNull)
                                        .map(Enum::name)
                                        .toList()))
                .sessionLengthCounts(
                        countEnum(
                                votes.stream()
                                        .map(AdminNightProgramVote::getSessionLength)
                                        .filter(Objects::nonNull)
                                        .map(Enum::name)
                                        .toList()))
                .foodPreferenceCounts(
                        countEnum(
                                votes.stream()
                                        .map(AdminNightProgramVote::getFoodPreference)
                                        .filter(Objects::nonNull)
                                        .map(Enum::name)
                                        .toList()))
                .preferredDayCounts(
                        countEnum(
                                votes.stream()
                                        .flatMap(vote -> safeList(vote.getPreferredDays()).stream())
                                        .map(Enum::name)
                                        .toList()))
                .preferredTimeCounts(
                        countValues(
                                votes.stream()
                                        .flatMap(
                                                vote -> safeList(vote.getPreferredTimes()).stream())
                                        .toList()))
                .interestedTopicCounts(
                        countValues(
                                votes.stream()
                                        .flatMap(
                                                vote ->
                                                        safeList(vote.getInterestedTopics())
                                                                .stream())
                                        .toList()))
                .updatedAt(
                        votes.stream()
                                .map(
                                        vote ->
                                                vote.getUpdatedAt() != null
                                                        ? vote.getUpdatedAt()
                                                        : vote.getCreatedAt())
                                .filter(Objects::nonNull)
                                .max(LocalDateTime::compareTo)
                                .orElse(null))
                .build();
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
