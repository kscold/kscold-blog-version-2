package com.kscold.blog.blog.adapter.in.web.dto.response;

import com.kscold.blog.blog.domain.model.TagUsage;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 글·피드 사용량을 합친 태그 목록 응답. 화면에서 두 곳을 따로 불러 합치지 않도록 한 번에 내려준다. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagUsageResponse {

    private String id;
    private String name;
    private String slug;
    private String categoryId;
    private String categoryName;
    private long postCount;
    private long feedCount;
    private long totalCount;

    /** 아직 tags 컬렉션에 등록되지 않은 태그. 어드민에서 재색인 대상으로 표시한다. */
    private boolean unregistered;

    public static TagUsageResponse from(TagUsage usage) {
        return TagUsageResponse.builder()
                .id(usage.id())
                .name(usage.name())
                .slug(usage.slug())
                .categoryId(usage.categoryId())
                .categoryName(usage.categoryName())
                .postCount(usage.postCount())
                .feedCount(usage.feedCount())
                .totalCount(usage.totalCount())
                .unregistered(usage.isUnregistered())
                .build();
    }

    public static List<TagUsageResponse> from(List<TagUsage> usages) {
        return usages.stream().map(TagUsageResponse::from).toList();
    }
}
