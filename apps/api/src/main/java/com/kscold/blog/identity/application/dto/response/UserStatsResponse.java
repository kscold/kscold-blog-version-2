package com.kscold.blog.identity.application.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserStatsResponse {
    private long totalUsers;
    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUsersThisMonth;
    private List<DailySignup> dailySignups;
    private List<RecentUser> recentUsers;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class DailySignup {
        private String date;
        private long count;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RecentUser {
        private String id;
        private String username;
        private String displayName;
        private String email;
        private String avatar;
        private String role;
        private String createdAt;
        private boolean deleted;
    }
}
