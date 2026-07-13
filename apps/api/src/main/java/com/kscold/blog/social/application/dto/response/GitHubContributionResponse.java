package com.kscold.blog.social.application.dto.response;

import com.kscold.blog.social.domain.model.GitHubContributionDay;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GitHubContributionResponse {

    private int total;

    private List<GitHubContributionDay> days;
}
