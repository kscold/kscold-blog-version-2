package com.kscold.blog.social.application.service;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

/**
 * 특정 피드에서 언급(@mention)할 수 있는 사용자와, 댓글 본문에서 실제로 언급된 사용자를 계산한다. 언급 대상 = 블로그 주인(관리자) + 해당 글에 댓글을 단
 * 참여자. 자동완성 엔드포인트와 알림 메일 리스너가 공유한다.
 */
@Component
@RequiredArgsConstructor
public class FeedMentionResolver {

    private final UserRepository userRepository;
    private final FeedCommentRepository feedCommentRepository;

    /** 이 피드에서 언급 가능한 사용자 목록(주인 + 댓글 참여자, 중복 제거). */
    public List<User> mentionableUsers(String feedId) {
        LinkedHashMap<String, User> byId = new LinkedHashMap<>();

        // 주인(관리자) — 아직 댓글을 안 달았어도 항상 포함
        userRepository.findAllOrderByCreatedAtDesc().stream()
                .filter(user -> user.getRole() == User.Role.ADMIN && !user.isDeleted())
                .forEach(user -> byId.put(user.getId(), user));

        // 해당 글 댓글 참여자
        feedCommentRepository.findByFeedId(feedId, Pageable.unpaged()).getContent().stream()
                .map(FeedComment::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .forEach(
                        userId ->
                                userRepository
                                        .findById(userId)
                                        .filter(user -> !user.isDeleted())
                                        .ifPresent(user -> byId.putIfAbsent(user.getId(), user)));

        return new ArrayList<>(byId.values());
    }

    /** 후보 중 본문에서 실제 @언급된 사용자만 추린다(displayName 또는 username 기준). */
    public List<User> detectMentioned(String content, List<User> candidates) {
        if (content == null || content.isBlank()) {
            return List.of();
        }
        List<User> mentioned = new ArrayList<>();
        for (User user : candidates) {
            if (containsMention(content, user.getDisplayName())
                    || containsMention(content, user.getUsername())) {
                mentioned.add(user);
            }
        }
        return mentioned;
    }

    /** 본문에 "@name" 토큰이 온전한 경계로 포함되는지(부분 매칭·이메일 제외). */
    private boolean containsMention(String content, String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        String token = "@" + name;
        int idx = 0;
        while ((idx = content.indexOf(token, idx)) >= 0) {
            char prev = idx > 0 ? content.charAt(idx - 1) : ' ';
            int afterIdx = idx + token.length();
            char next = afterIdx < content.length() ? content.charAt(afterIdx) : ' ';
            boolean prevIsBoundary = !Character.isLetterOrDigit(prev); // 이메일(foo@name) 방지
            boolean nextIsBoundary = !Character.isLetterOrDigit(next) && next != '_';
            if (prevIsBoundary && nextIsBoundary) {
                return true;
            }
            idx = afterIdx;
        }
        return false;
    }
}
