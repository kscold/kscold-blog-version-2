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

        /** 그래프에서의 표시 크기 — 연결된 링크 수 기준. 본문 분량과는 무관함. */
        private Integer size;

        /** 본문 글자 수. 사이트맵이 분량 미달 노트를 색인 대상에서 걸러내는 데 사용함. */
        private Integer contentLength;

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
