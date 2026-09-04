package com.kscold.blog.blog.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.blog.domain.model.Category;
import com.kscold.blog.blog.domain.model.Tag;
import com.kscold.blog.blog.domain.model.TagUsage;
import com.kscold.blog.blog.domain.port.out.CategoryRepository;
import com.kscold.blog.blog.domain.port.out.PostRepository;
import com.kscold.blog.blog.domain.port.out.TagRepository;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class TagCatalogApplicationServiceTest {

    private TagRepository tagRepository;
    private PostRepository postRepository;
    private CategoryRepository categoryRepository;
    private FeedUseCase feedUseCase;
    private TagCatalogApplicationService service;

    @BeforeEach
    void setUp() {
        tagRepository = mock(TagRepository.class);
        postRepository = mock(PostRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        feedUseCase = mock(FeedUseCase.class);
        service =
                new TagCatalogApplicationService(
                        tagRepository, postRepository, categoryRepository, feedUseCase);
    }

    @Test
    @DisplayName("시나리오: 글과 피드의 사용 횟수를 합쳐 많이 쓰인 태그부터 돌려준다")
    void indexMergesPostAndFeedCounts() {
        when(tagRepository.findAll())
                .thenReturn(List.of(tag("t1", "AI", "ai", "c1"), tag("t2", "회고", "회고", null)));
        when(postRepository.countPublishedByTagName()).thenReturn(Map.of("AI", 6L, "회고", 11L));
        when(feedUseCase.getFeedTagCounts()).thenReturn(Map.of("AI", 31L));
        when(categoryRepository.findAll())
                .thenReturn(List.of(Category.builder().id("c1").name("컨퍼런스").build()));

        List<TagUsage> index = service.getIndex();

        assertThat(index).extracting(TagUsage::name).containsExactly("AI", "회고");
        assertThat(index.get(0).totalCount()).isEqualTo(37);
        assertThat(index.get(0).categoryName()).isEqualTo("컨퍼런스");
        assertThat(index.get(1).feedCount()).isZero();
    }

    @Test
    @DisplayName("시나리오: 피드에만 있는 태그도 목록에 나오되 아직 등록되지 않은 것으로 표시된다")
    void indexIncludesFeedOnlyTags() {
        when(tagRepository.findAll()).thenReturn(List.of());
        when(postRepository.countPublishedByTagName()).thenReturn(Map.of());
        when(feedUseCase.getFeedTagCounts()).thenReturn(Map.of("Anthropic", 9L));
        when(categoryRepository.findAll()).thenReturn(List.of());

        List<TagUsage> index = service.getIndex();

        assertThat(index)
                .singleElement()
                .satisfies(
                        usage -> {
                            assertThat(usage.name()).isEqualTo("Anthropic");
                            assertThat(usage.feedCount()).isEqualTo(9);
                            assertThat(usage.isUnregistered()).isTrue();
                        });
    }

    @Test
    @DisplayName("시나리오: 재색인하면 등록되지 않은 피드 태그가 저장되고 분류가 빈 태그는 글이 가장 많은 카테고리로 묶인다")
    void reindexRegistersFeedTagsAndAssignsCategory() {
        Tag existing = tag("t1", "AI", "ai", null);
        when(tagRepository.findAll()).thenReturn(List.of(existing));
        when(feedUseCase.getFeedTagCounts()).thenReturn(Map.of("Anthropic", 9L, "AI", 31L));
        when(postRepository.countCategoriesByTagId("t1")).thenReturn(Map.of("c1", 2L, "c2", 4L));

        int changed = service.reindex();

        ArgumentCaptor<Tag> saved = ArgumentCaptor.forClass(Tag.class);
        verify(tagRepository, org.mockito.Mockito.atLeastOnce()).save(saved.capture());
        assertThat(saved.getAllValues())
                .extracting(Tag::getName)
                .contains("Anthropic"); // 등록되지 않았던 피드 태그
        assertThat(existing.getCategoryId()).isEqualTo("c2"); // 글이 더 많은 카테고리
        assertThat(changed).isEqualTo(2);
    }

    @Test
    @DisplayName("시나리오: 태그를 합치면 글과 피드 참조가 옮겨진 뒤에 넘긴 태그가 지워진다")
    void mergeMovesReferencesBeforeDeleting() {
        Tag source = tag("t1", "AI에이전트", "ai-agent", null);
        Tag target = tag("t2", "AIAgent", "aiagent", null);
        when(tagRepository.findById("t1")).thenReturn(Optional.of(source));
        when(tagRepository.findById("t2")).thenReturn(Optional.of(target));
        when(postRepository.replaceTagReference("t1", "t2", "AIAgent")).thenReturn(3L);
        when(feedUseCase.renameFeedTag("AI에이전트", "AIAgent")).thenReturn(5L);
        when(postRepository.countPublishedByTagName()).thenReturn(Map.of("AIAgent", 3L));

        long moved = service.merge("t1", "t2");

        assertThat(moved).isEqualTo(8);
        assertThat(target.getPostCount()).isEqualTo(3);
        verify(tagRepository).delete(source);
    }

    @Test
    @DisplayName("시나리오: 같은 태그끼리 합치려 하면 거부하고 아무것도 옮기지 않는다")
    void mergeRejectsSameTag() {
        assertThatThrownBy(() -> service.merge("t1", "t1"))
                .isInstanceOf(InvalidRequestException.class);
        verify(postRepository, never()).replaceTagReference(any(), any(), any());
        verify(tagRepository, never()).delete(any());
    }

    private Tag tag(String id, String name, String slug, String categoryId) {
        return Tag.builder()
                .id(id)
                .name(name)
                .slug(slug)
                .categoryId(categoryId)
                .postCount(0)
                .build();
    }
}
