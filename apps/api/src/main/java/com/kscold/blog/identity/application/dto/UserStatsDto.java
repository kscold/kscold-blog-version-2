package com.kscold.blog.identity.application.dto;

import java.util.List;

public record UserStatsDto(
        long totalUsers,
        long newUsersToday,
        long newUsersThisWeek,
        long newUsersThisMonth,
        List<DailySignup> dailySignups,
        List<RecentUser> recentUsers
) {
    public record DailySignup(String date, long count) {}

    public record RecentUser(
            String id,
            String username,
            String displayName,
            String email,
            String avatar,
            String role,
            String createdAt
    ) {}
}
