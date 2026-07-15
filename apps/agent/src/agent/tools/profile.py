from __future__ import annotations

from agent.tools.models import VaultNote


PUBLIC_PROFILE_TEXT = """
김승찬은 kscold라는 이름으로 활동하는 개발자입니다.
KSCOLD는 김승찬의 개인 기술 블로그이자, 개발 기록과 실험을 정리하는 공간입니다.
블로그 주소는 kscold.com이며, 공개 블로그 글, 피드, Vault 노트를 통해 학습 기록을 공유합니다.

김승찬은 Java와 Spring Boot 기반 백엔드, React와 Next.js와 TypeScript 기반 프론트엔드,
MongoDB, Docker, AWS 운영, 그리고 LangGraph, RAG, AI Agent 개발에 관심을 두고 실험합니다.
최근에는 Vault 노트를 RAG화하고, Spring API와 Python LangGraph gRPC Agent를 연결하는 구조를 만들고 있습니다.

연락 이메일은 developerkscold@gmail.com입니다.
GitHub는 https://github.com/kscold 입니다.
자세한 공개 소개는 /info 페이지에서 확인할 수 있습니다.
""".strip()

PROFILE_QUERY_TERMS = {
    "김승찬",
    "kscold",
    "KSCOLD",
    "콜딩",
    "블로그 주인",
    "운영자",
    "개발자",
    "너",
    "나",
    "누구",
    "누구야",
    "누구인가",
    "소개",
    "프로필",
    "연락",
    "이메일",
    "github",
    "깃허브",
}


def public_profile_note() -> VaultNote:
    """별도 DB 문서가 없는 공개 자기소개도 검색 결과와 같은 형태로 제공합니다."""

    return VaultNote(
        id="profile:kscold",
        title="김승찬(kscold) 공개 프로필",
        slug="info",
        content=PUBLIC_PROFILE_TEXT,
        folder_id=None,
        outgoing_links=[],
        tags=[
            "김승찬",
            "kscold",
            "KSCOLD",
            "콜딩",
            "블로그 주인",
            "운영자",
            "프로필",
            "개발자",
            "AI Agent",
            "Spring Boot",
            "Next.js",
        ],
        content_type="profile",
        path="/info",
    )


def profile_query_matches(query: str, terms: list[str]) -> bool:
    """소개·연락처처럼 프로필을 우선 보여야 하는 질문을 판별합니다."""

    normalized_query = query.lower()
    normalized_terms = {term.lower() for term in terms}
    return any(
        term.lower() in normalized_query or term.lower() in normalized_terms
        for term in PROFILE_QUERY_TERMS
    )
