package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.response.GitHubContributionResponse;
import com.kscold.blog.social.application.dto.response.GitHubOverviewResponse;
import com.kscold.blog.social.application.port.in.GitHubUseCase;
import com.kscold.blog.social.domain.port.out.GitHubPort;
import java.time.LocalDate;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GitHubApplicationService implements GitHubUseCase {

    private static final int GITHUB_FIRST_YEAR = 2008;
    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$");

    private final GitHubPort gitHubPort;

    @Override
    @Cacheable(
            cacheNames = "githubContributions",
            cacheManager = "githubCacheManager",
            key = "#username?.toLowerCase() + ':' + (#year == null ? 'rolling' : #year)",
            sync = true)
    public GitHubContributionResponse getContributions(String username, Integer year) {
        String normalizedUsername = validateUsername(username);
        validateYear(year);
        var result =
                year != null
                        ? gitHubPort.fetchContributionDays(normalizedUsername, year)
                        : gitHubPort.fetchContributionDays(normalizedUsername);
        return new GitHubContributionResponse(result.total(), result.days());
    }

    @Override
    @Cacheable(
            cacheNames = "githubOverview",
            cacheManager = "githubCacheManager",
            key = "#username?.toLowerCase()",
            sync = true)
    public GitHubOverviewResponse getOverview(String username) {
        String normalizedUsername = validateUsername(username);
        var profile = gitHubPort.fetchProfile(normalizedUsername);
        var result = gitHubPort.fetchContributionDays(normalizedUsername);
        return new GitHubOverviewResponse(
                profile.username(),
                profile.displayName(),
                profile.avatarUrl(),
                profile.profileUrl(),
                profile.bio(),
                profile.followers(),
                profile.following(),
                profile.publicRepos(),
                result.total(),
                result.days(),
                gitHubPort.fetchTopRepositories(normalizedUsername));
    }

    private String validateUsername(String username) {
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            throw InvalidRequestException.invalidInput("올바른 GitHub 사용자명을 입력해 주세요");
        }
        return username.toLowerCase(Locale.ROOT);
    }

    private void validateYear(Integer year) {
        if (year != null && (year < GITHUB_FIRST_YEAR || year > LocalDate.now().getYear())) {
            throw InvalidRequestException.invalidInput("조회할 수 없는 GitHub 기여 연도입니다");
        }
    }
}
