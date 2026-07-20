package com.kscold.blog.social.adapter.out.external;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.domain.model.ExternalArticle;
import com.kscold.blog.social.domain.model.LinkPreviewResponse;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LinkScrapingAdapter implements LinkScrapingPort {

    private static final int TIMEOUT_MS = 5000;
    private static final int MAX_BODY_SIZE_BYTES = 1_000_000;
    private static final int MAX_ARTICLE_LENGTH = 12_000;

    @Override
    public LinkPreviewResponse scrape(String url) {
        validateUrl(url);

        try {
            return toPreview(url, fetchDocument(url));
        } catch (IOException e) {
            log.warn("링크 스크래핑 실패 (네트워크): {} - {}", url, e.getMessage());
            return LinkPreviewResponse.builder().url(url).build();
        } catch (Exception e) {
            log.error("링크 스크래핑 실패 (예상치 못한 오류): {} - {}", url, e.getMessage());
            return LinkPreviewResponse.builder().url(url).build();
        }
    }

    @Override
    public ExternalArticle extract(String url) {
        validateUrl(url);

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
            log.warn("외부 글 본문 추출 실패 (네트워크): {} - {}", url, e.getMessage());
            return new ExternalArticle(url, "", "", "", "");
        } catch (Exception e) {
            log.error("외부 글 본문 추출 실패 (예상치 못한 오류): {} - {}", url, e.getMessage());
            return new ExternalArticle(url, "", "", "", "");
        }
    }

    private Document fetchDocument(String url) throws IOException {
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; KscoldBot/1.0)")
                .timeout(TIMEOUT_MS)
                .maxBodySize(MAX_BODY_SIZE_BYTES)
                .followRedirects(true)
                .get();
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

    /** SSRF 방어: URL scheme 검증 + 내부 IP 대역 차단 */
    private void validateUrl(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equals("http") && !scheme.equals("https"))) {
                throw InvalidRequestException.invalidInput("http/https URL만 허용됩니다");
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                throw InvalidRequestException.invalidInput("유효하지 않은 URL입니다");
            }

            InetAddress address = InetAddress.getByName(host);
            if (isInternalAddress(address, host)) {
                throw InvalidRequestException.invalidInput("내부 네트워크 주소로의 요청은 허용되지 않습니다");
            }
        } catch (UnknownHostException e) {
            throw InvalidRequestException.invalidInput("호스트를 확인할 수 없습니다: " + e.getMessage());
        } catch (InvalidRequestException e) {
            throw e;
        } catch (Exception e) {
            throw InvalidRequestException.invalidInput("유효하지 않은 URL입니다: " + e.getMessage());
        }
    }

    private boolean isInternalAddress(InetAddress address, String host) {
        return address.isLoopbackAddress()
                || address.isSiteLocalAddress()
                || address.isLinkLocalAddress()
                || address.isAnyLocalAddress()
                || "localhost".equalsIgnoreCase(host)
                || host.endsWith(".local");
    }
}
