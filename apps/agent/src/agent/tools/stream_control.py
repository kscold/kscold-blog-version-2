from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class StreamControl:
    """전송 계층에 의존하지 않는 요청 생존 여부와 공급사 연결 정리 콜백입니다."""

    is_active: Callable[[], bool] = lambda: True
    register_cancel: Callable[[Callable[[], None]], bool] | None = None
