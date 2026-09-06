package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.Post;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostRepository {
    Optional<Post> findById(String id);

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Post save(Post post);

    Page<Post> findAll(Pageable pageable);

    Page<Post> findByStatus(Post.Status status, Pageable pageable);

    List<Post> findFeaturedPosts(Pageable pageable);

    List<Post> findHotPosts(LocalDateTime since, Pageable pageable);

    List<Post> findAllPublished(Pageable pageable);

    Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable);

    Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable);

    Page<Post> searchByText(String keyword, Pageable pageable);

    long countByStatus(Post.Status status);

    /** 발행된 글의 태그 이름별 사용 횟수. 태그 목록을 매번 세지 않고 한 번의 집계로 가져온다. */
    Map<String, Long> countPublishedByTagName();

    /** 발행된 글의 전체·공개 태그 사용 횟수. 공개 카테고리는 호출 시점의 정책을 따른다. */
    Map<String, PublishedTagCounts> countPublishedTagCounts(Set<String> publicCategoryIds);

    /**
     * 글에 박혀 있는 태그 참조를 다른 태그로 바꾼다. 태그를 합칠 때 쓴다.
     *
     * @return 바뀐 글 수
     */
    long replaceTagReference(String fromTagId, Post.TagInfo targetTag);

    /** 글에 박혀 있는 같은 태그의 표시 정보와 슬러그를 최신 값으로 맞춘다. */
    long updateTagReference(Post.TagInfo tag);

    /** 글에 박혀 있는 카테고리의 표시 정보와 슬러그를 최신 값으로 맞춘다. */
    long updateCategoryReference(Post.CategoryInfo category);

    /** 이 태그를 쓰는 글들의 카테고리별 사용 횟수. 태그를 어느 카테고리로 묶을지 추측할 때 쓴다. */
    Map<String, Long> countCategoriesByTagId(String tagId);

    /** 태그별 발행 글 수와 인증 없이 읽을 수 있는 발행 글 수. */
    record PublishedTagCounts(long postCount, long publicPostCount) {}
}
