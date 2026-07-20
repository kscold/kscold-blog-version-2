'use client';

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { AgentMessage } from '@/features/chat';

/**
 * 스트리밍 델타(부분 응답)를 requestAnimationFrame 단위로 모아서 한 번에 반영하는 버퍼.
 * 매 델타마다 setState하면 렌더가 과하게 튀므로, 프레임마다 누적분을 flush한다.
 */
export function useAgentStreamBuffer(
  setAgentMessages: Dispatch<SetStateAction<AgentMessage[]>>
) {
  const pendingDeltaRef = useRef<{ messageId: string; value: string } | undefined>(undefined);
  const streamFrameRef = useRef<{ messageId: string; frameId: number } | undefined>(undefined);

  /** 누적된 델타를 해당 메시지에 즉시 반영한다. */
  const flushPendingDelta = (assistantMessageId: string) => {
    if (streamFrameRef.current?.messageId === assistantMessageId) {
      streamFrameRef.current = undefined;
    }
    const pendingDelta = pendingDeltaRef.current;
    if (!pendingDelta || pendingDelta.messageId !== assistantMessageId) {
      return;
    }
    const delta = pendingDelta.value;
    pendingDeltaRef.current = undefined;
    if (!delta) {
      return;
    }
    setAgentMessages(previous =>
      previous.map(message =>
        message.id === assistantMessageId
          ? { ...message, content: `${message.content}${delta}` }
          : message
      )
    );
  };

  /** 델타를 버퍼에 쌓고, 다음 프레임에 flush를 예약한다. */
  const queueDelta = (assistantMessageId: string, delta: string) => {
    const pendingDelta = pendingDeltaRef.current;
    pendingDeltaRef.current =
      pendingDelta?.messageId === assistantMessageId
        ? { ...pendingDelta, value: `${pendingDelta.value}${delta}` }
        : { messageId: assistantMessageId, value: delta };
    if (streamFrameRef.current?.messageId === assistantMessageId) {
      return;
    }
    if (streamFrameRef.current) {
      window.cancelAnimationFrame(streamFrameRef.current.frameId);
    }
    const frameId = window.requestAnimationFrame(() => flushPendingDelta(assistantMessageId));
    streamFrameRef.current = { messageId: assistantMessageId, frameId };
  };

  /** 예약된 프레임과 누적 델타를 모두 취소한다(새 질문 시작·언마운트 시). */
  const resetBuffer = () => {
    if (streamFrameRef.current) {
      window.cancelAnimationFrame(streamFrameRef.current.frameId);
    }
    streamFrameRef.current = undefined;
    pendingDeltaRef.current = undefined;
  };

  useEffect(() => () => resetBuffer(), []);

  return { flushPendingDelta, queueDelta, resetBuffer };
}
