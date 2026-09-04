package com.kscold.blog.blog.application.service;

import com.kscold.blog.blog.application.port.in.TagCatalogUseCase;
import com.kscold.blog.blog.config.BlogCatalogCacheConfiguration;
import com.kscold.blog.blog.config.InvalidateBlogCatalogCaches;
import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Post;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.model.TagUsage;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.shared.util.SlugUtils;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 글과 피드의 태그를 하나의 목록으로 합쳐서 다룬다.
 *
 * <p>태그 등록은 {@link TagApplicationService} 가 맡고 이 서비스는 읽기와 정리만 한다. 피드가 태그를 등록할 때 TagUseCase 를 부르기
 * 때문에, 여기서 FeedUseCase 를 참조해도 서로 물고 도는 참조가 생기지 않는다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TagCatalogApplicationService implements TagCatalogUseCase {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final FeedUseCase feedUseCase;

    @Override
    @Cacheable(
            cacheManager = "blogCatalogCacheManager",
            cacheNames = BlogCatalogCacheConfiguration.TAG_INDEX_CACHE,
            sync = true)
    public List<TagUsage> getIndex() {
        Map<String, Long> postCounts = postRepository.countPublishedByTagName();
        Map<String, Long> feedCounts = feedUseCase.getFeedTagCounts();
        Map<String, String> categoryNames = categoryNamesById();

        List<Tag> registered = tagRepository.findAll();
        List<TagUsage> usages = new ArrayList<>();
        // 이름이 곧 태그의 정체다. 등록된 태그를 먼저 담고, 피드에만 있는 이름을 뒤에 붙인다.
        LinkedHashSet<String> seen = new LinkedHashSet<>();

        for (Tag tag : registered) {
            seen.add(tag.getName());
            usages.add(
                    new TagUsage(
                            tag.getId(),
                            tag.getName(),
                            tag.getSlug(),
                            tag.getCategoryId(),
                            categoryNames.get(tag.getCategoryId()),
                            postCounts.getOrDefault(tag.getName(), 0L),
                            feedCounts.getOrDefault(tag.getName(), 0L)));
        }
        feedCounts.forEach(
                (name, count) -> {
                    if (seen.contains(name)) return;
                    usages.add(new TagUsage(null, name, null, null, null, 0L, count));
                });

        usages.sort(
                Comparator.comparingLong(TagUsage::totalCount)
                        .reversed()
                        .thenComparing(TagUsage::name));
        return usages;
    }

    /** 등록되지 않은 피드 태그를 채우고, 분류가 비어 있는 태그를 글이 가장 많은 카테고리로 묶는다. */
    @Override
    @Transactional
    @InvalidateBlogCatalogCaches
    public int reindex() {
        int changed = registerMissingFeedTags();
        changed += assignMissingCategories();
        log.info("태그 재색인 완료: {}건 정리", changed);
        return changed;
    }

    @Override
    @Transactional
    @InvalidateBlogCatalogCaches
    public long merge(String sourceTagId, String targetTagId) {
        if (sourceTagId.equals(targetTagId)) {
            throw InvalidRequestException.invalidInput("같은 태그끼리는 합칠 수 없습니다");
        }
        Tag source = findTag(sourceTagId);
        Tag target = findTag(targetTagId);

        long movedPosts =
                postRepository.replaceTagReference(
                        source.getId(),
                        Post.TagInfo.builder()
                                .id(target.getId())
                                .name(target.getName())
                                .slug(target.getSlug())
                                .build());
        long movedFeeds = feedUseCase.renameFeedTag(source.getName(), target.getName());

        // 참조를 모두 옮긴 뒤에만 지운다. 중간에 실패하면 태그 문서가 남아 다시 시도할 수 있다.
        tagRepository.delete(source);
        target.setPostCount(
                Math.toIntExact(
                        postRepository
                                .countPublishedByTagName()
                                .getOrDefault(target.getName(), 0L)));
        tagRepository.save(target);

        log.info(
                "태그 병합: {} -> {} (글 {}건, 피드 {}건)",
                source.getName(),
                target.getName(),
                movedPosts,
                movedFeeds);
        return movedPosts + movedFeeds;
    }

    private int registerMissingFeedTags() {
        LinkedHashSet<String> known = new LinkedHashSet<>();
        tagRepository.findAll().forEach(tag -> known.add(tag.getName()));

        int created = 0;
        for (String name : feedUseCase.getFeedTagCounts().keySet()) {
            if (name == null || name.isBlank() || known.contains(name)) continue;
            try {
                tagRepository.save(Tag.builder().name(name).slug(SlugUtils.generate(name)).build());
                created++;
            } catch (DuplicateKeyException exception) {
                // 슬러그가 겹치는 태그가 이미 있으면 그대로 둔다. 이름이 다르면 사람이 정리할 문제다.
                log.warn("피드 태그 등록 건너뜀 name={} 사유=슬러그 중복", name);
            }
        }
        return created;
    }

    private int assignMissingCategories() {
        int assigned = 0;
        for (Tag tag : tagRepository.findAll()) {
            if (tag.getCategoryId() != null || tag.getId() == null) continue;
            Optional<String> dominant = dominantCategoryId(tag.getId());
            if (dominant.isEmpty()) continue;
            tag.setCategoryId(dominant.get());
            tagRepository.save(tag);
            assigned++;
        }
        return assigned;
    }

    /** 이 태그를 단 글이 가장 많이 속한 카테고리. 글이 없으면 비어 있다. */
    private Optional<String> dominantCategoryId(String tagId) {
        return postRepository.countCategoriesByTagId(tagId).entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey);
    }

    private Map<String, String> categoryNamesById() {
        Map<String, String> names = new HashMap<>();
        for (Category category : categoryRepository.findAll()) {
            names.put(category.getId(), category.getName());
        }
        return names;
    }

    private Tag findTag(String id) {
        return tagRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.tag(id));
    }
}
