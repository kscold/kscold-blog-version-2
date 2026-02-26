package com.kscold.blog.service;

import com.kscold.blog.dto.response.LinkPreviewResponse;
import com.kscold.blog.model.Feed;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LinkScrapingService {

    private static final int TIMEOUT_MS = 5000;

    /**
     * URL에서 OG 메타데이터를 추출하여 LinkPreviewResponse 반환
     */
    public LinkPreviewResponse scrape(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; KscoldBot/1.0)")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
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
            log.warn("Failed to scrape URL: {} - {}", url, e.getMessage());
            return LinkPreviewResponse.builder()
                    .url(url)
                    .build();
        }
    }

    /**
     * LinkPreviewResponse를 Feed.LinkPreview 모델로 변환
     */
    public Feed.LinkPreview toModel(LinkPreviewResponse response) {
        if (response == null) return null;
        return Feed.LinkPreview.builder()
                .url(response.getUrl())
                .title(response.getTitle())
                .description(response.getDescription())
                .image(response.getImage())
                .siteName(response.getSiteName())
                .build();
    }

    private String getMetaContent(Document doc, String property) {
        Element ogTag = doc.selectFirst("meta[property=" + property + "]");
        if (ogTag != null) {
            return ogTag.attr("content");
        }
        Element nameTag = doc.selectFirst("meta[name=" + property + "]");
        if (nameTag != null) {
            return nameTag.attr("content");
        }
        return null;
    }
}
