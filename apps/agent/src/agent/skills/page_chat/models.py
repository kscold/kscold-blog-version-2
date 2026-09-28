from __future__ import annotations

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class PageSection:
    id: str
    title: str
    content: str


@dataclass(frozen=True)
class PageChatInput:
    """서버 문서나 사용자 권한을 포함하지 않는 일회성 인용 자료입니다."""

    question: str
    title: str
    path: str
    sections: tuple[PageSection, ...]
    conversation: tuple[tuple[str, str], ...] = ()

    def validate(self) -> None:
        _bounded(self.question, 1200)
        _bounded(self.title, 120)
        _bounded(self.path, 160)
        if not re.fullmatch(r"/[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*/?", self.path):
            raise ValueError("페이지 경로 형식이 올바르지 않습니다.")
        if not 1 <= len(self.sections) <= 7:
            raise ValueError("페이지 자료 개수가 올바르지 않습니다.")
        if len({section.id for section in self.sections}) != len(self.sections):
            raise ValueError("페이지 자료 앵커가 중복됩니다.")
        for section in self.sections:
            _bounded(section.id, 64)
            _bounded(section.title, 160)
            _bounded(section.content, 6000)
            if not re.fullmatch(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", section.id):
                raise ValueError("페이지 자료 앵커 형식이 올바르지 않습니다.")
        if sum(len(section.content) for section in self.sections) > 16000:
            raise ValueError("페이지 자료 길이가 너무 깁니다.")
        self._validate_conversation()

    def _validate_conversation(self) -> None:
        if len(self.conversation) > 6 or sum(len(content) for _, content in self.conversation) > 3600:
            raise ValueError("대화 문맥 길이가 너무 깁니다.")
        for role, content in self.conversation:
            if role not in {"user", "assistant"}:
                raise ValueError("대화 역할이 올바르지 않습니다.")
            _bounded(content, 1200)


def _bounded(value: str, maximum: int) -> None:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise ValueError("페이지 질문 자료 형식이 올바르지 않습니다.")
