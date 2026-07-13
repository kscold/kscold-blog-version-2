package com.kscold.blog.adminnight.adapter.in.web.dto.response;

import java.time.LocalDateTime;
import java.util.Map;
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
}
