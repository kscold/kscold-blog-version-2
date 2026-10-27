from __future__ import annotations

import re
from dataclasses import dataclass


# 조사 뒤 경계도 허용하되 피드백·노트북 같은 다른 단어는 출처로 보지 않는다.
_ENDING = r"(?=$|[\s/·,?!]|에서|으로|부터|까지|에는|에게|은|는|이|가|을|를|의|와|과|랑|하고|중)"
_SOURCES = {
    "feed": rf"(?<![\w])(?:피드|feeds?){_ENDING}",
    "blog": rf"(?<![\w])(?:블로그|blogs?|게시글|포스트){_ENDING}",
    "vault": rf"(?<![\w])(?:vault|노트){_ENDING}",
    "profile": rf"(?<![\w])(?:프로필|자기소개|소개\s*페이지|소개){_ENDING}",
}
_RECENT = r"최근|요즘|최신|새로\s*(?:올라온|올린|쓴|작성된|등록된)|방금|오늘|이번\s*(?:주|달)|\b(?:latest|newest|recent)\b"
_BROWSE_WORDS = (
    r"눈여겨볼\s*만한|볼\s*만한|먼저\s*보면\s*좋은|알려\s*(?:줘|주세요)|보여\s*(?:줘|주세요)|"
    r"추천해\s*(?:줘|주세요)|설명해\s*(?:줘|주세요)|요약해\s*(?:줘|주세요)|정리해\s*(?:줘|주세요)|"
    r"내용|기록|목록|요약|추천|정리|설명|비교|차이|관련|대해|어떤|있는|있어|있나요|뭐야|뭐가|해줘|주세요"
)


@dataclass(frozen=True)
class QueryIntent:
    content_types: frozenset[str]
    recent: bool
    topic: str


def query_intent(question: str) -> QueryIntent:
    content_types = {
        kind for kind, pattern in _SOURCES.items() if re.search(pattern, question, re.I)
    }
    plain_post = rf"(?<![\w])글{_ENDING}"
    if not content_types and re.search(plain_post, question):
        content_types.add("blog")
    if re.search(r"(?:승찬|kscold|김승찬).*(?:소개|어떤\s*개발자|누구)", question, re.I):
        content_types.add("profile")

    topic = question
    for pattern in [*_SOURCES.values(), plain_post, _RECENT]:
        topic = re.sub(pattern, " ", topic, flags=re.I)
    topic = re.sub(_BROWSE_WORDS, " ", topic)
    topic = re.sub(r"(?<!\w)(?:에서|에는|중에서|중|에서의|와|과|랑|하고|및|또는|그리고|의)(?!\w)", " ", topic)
    topic = re.sub(r"[?!.,/·]", " ", topic)
    return QueryIntent(frozenset(content_types), bool(re.search(_RECENT, question, re.I)), topic.strip())


def missing_records_answer(question: str) -> str:
    names = {"feed": "피드", "blog": "블로그 글", "vault": "Vault 노트", "profile": "소개"}
    intent = query_intent(question)
    requested = "·".join(names[kind] for kind in sorted(intent.content_types)) or "기록"
    particle = "을" if (ord(requested[-1]) - ord('가')) % 28 else "를"
    return f"현재 열람 범위에서 질문에 맞는 {requested}{particle} 찾지 못했습니다. 기록이 없거나 열람할 수 없는 경우에는 내용을 확인할 수 없습니다."
