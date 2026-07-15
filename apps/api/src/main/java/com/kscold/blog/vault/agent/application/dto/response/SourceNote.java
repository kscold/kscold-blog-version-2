package com.kscold.blog.vault.agent.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SourceNote {

    private String id;
    private String title;
    private String slug;
    private double score;
    private String type;
    private String path;
    private String excerpt;
}
