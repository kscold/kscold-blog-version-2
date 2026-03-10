package com.kscold.blog.blog.domain.port.out;

import com.kscold.blog.blog.domain.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PostRepository {
    Optional<Post> findById(String id);
    Optional<Post> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Post save(Post post);
    Page<Post> findAll(Pageable pageable);
    Page<Post> findByStatus(Post.Status status, Pageable pageable);
    List<Post> findFeaturedPosts(Pageable pageable);
    Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable);
    Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable);
    Page<Post> searchByText(String keyword, Pageable pageable);
}
