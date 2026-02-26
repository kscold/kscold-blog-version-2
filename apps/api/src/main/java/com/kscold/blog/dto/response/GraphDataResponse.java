package com.kscold.blog.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphDataResponse {

    private List<GraphNode> nodes;
    private List<GraphLink> links;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphNode {
        private String id;
        private String name;
        private String slug;
        private Integer size;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphLink {
        private String source;
        private String target;
    }
}
