package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.domain.model.Feed;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 피드 생성과 수정에 같은 입력 제한과 정규화 규칙을 적용한다. */
@Component
public class FeedInputPolicy {

    public static final int CONTENT_MAX_LENGTH = 10_000;
    public static final int IMAGE_MAX_COUNT = 4;
    public static final int URL_MAX_LENGTH = 2_048;

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Set<Integer> LINK_PORTS = Set.of(80, 443);

    private final URI imageOrigin;
    private final String imagePathPrefix;

    public FeedInputPolicy(
            @Value("${minio.public-url:https://bucket.kscold.com}") String publicUrl,
            @Value("${minio.bucket:blog}") String bucket) {
        this.imageOrigin = parseImageOrigin(publicUrl);
        this.imagePathPrefix = "/" + validateBucket(bucket) + "/";
    }

    public PreparedCreate prepareCreate(FeedCreateCommand command) {
        String content = normalizeContent(command.getContent());
        List<String> images = normalizeImages(command.getImages());
        validateHasContent(content, images);
        return new PreparedCreate(
                content,
                images,
                command.getVisibility() == null ? Feed.Visibility.PUBLIC : command.getVisibility(),
                normalizeLinkUrl(command.getLinkUrl()));
    }

    public PreparedUpdate prepareUpdate(Feed current, FeedUpdateCommand command) {
        String content =
                normalizeContent(
                        command.getContent() == null ? current.getContent() : command.getContent());
        List<String> images =
                normalizeImages(
                        command.getImages() == null ? current.getImages() : command.getImages());
        validateHasContent(content, images);
        return new PreparedUpdate(
                content,
                images,
                command.getVisibility() == null ? current.getVisibility() : command.getVisibility(),
                normalizeLinkUpdate(command.getLinkUrl()));
    }

    private String normalizeContent(String content) {
        if (content == null) {
            return "";
        }
        if (content.length() > CONTENT_MAX_LENGTH) {
            throw InvalidRequestException.invalidInput("피드 내용은 10,000자까지 입력할 수 있습니다");
        }
        return content.isBlank() ? "" : content;
    }

    private List<String> normalizeImages(List<String> images) {
        if (images == null) {
            return List.of();
        }
        if (images.size() > IMAGE_MAX_COUNT) {
            throw InvalidRequestException.invalidInput("이미지는 최대 4개까지 첨부할 수 있습니다");
        }

        List<String> normalized = new ArrayList<>(images.size());
        Set<String> unique = new HashSet<>();
        for (String image : images) {
            String normalizedImage = normalizeImageUrl(image);
            if (!unique.add(normalizedImage)) {
                throw InvalidRequestException.invalidInput("중복된 이미지는 첨부할 수 없습니다");
            }
            normalized.add(normalizedImage);
        }
        return List.copyOf(normalized);
    }

    private String normalizeImageUrl(String rawUrl) {
        String value = requireUrl(rawUrl, "이미지 URL을 확인해주세요");
        URI uri = parseUri(value, "이미지 URL을 확인해주세요");
        validateImageOrigin(uri);
        String path = validateImagePath(uri);
        try {
            String normalized =
                    new URI("https", null, normalizeHost(uri), -1, path, null, null)
                            .toASCIIString();
            if (normalized.length() > URL_MAX_LENGTH) {
                throw InvalidRequestException.invalidInput("이미지 URL을 확인해주세요");
            }
            return normalized;
        } catch (URISyntaxException exception) {
            throw InvalidRequestException.invalidInput("이미지 URL을 확인해주세요");
        }
    }

    private void validateImageOrigin(URI uri) {
        if (!"https".equalsIgnoreCase(uri.getScheme())
                || uri.getHost() == null
                || uri.getRawUserInfo() != null
                || uri.getRawQuery() != null
                || uri.getRawFragment() != null
                || (uri.getPort() != -1 && uri.getPort() != 443)) {
            throw InvalidRequestException.invalidInput("허용된 이미지 URL이 아닙니다");
        }
        if (!normalizeHost(uri).equals(imageOrigin.getHost())) {
            throw InvalidRequestException.invalidInput("허용된 이미지 저장소가 아닙니다");
        }
    }

    private String validateImagePath(URI uri) {
        String rawPath = uri.getRawPath();
        String path = uri.getPath();
        if (rawPath == null
                || path == null
                || rawPath.indexOf('\\') >= 0
                || path.indexOf('\\') >= 0
                || hasUnsafeEncoding(rawPath)
                || !rawPath.equals(uri.normalize().getRawPath())
                || hasDotSegment(path)
                || !path.startsWith(imagePathPrefix)) {
            throw InvalidRequestException.invalidInput("이미지 경로를 확인해주세요");
        }
        if (path.chars().anyMatch(Character::isISOControl) || !hasImageExtension(path)) {
            throw InvalidRequestException.invalidInput("허용되지 않는 이미지 형식입니다");
        }
        return path;
    }

