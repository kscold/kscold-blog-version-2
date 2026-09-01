import type {
  AgentMessage,
  VaultAgentChatResponse,
  VaultAgentStage,
} from '@/features/chat';

export const INITIAL_STREAM_STAGE: VaultAgentStage = {
  name: '질문 정리',
  detail: '질문의 핵심과 필요한 기록 범위를 정리하고 있습니다.',
};

export function addAgentStage(
  messages: AgentMessage[],
  messageId: string,
  stage: VaultAgentStage
) {
  return updateAgentMessage(messages, messageId, message => {
    const stages = message.stages || [];
    const alreadyAdded = stages.some(
      current => current.name === stage.name && current.detail === stage.detail
    );
    return alreadyAdded ? message : { ...message, stages: [...stages, stage] };
  });
}

export function completeAgentMessage(
  messages: AgentMessage[],
  messageId: string,
  response: VaultAgentChatResponse
) {
  return updateAgentMessage(messages, messageId, message => ({
    ...message,
    content: response.answer || message.content,
    stages: response.stages,
    sources: response.sources,
    followUps: response.followUps,
    isStreaming: false,
  }));
}

export function interruptAgentMessage(messages: AgentMessage[], messageId: string) {
  return updateAgentMessage(messages, messageId, message => ({
    ...message,
    content:
      message.content ||
      '답변 수신이 중단되었습니다. 같은 질문을 다시 보내면 새 답변을 받을 수 있어요.',
    stages: withFinalStage(message.stages, {
      name: '응답 중단',
      detail: '대화창이 닫혀 답변 수신을 멈췄습니다.',
    }),
    isStreaming: false,
  }));
}

export function failAgentMessage(
  messages: AgentMessage[],
  messageId: string,
  detail: string
) {
  return updateAgentMessage(messages, messageId, message => ({
    ...message,
    content: '지금은 답변을 이어갈 수 없어요. 잠시 뒤 다시 물어봐 주세요.',
    stages: withFinalStage(message.stages, { name: '연결 확인', detail }),
    isStreaming: false,
  }));
}

function updateAgentMessage(
  messages: AgentMessage[],
  messageId: string,
  update: (message: AgentMessage) => AgentMessage
) {
  return messages.map(message => (message.id === messageId ? update(message) : message));
}

function withFinalStage(
  stages: VaultAgentStage[] | undefined,
  finalStage: VaultAgentStage
) {
  return [...(stages || []).slice(0, 4), finalStage];
}
