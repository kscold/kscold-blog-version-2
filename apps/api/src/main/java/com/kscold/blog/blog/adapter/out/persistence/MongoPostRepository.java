package com.kscold.blog.blog.adapter.out.persistence;

import com.kscold.blog.blog.domain.model.Post;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface MongoPostRepository extends MongoRepository<Post, String> {

    Optional<Post> findBySlug(String slug);

    Page<Post> findByStatus(Post.Status status, Pageable pageable);

    @Query("{ 'category.id': ?0, 'status': 'PUBLISHED' }")
    Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable);

    @Query("{ 'tags._id': ?0, 'status': 'PUBLISHED' }")
    Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable);

    @Query("{ 'status': 'PUBLISHED', 'featured': true }")
    List<Post> findFeaturedPosts(Pageable pageable);

    List<Post> findByStatusAndPublishedAtAfter(
            Post.Status status, LocalDateTime since, Pageable pageable);

    @Query("{ '$text': { '$search': ?0 }, 'status': 'PUBLISHED' }")
    Page<Post> searchByText(String searchText, Pageable pageable);

    long countByStatus(Post.Status status);

    boolean existsBySlug(String slug);
}
