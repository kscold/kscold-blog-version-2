package com.kscold.blog.social.adapter.out.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.GitHubContributionDay;
import com.kscold.blog.social.application.dto.GitHubRepositorySummary;
import com.kscold.blog.social.domain.port.out.GitHubPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.StreamSupport;

@Slf4j
@Component
@RequiredArgsConstructor
public class GitHubAdapter implements GitHubPort {

    private static final int TIMEOUT_MS = 5000;
    private static final String USER_AGENT = "Mozilla/5.0 (compatible; KscoldHome/2.0)";

    private final ObjectMapper objectMapper;

    @Value("${github.token:}")
    private String githubToken;

    @Override
    public GitHubProfileSnapshot fetchProfile(String username) {
        try {
            JsonNode root = readJson("https://api.github.com/users/" + username);
            return new GitHubProfileSnapshot(
                    root.path("login").asText(username),
                    root.path("name").asText(root.path("login").asText(username)),
                    root.path("avatar_url").asText(""),
                    root.path("html_url").asText("https://github.com/" + username),
                    root.path("bio").asText(""),
                    root.path("followers").asInt(0),
                    root.path("following").asInt(0),
                    root.path("public_repos").asInt(0)
            );
        } catch (IOException e) {
            log.warn("GitHub profile fetch failed: {}", e.getMessage());
            throw InvalidRequestException.invalidInput("GitHub 프로필을 불러오지 못했습니다");
        }
    }

    @Override
    public ContributionResult fetchContributionDays(String username, int year) {
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to = year == LocalDate.now().getYear() ? LocalDate.now() : LocalDate.of(year, 12, 31);
        return fetchContributionRange(username, from, to);
    }

    @Override
    public ContributionResult fetchContributionDays(String username) {
        return fetchContributionRange(username, LocalDate.now().minusDays(364), LocalDate.now());
    }

    private ContributionResult fetchContributionRange(String username, LocalDate from, LocalDate to) {
        String url = "https://github.com/users/" + username + "/contributions?from=" + from + "&to=" + to;
        try {
            String body = baseConnection(url).ignoreContentType(true).execute().body();
            Document document = Jsoup.parse(body, "", Parser.htmlParser());
            var elements = document.select("td[data-date]");
            if (elements.isEmpty()) elements = document.select("rect[data-date]");
            var days = elements.stream()
                    .map(this::toContributionDay)
                    .filter(day -> day.date() != null && !day.date().isBlank())
                    .sorted(Comparator.comparing(GitHubContributionDay::date))
                    .toList();
            // HTML 헤더에서 실제 total 파싱: "511 contributions in 2026"
            int total = 0;
            var h2 = document.select("h2").first();
            if (h2 != null) {
                var matcher = java.util.regex.Pattern.compile("([\\d,]+)\\s+contribution").matcher(h2.text());
                if (matcher.find()) total = parseInt(matcher.group(1).replace(",", ""));
            }
            return new ContributionResult(days, total);
        } catch (IOException e) {
            log.warn("GitHub contributions fetch failed: {}", e.getMessage());
            return new ContributionResult(List.of(), 0);
        }
    }

    @Override
    public List<GitHubRepositorySummary> fetchTopRepositories(String username) {
        try {
            JsonNode root = readJson("https://api.github.com/users/" + username + "/repos?per_page=100&sort=updated");
            return StreamSupport.stream(root.spliterator(), false)
                    .filter(node -> !node.path("fork").asBoolean(false))
                    .map(node -> new GitHubRepositorySummary(
                            node.path("name").asText(),
                            node.path("html_url").asText(),
                            node.path("description").asText(""),
                            node.path("language").asText(""),
                            node.path("stargazers_count").asInt(0),
                            node.path("updated_at").asText("")
                    ))
                    .sorted(Comparator.comparingInt(GitHubRepositorySummary::stars).reversed())
                    .limit(3)
                    .toList();
        } catch (IOException e) {
            log.warn("GitHub repository fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    private GitHubContributionDay toContributionDay(Element element) {
        int level = parseInt(element.attr("data-level"));
        int count = parseInt(element.attr("data-count"));
        // GitHub 새 table 형식은 data-count가 없음 → level 기반 추정
        if (count == 0 && level > 0) {
            count = switch (level) {
                case 1 -> 1;
                case 2 -> 3;
                case 3 -> 6;
                case 4 -> 10;
                default -> 0;
            };
        }
        return new GitHubContributionDay(element.attr("data-date"), count, level);
    }

    private JsonNode readJson(String url) throws IOException {
        Connection connection = baseConnection(url)
                .ignoreContentType(true)
                .header("Accept", "application/vnd.github+json");
        if (!githubToken.isBlank()) {
            connection.header("Authorization", "Bearer " + githubToken);
        }
        return objectMapper.readTree(connection.execute().body());
    }

    private Connection baseConnection(String url) {
        return Jsoup.connect(url)
                .userAgent(USER_AGENT)
                .timeout(TIMEOUT_MS)
                .followRedirects(true);
    }

    private int parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
