package com.kscold.blog.vault.application.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GraphDataResponse {

    private List<GraphNode> nodes;
    private List<GraphLink> links;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GraphNode {
        private String id;
        private String name;
        private String slug;
        private Integer size;
        private String folderId;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class GraphLink {
        private String source;
        private String target;
    }
}