    private boolean hasUnsafeEncoding(String rawPath) {
        String path = rawPath.toLowerCase(Locale.ROOT);
        return path.contains("%2e")
                || path.contains("%2f")
                || path.contains("%5c")
                || path.contains("%25");
    }

    private boolean hasDotSegment(String path) {
        for (String segment : path.split("/", -1)) {
            if (segment.equals(".") || segment.equals("..")) {
                return true;
            }
        }
        return false;
    }

    private boolean hasImageExtension(String path) {
        int separator = path.lastIndexOf('/');
        int dot = path.lastIndexOf('.');
        return dot > separator
                && IMAGE_EXTENSIONS.contains(path.substring(dot + 1).toLowerCase(Locale.ROOT));
    }

    private String normalizeLinkUrl(String rawUrl) {
        if (rawUrl == null) {
            return null;
        }
        if (rawUrl.length() > URL_MAX_LENGTH) {
            throw InvalidRequestException.invalidInput("링크 URL을 확인해주세요");
        }
        if (rawUrl.isBlank()) {
            return null;
        }
        String value = requireUrl(rawUrl, "링크 URL을 확인해주세요");
        URI uri = parseUri(value, "링크 URL을 확인해주세요");
        String scheme = uri.getScheme();
        if (scheme == null
                || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))
                || uri.getHost() == null
                || uri.getRawUserInfo() != null
                || (uri.getPort() != -1 && !LINK_PORTS.contains(uri.getPort()))) {
            throw InvalidRequestException.invalidInput("http/https 링크 URL을 확인해주세요");
        }
        return value;
    }

    private LinkUpdate normalizeLinkUpdate(String rawUrl) {
        if (rawUrl == null) {
            return LinkUpdate.unchanged();
        }
        String normalized = normalizeLinkUrl(rawUrl);
        return normalized == null ? LinkUpdate.remove() : LinkUpdate.replace(normalized);
    }

    private String requireUrl(String rawUrl, String message) {
        if (rawUrl == null || rawUrl.isBlank() || rawUrl.length() > URL_MAX_LENGTH) {
            throw InvalidRequestException.invalidInput(message);
        }
        return rawUrl.trim();
    }

    private URI parseUri(String value, String message) {
        try {
            return new URI(value);
        } catch (URISyntaxException exception) {
            throw InvalidRequestException.invalidInput(message);
        }
    }

    private void validateHasContent(String content, List<String> images) {
        if (content.isEmpty() && images.isEmpty()) {
            throw InvalidRequestException.invalidInput("내용 또는 이미지를 입력해주세요");
        }
    }

    private URI parseImageOrigin(String value) {
        URI uri = parseConfigurationUri(value);
        String path = uri.getPath();
        if (!"https".equalsIgnoreCase(uri.getScheme())
                || uri.getHost() == null
                || uri.getRawUserInfo() != null
                || uri.getRawQuery() != null
                || uri.getRawFragment() != null
                || (uri.getPort() != -1 && uri.getPort() != 443)
                || (path != null && !path.isEmpty() && !path.equals("/"))) {
            throw new IllegalStateException("minio.public-url은 HTTPS origin이어야 합니다");
        }
        try {
            return new URI("https", null, normalizeHost(uri), -1, null, null, null);
        } catch (URISyntaxException exception) {
            throw new IllegalStateException("minio.public-url 설정이 올바르지 않습니다", exception);
        }
    }

    private URI parseConfigurationUri(String value) {
        try {
            return new URI(value == null ? "" : value.trim());
        } catch (URISyntaxException exception) {
            throw new IllegalStateException("minio.public-url 설정이 올바르지 않습니다", exception);
        }
    }

    private String validateBucket(String value) {
        String bucket = value == null ? "" : value.trim();
        if (!bucket.matches("[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]") || bucket.contains("..")) {
            throw new IllegalStateException("minio.bucket 설정이 올바르지 않습니다");
        }
        return bucket;
    }

    private String normalizeHost(URI uri) {
        return uri.getHost().toLowerCase(Locale.ROOT);
    }

    public record PreparedCreate(
            String content, List<String> images, Feed.Visibility visibility, String linkUrl) {}

    public record PreparedUpdate(
            String content,
            List<String> images,
            Feed.Visibility visibility,
            LinkUpdate linkUpdate) {}

    public record LinkUpdate(LinkAction action, String url) {

        private static LinkUpdate unchanged() {
            return new LinkUpdate(LinkAction.UNCHANGED, null);
        }

        private static LinkUpdate remove() {
            return new LinkUpdate(LinkAction.REMOVE, null);
        }

        private static LinkUpdate replace(String url) {
            return new LinkUpdate(LinkAction.REPLACE, url);
        }
    }

    public enum LinkAction {
        UNCHANGED,
        REMOVE,
        REPLACE
    }
}
