package com.kscold.blog.repository;

import com.kscold.blog.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    Optional<Post> findBySlug(String slug);

    Page<Post> findByStatus(Post.Status status, Pageable pageable);

    @Query("{ 'category.id': ?0, 'status': 'PUBLISHED' }")
    Page<Post> findByCategoryIdAndPublished(String categoryId, Pageable pageable);

    @Query("{ 'tags.id': ?0, 'status': 'PUBLISHED' }")
    Page<Post> findByTagIdAndPublished(String tagId, Pageable pageable);

    @Query("{ 'status': 'PUBLISHED', 'featured': true }")
    List<Post> findFeaturedPosts(Pageable pageable);

    @Query("{ '$text': { '$search': ?0 }, 'status': 'PUBLISHED' }")
    Page<Post> searchByText(String searchText, Pageable pageable);

    long countByStatus(Post.Status status);

    boolean existsBySlug(String slug);
}
