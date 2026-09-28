from __future__ import annotations

import grpc

from agent.application import VaultAgentApplication
from agent.config import AgentConfig
from agent.grpc import vault_agent_pb2, vault_agent_pb2_grpc
from agent.skills.feed_writing.models import ExternalSource
from agent.skills.page_chat import PageChatInput, PageSection
from agent.tools.models import ContentAccessScope, SearchHit, SearchOptions


class VaultAgentServicer(vault_agent_pb2_grpc.VaultAgentServiceServicer):
    """protobuf 요청을 애플리케이션 명령으로 바꾸고 응답 모델만 조립합니다."""

    def __init__(self, config: AgentConfig):
        self.application = VaultAgentApplication(config)

    def Chat(self, request, context):
        result = self.application.chat(
            request.message,
            request.active_folder_name,
            self._content_access_scope(request),
        )
        return vault_agent_pb2.ChatResponse(
            answer=result["answer"],
            stages=[
                vault_agent_pb2.AgentStage(name=stage["name"], detail=stage["detail"])
                for stage in result["stages"]
            ],
            sources=[self._source_note(hit, request.message) for hit in result["context"]],
            follow_ups=result.get("follow_ups", []),
        )

    def ChatStream(self, request, context):
        for event_type, payload in self.application.stream_chat(
            request.message,
            request.active_folder_name,
            self._content_access_scope(request),
        ):
            if event_type == "stage":
                yield vault_agent_pb2.ChatStreamEvent(
                    stage=vault_agent_pb2.AgentStage(
                        name=payload["name"],
                        detail=payload["detail"],
                    )
                )

            elif event_type == "delta":
                yield vault_agent_pb2.ChatStreamEvent(delta=payload)
            elif event_type == "completed":
                yield vault_agent_pb2.ChatStreamEvent(
                    completed=vault_agent_pb2.ChatCompleted(
                        answer=payload["answer"],
                        sources=[
                            self._source_note(hit, payload["question"])
                            for hit in payload["context"]
                        ],
                        follow_ups=payload.get("follow_ups", []),
                    )
                )

    def Search(self, request, context):
        options = SearchOptions(
            limit=request.limit,
            active_folder_name=request.active_folder_name,
            scope=self._content_access_scope(request),
        )
        hits = self.application.search_vault(request.query, options)
        return vault_agent_pb2.SearchResponse(
            sources=[self._source_note(hit, request.query) for hit in hits]
        )

    def PageChatStream(self, request, context):
        data = PageChatInput(
            question=request.message,
            title=request.page_context.title,
            path=request.page_context.path,
            sections=tuple(PageSection(item.id, item.title, item.content) for item in request.page_context.sections),
            conversation=tuple((item.role, item.content) for item in request.conversation),
        )
        try:
            yield from self._page_chat_events(data, context)
        except ValueError:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "페이지 질문 자료 형식이 올바르지 않습니다.")
        except Exception:
            if context.is_active():
                context.abort(grpc.StatusCode.UNAVAILABLE, "페이지 Agent 응답을 완료하지 못했습니다.")

    def _page_chat_events(self, data, context):
        for event_type, payload in self.application.page_chat.stream(data, context.is_active, context.add_callback):
            if event_type == "stage":
                yield vault_agent_pb2.ChatStreamEvent(stage=vault_agent_pb2.AgentStage(**payload))
            elif event_type == "delta":
                yield vault_agent_pb2.ChatStreamEvent(delta=payload)
            elif event_type == "completed":
                yield vault_agent_pb2.ChatStreamEvent(completed=vault_agent_pb2.ChatCompleted(
                    answer=payload["answer"],
                    stages=[vault_agent_pb2.AgentStage(**stage) for stage in payload["stages"]],
                    sources=[vault_agent_pb2.SourceNote(
                        id=f"page:{index}", title=section.title, slug=section.id, score=1.0,
                        type="page", path=f"{data.path}#{section.id}", excerpt=section.content[:220],
                    ) for index, section in enumerate(data.sections, start=1)],
                ))

    def CreateFeedPlan(self, request, context):
        source = self._external_source(request.external_source)
        result = self.application.create_feed_plan(
            request.memo,
            source,
            list(request.styles),
            self._content_access_scope(request),
        )
        source_question = request.memo or source.title or source.url
        return vault_agent_pb2.FeedCopilotPlanResponse(
            title=result.title,
            angle=result.angle,
            key_points=result.key_points,
            source_summary=result.source_summary,
            sources=[self._source_note(hit, source_question) for hit in result.sources],
        )

    def CreateFeedDraft(self, request, context):
        source = self._external_source(request.external_source)
        result = self.application.create_feed_draft(
            request.memo,
            source,
            list(request.styles),
            request.plan_title,
            request.plan_angle,
            list(request.plan_key_points),
            list(request.style_reference_keys),
            self._content_access_scope(request),
        )
        source_question = request.memo or source.title or source.url
        return vault_agent_pb2.FeedCopilotDraftResponse(
            title=result.title,
            content=result.content,
            tags=result.tags,
            sources=[self._source_note(hit, source_question) for hit in result.sources],
        )

    def Reindex(self, request, context):
        total, indexed, skipped = self.application.reindex(force=request.force)
        return vault_agent_pb2.ReindexResponse(
            total_notes=total,
            indexed_notes=indexed,
            skipped_notes=skipped,
        )

    def start(self) -> None:
        self.application.start()

    def stop(self) -> None:
        self.application.stop()

    @staticmethod
    def _content_access_scope(request) -> ContentAccessScope:
        scope = request.content_access_scope
        return ContentAccessScope.from_values(
            full_content_access=scope.full_content_access,
            allowed_post_ids=list(scope.allowed_post_ids),
            allowed_category_ids=list(scope.allowed_category_ids),
        )

    @staticmethod
    def _external_source(source) -> ExternalSource:
        return ExternalSource(
            url=source.url,
            title=source.title,
            description=source.description,
            site_name=source.site_name,
            content=source.content,
        )

    def _source_note(self, hit: SearchHit, question: str):
        return vault_agent_pb2.SourceNote(
            id=hit.note.id,
            title=hit.note.title,
            slug=hit.note.slug,
            score=hit.score,
            type=hit.note.content_type,
            path=hit.note.path or f"/vault/{hit.note.slug}",
            excerpt=self.application.source_excerpt(hit, question),
        )
