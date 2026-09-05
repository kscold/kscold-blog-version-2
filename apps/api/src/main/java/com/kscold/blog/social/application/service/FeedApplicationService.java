package com.kscold.blog.social.application.service;

import com.kscold.blog.blog.config.InvalidateBlogCatalogCaches;
import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.application.port.in.UserQueryPort.UserInfo;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.application.dto.response.FeedSitemapResponse;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.model.LinkPreviewResponse;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedApplicationService implements FeedUseCase {

    private final FeedRepository feedRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final UserQueryPort userQueryPort;
    private final LinkScrapingPort linkScrapingPort;

    @Transactional
    @InvalidateBlogCatalogCaches
    public Feed create(FeedCreateCommand command, String userId) {
        String content = normalizeContent(command.getContent());
        List<String> images = normalizeImages(command.getImages());
        validateCreateContent(content, images);
        UserInfo author = userQueryPort.getUserById(userId);

        Feed.LinkPreview linkPreview = null;
        if (command.getLinkUrl() != null && !command.getLinkUrl().isBlank()) {
            LinkPreviewResponse scraped = linkScrapingPort.scrape(command.getLinkUrl());
            linkPreview = toModel(scraped);
        }

        Feed feed =
                Feed.builder()
                        .content(content)
                        .images(new ArrayList<>(images))
                        .author(
                                Feed.AuthorInfo.builder()
                                        .id(author.id())
                                        .username(author.username())
                                        .name(author.displayName())
                                        .avatar(author.avatar())
                                        .build())
                        .visibility(
                                command.getVisibility() != null
                                        ? command.getVisibility()
                                        : Feed.Visibility.PUBLIC)
                        .linkPreview(linkPreview)
                        .build();

        return feedRepository.save(feed);
    }

    @Transactional
    @InvalidateBlogCatalogCaches
    public Feed update(String id, FeedUpdateCommand command) {
        Feed feed = findById(id);

        if (command.getContent() != null) {
            feed.setContent(command.getContent());
        }
        if (command.getImages() != null) {
            feed.setImages(command.getImages());
        }
        if (command.getVisibility() != null) {
            feed.setVisibility(command.getVisibility());
        }
        if (command.getLinkUrl() != null) {
            if (command.getLinkUrl().isBlank()) {
                feed.setLinkPreview(null);
            } else {
                LinkPreviewResponse scraped = linkScrapingPort.scrape(command.getLinkUrl());
                feed.setLinkPreview(toModel(scraped));
            }
        }

        return feedRepository.save(feed);
    }

    @Transactional
    @InvalidateBlogCatalogCaches
    public void delete(String id) {
        Feed feed = findById(id);
        feedCommentRepository.deleteAllByFeedId(id);
        feedRepository.delete(feed);
    }

    public Feed getById(String id) {
        return findById(id);
    }

    public Page<Feed> getPublicFeeds(Pageable pageable) {
        return feedRepository.findByVisibility(Feed.Visibility.PUBLIC, pageable);
    }

    public Page<Feed> getPublicFeedsByTag(String tag, Pageable pageable) {
        return feedRepository.findByVisibilityAndTag(Feed.Visibility.PUBLIC, tag, pageable);
    }

    public Page<Feed> getPublicFeedsByAuthorId(String authorId, Pageable pageable) {
        return feedRepository.findByAuthorIdAndVisibility(
                authorId, Feed.Visibility.PUBLIC, pageable);
    }

    public Page<Feed> getAllFeeds(Pageable pageable) {
        return feedRepository.findAll(pageable);
    }

    @Override
    public List<FeedSitemapResponse> getSitemapIndex() {
        return feedRepository.findAllPublicForSitemap().stream()
                .map(
                        feed ->
                                new FeedSitemapResponse(
                                        feed.id(),
                                        feed.contentLength(),
                                        feed.createdAt(),
                                        feed.updatedAt()))
                .toList();
    }

    public Feed toggleLike(String feedId, String identifier) {
        feedRepository.toggleLike(feedId, identifier);
        return findById(feedId);
    }

    public List<Map<String, Object>> getFeedTags() {
        return feedRepository.aggregateTags();
    }

    @Override
    public Map<String, Long> getFeedTagCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Map<String, Object> row : feedRepository.aggregateTags()) {
            Object name = row.get("name");
            Object count = row.get("count");
            if (name == null || count == null) continue;
            counts.put(name.toString(), ((Number) count).longValue());
        }
        return counts;
    }

    @Override
    @InvalidateBlogCatalogCaches
    public long renameFeedTag(String fromName, String toName) {
        return feedRepository.renameTag(fromName, toName);
    }

    /** 댓글 수 원자적 증가 */
    public void incrementCommentCount(String feedId) {
        feedRepository.incrementCommentCount(feedId);
    }

    /** 댓글 수 원자적 감소 (최소 0) */
    public void decrementCommentCount(String feedId) {
        feedRepository.decrementCommentCount(feedId);
    }

    /** 피드 소유권 검증: 본인 또는 ADMIN만 수정/삭제 가능 */
    public void validateOwnership(String feedId, String userId, boolean isAdmin) {
        Feed feed = findById(feedId);
        if (feed.getAuthor().getId().equals(userId)) {
            return;
        }
        if (!isAdmin) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private Feed findById(String id) {
        return feedRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.feed(id));
    }

    private String normalizeContent(String content) {
        return content == null || content.isBlank() ? "" : content;
    }

    private List<String> normalizeImages(List<String> images) {
        if (images == null) {
            return List.of();
        }
        return images.stream().filter(image -> image != null && !image.isBlank()).toList();
    }

    private void validateCreateContent(String content, List<String> images) {
        if (content.isBlank() && images.isEmpty()) {
            throw InvalidRequestException.invalidInput("내용 또는 이미지를 입력해주세요");
        }
    }

    private Feed.LinkPreview toModel(LinkPreviewResponse response) {
        if (response == null) return null;
        return Feed.LinkPreview.builder()
                .url(response.getUrl())
                .title(response.getTitle())
                .description(response.getDescription())
                .image(response.getImage())
                .siteName(response.getSiteName())
                .build();
    }
}
