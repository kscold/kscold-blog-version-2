package com.kscold.blog.social.application.service;

import com.kscold.blog.dto.response.LinkPreviewResponse;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.application.port.in.UserQueryPort.UserInfo;
import com.kscold.blog.social.application.dto.FeedCreateCommand;
import com.kscold.blog.social.application.dto.FeedUpdateCommand;
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FeedApplicationService {

    private final FeedRepository feedRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final UserQueryPort userQueryPort;
    private final LinkScrapingPort linkScrapingPort;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public Feed create(FeedCreateCommand command, String userId) {
        UserInfo author = userQueryPort.getUserById(userId);

        Feed.LinkPreview linkPreview = null;
        if (command.getLinkUrl() != null && !command.getLinkUrl().isBlank()) {
            LinkPreviewResponse scraped = linkScrapingPort.scrape(command.getLinkUrl());
            linkPreview = toModel(scraped);
        }

        Feed feed = Feed.builder()
                .content(command.getContent())
                .images(command.getImages() != null ? command.getImages() : new ArrayList<>())
                .author(Feed.AuthorInfo.builder()
                        .id(author.id())
                        .name(author.displayName())
                        .avatar(author.avatar())
                        .build())
                .visibility(command.getVisibility() != null ? command.getVisibility() : Feed.Visibility.PUBLIC)
                .linkPreview(linkPreview)
                .build();

        return feedRepository.save(feed);
    }

    @Transactional
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
    public void delete(String id) {
        Feed feed = findById(id);
        feedCommentRepository.deleteAllByFeedId(id);
        feedRepository.delete(feed);
    }

    @Transactional
    public Feed getById(String id) {
        Feed feed = findById(id);
        feed.setViews(feed.getViews() + 1);
        return feedRepository.save(feed);
    }

    public Page<Feed> getPublicFeeds(Pageable pageable) {
        return feedRepository.findByVisibility(Feed.Visibility.PUBLIC, pageable);
    }

    public Page<Feed> getAllFeeds(Pageable pageable) {
        return feedRepository.findAll(pageable);
    }

    @Transactional
    public Feed toggleLike(String feedId, String identifier) {
        Feed feed = findById(feedId);

        if (feed.getLikedBy().contains(identifier)) {
            feed.getLikedBy().remove(identifier);
            feed.setLikesCount(Math.max(0, feed.getLikesCount() - 1));
        } else {
            feed.getLikedBy().add(identifier);
            feed.setLikesCount(feed.getLikesCount() + 1);
        }

        return feedRepository.save(feed);
    }

    /**
     * 댓글 수 원자적 증가
     */
    public void incrementCommentCount(String feedId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(feedId)),
                new Update().inc("commentsCount", 1),
                Feed.class
        );
    }

    /**
     * 댓글 수 원자적 감소 (최소 0)
     */
    public void decrementCommentCount(String feedId) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(feedId).and("commentsCount").gt(0)),
                new Update().inc("commentsCount", -1),
                Feed.class
        );
    }

    private Feed findById(String id) {
        return feedRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.feed(id));
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
