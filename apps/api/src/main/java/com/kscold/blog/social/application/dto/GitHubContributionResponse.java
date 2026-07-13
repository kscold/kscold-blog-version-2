package com.kscold.blog.social.application.dto;

import com.kscold.blog.social.domain.model.GitHubContributionDay;
import java.util.List;

public record GitHubContributionResponse(int total, List<GitHubContributionDay> days) {}
