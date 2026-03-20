package com.kscold.blog.social.adapter.out.external;

import com.kscold.blog.social.application.dto.LinkPreviewResponse;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;

@Slf4j
@Component
public class LinkScrapingAdapter implements LinkScrapingPort {

    private static final int TIMEOUT_MS = 5000;

    @Override
    public LinkPreviewResponse scrape(String url) {
        validateUrl(url);

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

    /**
     * SSRF 방어: URL scheme 검증 + 내부 IP 대역 차단
     */
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
