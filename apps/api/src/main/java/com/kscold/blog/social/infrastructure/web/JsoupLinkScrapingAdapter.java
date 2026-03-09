package com.kscold.blog.social.infrastructure.web;

import com.kscold.blog.social.domain.dto.LinkPreviewResponse;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JsoupLinkScrapingAdapter implements LinkScrapingPort {

    @Override
    public LinkPreviewResponse scrape(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(5000)
                    .get();

            String title = getMetaContent(doc, "og:title");
            if (title == null || title.isBlank()) {
                title = doc.title();
            }

            String description = getMetaContent(doc, "og:description");
            if (description == null || description.isBlank()) {
                description = getMetaContent(doc, "description");
            }

            String image = getMetaContent(doc, "og:image");
            String siteName = getMetaContent(doc, "og:site_name");

            return LinkPreviewResponse.builder()
                    .url(url)
                    .title(title)
                    .description(description)
                    .image(image)
                    .siteName(siteName)
                    .build();
        } catch (Exception e) {
            log.warn("링크 스크래핑 실패: {} - {}", url, e.getMessage());
            return LinkPreviewResponse.builder()
                    .url(url)
                    .build();
        }
    }

    private String getMetaContent(Document doc, String property) {
        String content = doc.select("meta[property=" + property + "]").attr("content");
        if (content == null || content.isBlank()) {
            content = doc.select("meta[name=" + property + "]").attr("content");
        }
        return content.isBlank() ? null : content;
    }
}
