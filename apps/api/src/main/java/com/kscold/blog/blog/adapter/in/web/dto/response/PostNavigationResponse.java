package com.kscold.blog.blog.adapter.in.web.dto.response;

import com.kscold.blog.blog.domain.model.PostNavigation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostNavigationResponse {
    private Entry previous;
    private Entry next;

    public static PostNavigationResponse from(PostNavigation navigation) {
        return new PostNavigationResponse(
                Entry.from(navigation.previous()), Entry.from(navigation.next()));
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Entry {
        private String title;
        private String slug;
        private String categorySlug;

        static Entry from(PostNavigation.Entry entry) {
            return entry == null
                    ? null
                    : new Entry(entry.title(), entry.slug(), entry.categorySlug());
        }
    }
}
