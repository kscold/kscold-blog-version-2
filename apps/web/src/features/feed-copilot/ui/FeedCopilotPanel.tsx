'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  type FeedCopilotDraft,
  type FeedCopilotPlan,
  type FeedCopilotStyle,
} from '@/features/feed-copilot/api/feedCopilotApi';
import { useFeedCopilotDraft, useFeedCopilotPlan } from '@/features/feed-copilot/api/useFeedCopilot';
import { useAlert } from '@/shared/model/alertStore';
import { FeedCopilotControls } from './FeedCopilotControls';
import { FeedCopilotDraftCard } from './FeedCopilotDraftCard';
import { FeedCopilotPlanCard } from './FeedCopilotPlanCard';

interface FeedCopilotPanelProps {
  memo: string;
  onMemoChange?: (value: string) => void;
  sourceUrl: string;
  onSourceUrlChange: (value: string) => void;
  onApplyDraft: (draft: FeedCopilotDraft) => void;
  onExpandComposer?: () => void;
  defaultOpen?: boolean;
  variant?: 'composer' | 'chat';
}

export function FeedCopilotPanel({
  memo,
  onMemoChange,
  sourceUrl,
  onSourceUrlChange,
  onApplyDraft,
  onExpandComposer,
  defaultOpen = false,
  variant = 'composer',
}: FeedCopilotPanelProps) {
  const alert = useAlert();
  const planMutation = useFeedCopilotPlan();
  const draftMutation = useFeedCopilotDraft();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [styles, setStyles] = useState<FeedCopilotStyle[]>(['developer', 'warm']);
  const [plan, setPlan] = useState<FeedCopilotPlan | null>(null);
  const [draft, setDraft] = useState<FeedCopilotDraft | null>(null);
  const [planInputKey, setPlanInputKey] = useState('');

  const currentInputKey = useMemo(
    () => JSON.stringify({ memo: memo.trim(), sourceUrl: sourceUrl.trim(), styles }),
    [memo, sourceUrl, styles]
  );
  const planNeedsRefresh = Boolean(plan && planInputKey !== currentInputKey);

  function toggleStyle(style: FeedCopilotStyle) {
    setStyles(current =>
      current.includes(style) ? current.filter(item => item !== style) : [...current, style]
    );
  }

  async function createPlan() {
    if (!memo.trim() && !sourceUrl.trim()) {
      alert.warning('본문 메모를 적거나 외부 링크를 넣어주세요');
      return;
    }

    try {
      const nextPlan = await planMutation.mutateAsync({
        memo,
        sourceUrl,
        styles,
      });
      setPlan(nextPlan);
      setDraft(null);
      setPlanInputKey(currentInputKey);
    } catch (error) {
      alert.error(error instanceof Error ? error.message : '작성 계획을 만들지 못했습니다');
    }
  }

  async function createDraft() {
    if (!plan) {
      alert.warning('먼저 작성 계획을 만들어주세요');
      return;
    }
    if (planNeedsRefresh) {
      alert.warning('메모, 링크 또는 문체가 바뀌었습니다. 계획을 다시 만들어주세요');
      return;
    }

    try {
      const nextDraft = await draftMutation.mutateAsync({
        memo,
        sourceUrl,
        styles,
        planTitle: plan.title,
        planAngle: plan.angle,
        planKeyPoints: plan.keyPoints,
      });
      setDraft(nextDraft);
    } catch (error) {
      alert.error(error instanceof Error ? error.message : '피드 초안을 만들지 못했습니다');
    }
  }

  function applyDraft() {
    if (!draft) {
      return;
    }
    onApplyDraft(draft);
    alert.success('초안을 본문에 적용했습니다. 읽어본 뒤 직접 게시해주세요');
  }

  const isChat = variant === 'chat';

  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-surface-50 ${
        isChat ? 'shadow-sm' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(current => !current)}
        className={`flex w-full items-start gap-4 text-left transition-colors hover:bg-white/70 ${
          isChat ? 'px-4 py-4' : 'px-5 py-5 sm:px-6'
        }`}
        aria-expanded={isOpen}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-600 shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h.01M16.5 7.5h.01M7.5 16.5h.01M16.5 16.5h.01" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Feed Copilot</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-surface-400 shadow-sm">
              계획부터
            </span>
          </span>
          <span className="mt-1 block text-base font-bold text-surface-900">메모와 링크로 피드의 방향을 먼저 잡아보세요</span>
          <span className="mt-1 block text-sm leading-6 text-surface-500">
            외부 글과 내 기록을 함께 살펴본 뒤, 검토 가능한 초안만 만듭니다.
          </span>
        </span>
        <svg
          className={`mt-3 h-4 w-4 shrink-0 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`space-y-5 border-t border-sky-100 bg-white/70 ${
                isChat ? 'px-4 py-4' : 'px-5 py-5 sm:px-6 sm:py-6'
              }`}
            >
              <FeedCopilotControls
                memo={memo}
                onMemoChange={onMemoChange}
                sourceUrl={sourceUrl}
                onSourceUrlChange={onSourceUrlChange}
                onExpandComposer={onExpandComposer}
                styles={styles}
                onToggleStyle={toggleStyle}
                onCreatePlan={() => void createPlan()}
                isPlanning={planMutation.isPending}
                isChat={isChat}
              />

              {plan ? (
                <FeedCopilotPlanCard
                  plan={plan}
                  needsRefresh={planNeedsRefresh}
                  isDrafting={draftMutation.isPending}
                  onCreateDraft={() => void createDraft()}
                />
              ) : null}

              {draft ? (
                <FeedCopilotDraftCard draft={draft} onApply={applyDraft} />
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
