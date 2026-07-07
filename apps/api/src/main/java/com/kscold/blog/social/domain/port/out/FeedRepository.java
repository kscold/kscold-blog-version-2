package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedRepository {
    Optional<Feed> findById(String id);

    Feed save(Feed feed);

    void delete(Feed feed);

    Page<Feed> findByVisibility(Feed.Visibility visibility, Pageable pageable);

    Page<Feed> findByVisibilityAndTag(Feed.Visibility visibility, String tag, Pageable pageable);

    Page<Feed> findAll(Pageable pageable);

    void incrementCommentCount(String feedId);

    void decrementCommentCount(String feedId);

    /** 좋아요 토글 - atomic. 좋아요 추가했으면 true, 취소했으면 false */
    boolean toggleLike(String feedId, String identifier);

    /** 특정 작성자의 공개 피드 */
    Page<Feed> findByAuthorIdAndVisibility(
            String authorId, Feed.Visibility visibility, Pageable pageable);

    /** PUBLIC 피드의 태그별 사용 횟수: [{name, count}] 내림차순 */
    List<Map<String, Object>> aggregateTags();
}
