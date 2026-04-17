package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostReferenceService {

    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserQueryPort userQueryPort;

    public PostReferenceService(
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            UserQueryPort userQueryPort
    ) {
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userQueryPort = userQueryPort;
    }

    public Post.CategoryInfo resolveCategory(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> ResourceNotFoundException.category(categoryId));
        return Post.CategoryInfo.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }

    public List<Post.TagInfo> resolveTags(List<String> tagIds) {
        List<Post.TagInfo> tagInfos = new ArrayList<>();
        if (tagIds == null || tagIds.isEmpty()) return tagInfos;

        List<Tag> tags = tagRepository.findAllById(tagIds);
        if (tags.size() != tagIds.size()) {
            throw ResourceNotFoundException.tag("일부 태그를 찾을 수 없습니다");
        }
        for (Tag tag : tags) {
            tagInfos.add(Post.TagInfo.builder().id(tag.getId()).name(tag.getName()).build());
        }
        return tagInfos;
    }

    public Post.AuthorInfo resolveAuthor(String userId) {
        UserQueryPort.UserInfo userInfo = userQueryPort.getUserById(userId);
        return Post.AuthorInfo.builder()
                .id(userInfo.id())
                .name(userInfo.displayName())
                .build();
    }

    public void incrementPostCounts(Post.CategoryInfo category, List<Post.TagInfo> tags) {
        categoryRepository.incrementPostCount(category.getId());
        for (Post.TagInfo tagInfo : tags) {
            tagRepository.incrementPostCount(tagInfo.getId());
        }
    }

    public void decrementPostCounts(Post.CategoryInfo category, List<Post.TagInfo> tags) {
        if (category != null) {
            categoryRepository.decrementPostCount(category.getId());
        }
        if (tags != null) {
            for (Post.TagInfo tagInfo : tags) {
                tagRepository.decrementPostCount(tagInfo.getId());
            }
        }
    }
}
