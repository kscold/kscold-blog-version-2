'use client';

import { useEffect, useRef, useState } from 'react';
import { AgentMarkdown } from '@/shared/ui/AgentMarkdown';
import { usePageAgent } from '../model/usePageAgent';
import type { PageContext, PageMessage } from '../model/pageAgentTypes';
import styles from './PageAgent.module.css';

const QUESTIONS = ['Agent에서 모델과 코드의 역할은 어떻게 나눴나요?', '각 프로젝트에서 직접 맡은 일과 팀의 기여를 구분해 주세요.', '운영 중인 서비스를 어떻게 점진적으로 바꿨나요?'];

function MessageList({ messages, context }: { messages: PageMessage[]; context: PageContext }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  return (
    <div role="log" aria-label="페이지 Agent 대화" aria-live="polite" aria-relevant="additions text" className={styles.messages}>
      {messages.map(message => (
        <article key={message.id} className={message.role === 'user' ? styles.question : styles.answer}>
          <span>{message.role === 'user' ? '질문' : 'KSCOLD PAGE AGENT'}</span>
          {message.role === 'assistant' && message.content ? (
            <AgentMarkdown content={message.content} sectionIds={context.sections.map(section => section.id)} onSourceClick={() => (end.current?.closest('dialog') as HTMLDialogElement | null)?.close()} />
          ) : <p>{message.content || '답변을 준비하고 있습니다…'}</p>}
          {!!message.sourceIds?.length && <nav aria-label="답변 근거" className={styles.sources}>{context.sections.filter(section => message.sourceIds?.includes(section.id)).map(section => <a key={section.id} href={`#${section.id}`} onClick={() => (end.current?.closest('dialog') as HTMLDialogElement | null)?.close()}>{section.title} ↗</a>)}</nav>}
        </article>
      ))}
      <div ref={end} />
    </div>
  );
}

function QuestionForm({ isBusy, send, cancel }: { isBusy: boolean; send: (value: string) => Promise<void>; cancel: () => void }) {
  const [question, setQuestion] = useState('');
  return (
    <form className={styles.form} onSubmit={event => { event.preventDefault(); if (question.trim() && !isBusy) { void send(question); setQuestion(''); } }}>
      <label htmlFor="page-agent-question" className={styles.inputLabel}>포트폴리오에 관해 궁금한 점</label>
      <div><input id="page-agent-question" type="text" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1200} placeholder="설계, 검증, 담당 역할을 물어보세요" disabled={isBusy} autoComplete="off" /><button type={isBusy ? 'button' : 'submit'} onClick={isBusy ? cancel : undefined} disabled={!isBusy && !question.trim()}>{isBusy ? '중단' : '질문하기'}</button></div>
      <p>질문과 이 페이지 자료가 OpenAI에 전송됩니다. 개인정보·회사 기밀은 입력하지 마세요. 이 사이트 DB·검색 색인에는 대화를 저장하지 않으며, 공급사 보존 정책은 별도입니다.</p>
    </form>
  );
}

export function PageAgentDialog({ context, onClose }: { context: PageContext; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const agent = usePageAgent(context);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return (
    <dialog ref={dialog} className={styles.dialog} onClose={onClose} aria-labelledby="page-agent-title">
      <div className={styles.panel}>
        <header><div><span>ON THIS PAGE ONLY</span><h2 id="page-agent-title">포트폴리오에 물어보세요</h2></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Agent 닫기">×</button></header>
        <p className={styles.scope}>이 페이지의 공개한 자료만 근거로 답합니다.<br />비공개 경력 원문이나 블로그 Vault는 검색하지 않습니다.</p>
        {!agent.messages.length && <div className={styles.suggestions}><span>이렇게 물어보세요</span>{QUESTIONS.map(question => <button type="button" key={question} onClick={() => void agent.send(question)}>{question} <span aria-hidden="true">↗</span></button>)}</div>}
        <MessageList messages={agent.messages} context={context} />
        <div role="status" className={styles.status}>{agent.status}</div>
        {agent.error && <p role="alert" className={styles.error}>{agent.error}</p>}
        <QuestionForm isBusy={agent.isBusy} send={agent.send} cancel={agent.cancel} />
      </div>
    </dialog>
  );
}
