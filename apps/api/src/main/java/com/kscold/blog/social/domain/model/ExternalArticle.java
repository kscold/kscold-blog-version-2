package com.kscold.blog.social.domain.model;

import org.springframework.util.StringUtils;

/** 외부 링크에서 피드 초안 작성에 필요한 최소 텍스트만 정리한 값 객체. */
public record ExternalArticle(
        String url, String title, String description, String siteName, String content) {

    public ExternalArticle {
        url = url == null ? "" : url;
        title = title == null ? "" : title;
        description = description == null ? "" : description;
        siteName = siteName == null ? "" : siteName;
        content = content == null ? "" : content;
    }

    public static ExternalArticle empty() {
        return new ExternalArticle("", "", "", "", "");
    }

    public boolean hasReadableContent() {
        return StringUtils.hasText(title)
                || StringUtils.hasText(description)
                || StringUtils.hasText(content);
    }
}
