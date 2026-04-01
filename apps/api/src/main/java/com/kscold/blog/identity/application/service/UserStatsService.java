package com.kscold.blog.identity.application.service;

import com.kscold.blog.identity.application.dto.UserStatsDto;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserStatsService {

    private final UserRepository userRepository;

    public UserStatsDto getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(6).toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.minusDays(29).toLocalDate().atStartOfDay();

        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(startOfToday);
        long newUsersThisWeek = userRepository.countByCreatedAtAfter(startOfWeek);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

        // 최근 30일 가입자로 일별 그래프 데이터 생성
        List<User> monthlyUsers = userRepository.findByCreatedAtAfterOrderByCreatedAtDesc(startOfMonth);
        Map<String, Long> countByDate = monthlyUsers.stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().toLocalDate().format(DateTimeFormatter.ofPattern("MM/dd")),
                        Collectors.counting()
                ));

        // 최근 7일 날짜 목록 (빈 날짜는 0으로)
        List<UserStatsDto.DailySignup> dailySignups = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String date = now.minusDays(i).toLocalDate().format(DateTimeFormatter.ofPattern("MM/dd"));
            dailySignups.add(new UserStatsDto.DailySignup(date, countByDate.getOrDefault(date, 0L)));
        }

        // 최근 10명 가입자
        List<UserStatsDto.RecentUser> recentUsers = userRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .limit(10)
                .map(u -> new UserStatsDto.RecentUser(
                        u.getId(),
                        u.getUsername(),
                        u.getDisplayName(),
                        u.getEmail(),
                        u.getProfile() != null ? u.getProfile().getAvatar() : null,
                        u.getRole() != null ? u.getRole().name() : "USER",
                        u.getCreatedAt() != null
                                ? u.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm"))
                                : "-"
                ))
                .toList();

        return new UserStatsDto(totalUsers, newUsersToday, newUsersThisWeek, newUsersThisMonth, dailySignups, recentUsers);
    }
}
