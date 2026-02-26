package com.kscold.blog.service;

import com.kscold.blog.dto.request.FeedCreateRequest;
import com.kscold.blog.dto.request.FeedUpdateRequest;
import com.kscold.blog.dto.response.LinkPreviewResponse;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.Feed;
import com.kscold.blog.model.User;
import com.kscold.blog.repository.FeedCommentRepository;
import com.kscold.blog.repository.FeedRepository;
import com.kscold.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedRepository feedRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final UserRepository userRepository;
    private final LinkScrapingService linkScrapingService;

    @Transactional
    public Feed create(FeedCreateRequest request, String userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        String displayName = author.getProfile() != null
                ? author.getProfile().getDisplayName()
                : author.getUsername();
        String avatar = author.getProfile() != null
                ? author.getProfile().getAvatar()
                : null;

        Feed.LinkPreview linkPreview = null;
        if (request.getLinkUrl() != null && !request.getLinkUrl().isBlank()) {
            LinkPreviewResponse scraped = linkScrapingService.scrape(request.getLinkUrl());
            linkPreview = linkScrapingService.toModel(scraped);
        }

        Feed feed = Feed.builder()
                .content(request.getContent())
                .images(request.getImages() != null ? request.getImages() : new ArrayList<>())
                .author(Feed.AuthorInfo.builder()
                        .id(author.getId())
                        .name(displayName)
                        .avatar(avatar)
                        .build())
                .visibility(request.getVisibility() != null ? request.getVisibility() : Feed.Visibility.PUBLIC)
                .linkPreview(linkPreview)
                .build();

        return feedRepository.save(feed);
    }

    @Transactional
    public Feed update(String id, FeedUpdateRequest request) {
        Feed feed = findById(id);

        if (request.getContent() != null) {
            feed.setContent(request.getContent());
        }
        if (request.getImages() != null) {
            feed.setImages(request.getImages());
        }
        if (request.getVisibility() != null) {
            feed.setVisibility(request.getVisibility());
        }
        if (request.getLinkUrl() != null) {
            if (request.getLinkUrl().isBlank()) {
                feed.setLinkPreview(null);
            } else {
                LinkPreviewResponse scraped = linkScrapingService.scrape(request.getLinkUrl());
                feed.setLinkPreview(linkScrapingService.toModel(scraped));
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

    private Feed findById(String id) {
        return feedRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.feed(id));
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

    @Transactional
    public void incrementCommentCount(String feedId) {
        Feed feed = findById(feedId);
        feed.setCommentsCount(feed.getCommentsCount() + 1);
        feedRepository.save(feed);
    }

    @Transactional
    public void decrementCommentCount(String feedId) {
        Feed feed = findById(feedId);
        feed.setCommentsCount(Math.max(0, feed.getCommentsCount() - 1));
        feedRepository.save(feed);
    }
}
