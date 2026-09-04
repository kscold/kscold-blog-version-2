package com.kscold.blog.social.adapter.out.external;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.domain.model.ExternalArticle;
import com.kscold.blog.social.domain.model.LinkPreviewResponse;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.io.IOException;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LinkScrapingAdapter implements LinkScrapingPort {

    private static final int TIMEOUT_MS = 5000;
    private static final int MAX_BODY_SIZE_BYTES = 1_000_000;
    private static final int MAX_ARTICLE_LENGTH = 12_000;
    private static final int MAX_REDIRECTS = 5;

    private final PublicHttpUrlPolicy publicHttpUrlPolicy;

    @Override
    public LinkPreviewResponse scrape(String url) {
        publicHttpUrlPolicy.validate(url);

        try {
            return toPreview(url, fetchDocument(url));
        } catch (IOException e) {
            log.warn(
                    "링크 스크래핑 네트워크 실패: host={}, type={}",
                    safeHost(url),
                    e.getClass().getSimpleName());
            return LinkPreviewResponse.builder().url(url).build();
        } catch (InvalidRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error(
                    "링크 스크래핑 처리 실패: host={}, type={}", safeHost(url), e.getClass().getSimpleName());
            return LinkPreviewResponse.builder().url(url).build();
        }
    }

    @Override
    public ExternalArticle extract(String url) {
        publicHttpUrlPolicy.validate(url);

        try {
            Document document = fetchDocument(url);
            LinkPreviewResponse preview = toPreview(url, document);
            return new ExternalArticle(
                    url,
                    preview.getTitle(),
                    preview.getDescription(),
                    preview.getSiteName(),
                    extractReadableText(document));
        } catch (IOException e) {
            log.warn(
                    "외부 글 본문 추출 네트워크 실패: host={}, type={}",
                    safeHost(url),
                    e.getClass().getSimpleName());
            return new ExternalArticle(url, "", "", "", "");
        } catch (InvalidRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error(
                    "외부 글 본문 추출 처리 실패: host={}, type={}",
                    safeHost(url),
                    e.getClass().getSimpleName());
            return new ExternalArticle(url, "", "", "", "");
        }
    }

    private Document fetchDocument(String url) throws IOException {
        URI current = publicHttpUrlPolicy.validate(url);
        long deadlineNanos = System.nanoTime() + TIMEOUT_MS * 1_000_000L;
        for (int redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
            int remainingTimeoutMs = remainingTimeoutMs(deadlineNanos);
            Connection.Response response =
                    Jsoup.connect(current.toString())
                            .userAgent("Mozilla/5.0 (compatible; KscoldBot/1.0)")
                            .timeout(remainingTimeoutMs)
                            .maxBodySize(MAX_BODY_SIZE_BYTES)
                            .followRedirects(false)
                            .execute();

            if (!isRedirect(response.statusCode())) {
                return response.parse();
            }
            if (redirectCount == MAX_REDIRECTS) {
                throw new IOException("허용된 리디렉션 횟수를 초과했습니다");
            }
            current = publicHttpUrlPolicy.resolveRedirect(current, response.header("Location"));
        }
        throw new IOException("외부 문서를 가져오지 못했습니다");
    }

    private int remainingTimeoutMs(long deadlineNanos) throws IOException {
        long remainingNanos = deadlineNanos - System.nanoTime();
        if (remainingNanos <= 0) {
            throw new IOException("외부 문서 요청 시간이 초과되었습니다");
        }
        return Math.max(1, (int) Math.min(TIMEOUT_MS, remainingNanos / 1_000_000L));
    }

    private boolean isRedirect(int statusCode) {
        return statusCode >= 300 && statusCode < 400;
    }

    private LinkPreviewResponse toPreview(String url, Document document) {
        String title = getMetaContent(document, "og:title");
        if (title == null || title.isBlank()) {
            title = document.title();
        }

        String description = getMetaContent(document, "og:description");
        if (description == null || description.isBlank()) {
            description = getMetaContent(document, "description");
        }

        return LinkPreviewResponse.builder()
                .url(url)
                .title(title)
                .description(description)
                .image(getMetaContent(document, "og:image"))
                .siteName(getMetaContent(document, "og:site_name"))
                .build();
    }

    /** 광고와 탐색 요소를 제거한 뒤 피드 초안에 필요한 본문 텍스트만 제한해서 전달함. */
    private String extractReadableText(Document document) {
        Element content =
                document.selectFirst(
                        "article, main, [role=main], .article-body, .post-content, .entry-content, .content");
        Element readable = (content == null ? document.body() : content).clone();
        readable.select("script, style, nav, footer, aside, form, noscript, iframe").remove();
        String text = readable.text().replaceAll("\\s+", " ").trim();
        return text.substring(0, Math.min(text.length(), MAX_ARTICLE_LENGTH));
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

    private String safeHost(String url) {
        try {
            String host = URI.create(url).getHost();
            return host == null || host.isBlank() ? "invalid" : host;
        } catch (Exception e) {
            return "invalid";
        }
    }
}
