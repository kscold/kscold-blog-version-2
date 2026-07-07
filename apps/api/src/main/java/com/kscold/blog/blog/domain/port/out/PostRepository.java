package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.Post;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
}
