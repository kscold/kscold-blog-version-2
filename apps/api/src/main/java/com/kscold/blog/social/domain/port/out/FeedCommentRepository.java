package com.kscold.blog.social.domain.port.out;

import com.kscold.blog.social.domain.model.FeedComment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedCommentRepository {
    Optional<FeedComment> findById(String id);

    FeedComment save(FeedComment comment);

    List<FeedComment> saveAll(List<FeedComment> comments);

    void delete(FeedComment comment);

    Page<FeedComment> findByFeedId(String feedId, Pageable pageable);

    List<FeedComment> findAnonymousByFeedIdAndAuthorNames(String feedId, List<String> authorNames);

    void deleteAllByFeedId(String feedId);

    /**
     * 좋아요를 토글한다. 동시에 눌러도 수가 어긋나지 않도록 한 번의 원자적 갱신으로 처리한다.
     *
     * @return 추가됐으면 true, 취소됐으면 false
     */
    boolean toggleLike(String commentId, String identifier);
}
