package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.social.application.dto.command.FeedCopilotDraftCommand;
import com.kscold.blog.social.application.dto.command.FeedCopilotPlanCommand;
import com.kscold.blog.social.application.dto.response.FeedCopilotDraftResponse;
import com.kscold.blog.social.application.dto.response.FeedCopilotPlanResponse;
import com.kscold.blog.social.domain.model.ExternalArticle;
import com.kscold.blog.social.domain.model.FeedCopilotDraft;
import com.kscold.blog.social.domain.model.FeedCopilotPlan;
import com.kscold.blog.social.domain.port.out.FeedCopilotProvider;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FeedCopilotApplicationServiceTest {

    @Mock private LinkScrapingPort linkScrapingPort;

    @Mock private FeedCopilotProvider feedCopilotProvider;

    @InjectMocks private FeedCopilotApplicationService feedCopilotApplicationService;

    @Test
    @DisplayName("시나리오: 메모만 입력해도 허용된 문체만 반영해 피드 작성 계획을 만든다")
    void createPlanUsesMemoAndNormalizesStyles() {
        FeedCopilotPlan plan =
                new FeedCopilotPlan(
                        "LLM 응답 품질을 다시 확인한 기록",
                        "작게 검증한 흐름을 공유합니다.",
                        List.of("문제", "시도"),
                        "",
                        List.of());
        when(feedCopilotProvider.createPlan(any(), any(), any(), eq("user-1"))).thenReturn(plan);

        FeedCopilotPlanResponse response =
                feedCopilotApplicationService.createPlan(
                        FeedCopilotPlanCommand.builder()
                                .memo("  응답 품질을 확인한 메모  ")
                                .styles(List.of("developer", "unknown", "developer", "warm"))
                                .build(),
                        "user-1");

        ArgumentCaptor<List<String>> stylesCaptor = ArgumentCaptor.captor();
        verify(feedCopilotProvider)
                .createPlan(
                        eq("응답 품질을 확인한 메모"),
                        eq(ExternalArticle.empty()),
                        stylesCaptor.capture(),
                        eq("user-1"));
        verify(linkScrapingPort, never()).extract(any());

        assertThat(stylesCaptor.getValue()).containsExactly("developer", "warm");
        assertThat(response.title()).isEqualTo("LLM 응답 품질을 다시 확인한 기록");
        assertThat(response.keyPoints()).containsExactly("문제", "시도");
    }

    @Test
    @DisplayName("시나리오: 외부 링크만 입력하면 추출한 본문을 근거로 피드 작성 계획을 만든다")
    void createPlanUsesExtractedExternalArticle() {
        ExternalArticle article =
                new ExternalArticle(
                        "https://example.com/article", "외부 글 제목", "설명", "Example", "읽어온 본문");
        when(linkScrapingPort.extract(article.url())).thenReturn(article);
        when(feedCopilotProvider.createPlan(any(), any(), any(), eq("user-1")))
                .thenReturn(new FeedCopilotPlan("첫 문장", "관점", List.of(), "요약", List.of()));

        FeedCopilotPlanResponse response =
                feedCopilotApplicationService.createPlan(
                        FeedCopilotPlanCommand.builder()
                                .sourceUrl("  " + article.url() + "  ")
                                .build(),
                        "user-1");

        verify(linkScrapingPort).extract(article.url());
        verify(feedCopilotProvider).createPlan(eq(""), eq(article), eq(List.of()), eq("user-1"));
        assertThat(response.sourceSummary()).isEqualTo("요약");
    }

    @Test
    @DisplayName("시나리오: 메모도 읽을 수 있는 외부 링크도 없으면 Agent 요청을 보내지 않는다")
    void createPlanRejectsEmptyInput() {
        when(linkScrapingPort.extract("https://example.com/empty"))
                .thenReturn(ExternalArticle.empty());

        assertThatThrownBy(
                        () ->
                                feedCopilotApplicationService.createPlan(
                                        FeedCopilotPlanCommand.builder()
                                                .sourceUrl("https://example.com/empty")
                                                .build(),
                                        "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("메모나 읽을 수 있는 외부 URL을 입력해주세요");

        verify(feedCopilotProvider, never()).createPlan(any(), any(), any(), any());
    }

    @Test
    @DisplayName("시나리오: 검토한 계획을 전달하면 자동 게시 없이 피드 초안을 반환한다")
    void createDraftPassesReviewedPlanToProvider() {
        when(feedCopilotProvider.createDraft(any(), any(), any(), any(), eq("user-1")))
                .thenReturn(new FeedCopilotDraft("초안 제목", "초안 본문", List.of("AI", "회고"), List.of()));

        FeedCopilotDraftResponse response =
                feedCopilotApplicationService.createDraft(
                        FeedCopilotDraftCommand.builder()
                                .memo("초안에 넣을 메모")
                                .styles(List.of("candid", "invalid"))
                                .planTitle("시작 문장")
                                .planAngle("현실적인 관점")
                                .planKeyPoints(List.of("문제를 먼저 설명", "시도와 결과를 나눠 기록"))
                                .build(),
                        "user-1");

        ArgumentCaptor<FeedCopilotPlan> planCaptor = ArgumentCaptor.captor();
        ArgumentCaptor<List<String>> stylesCaptor = ArgumentCaptor.captor();
        verify(feedCopilotProvider)
                .createDraft(
                        eq("초안에 넣을 메모"),
                        eq(ExternalArticle.empty()),
                        stylesCaptor.capture(),
                        planCaptor.capture(),
                        eq("user-1"));

        assertThat(stylesCaptor.getValue()).containsExactly("candid");
        assertThat(planCaptor.getValue().title()).isEqualTo("시작 문장");
        assertThat(planCaptor.getValue().keyPoints()).containsExactly("문제를 먼저 설명", "시도와 결과를 나눠 기록");
        assertThat(response.title()).isEqualTo("초안 제목");
        assertThat(response.tags()).containsExactly("AI", "회고");
    }
}
