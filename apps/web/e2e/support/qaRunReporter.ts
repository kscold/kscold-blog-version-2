import { relative } from 'node:path';
import type {
  FullResult,
  Reporter,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';

const ANSI = /\u001b\[[0-9;]*m/g;
const MAX_ERROR_LINES = 12;

const seconds = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)}초`;

/** 실패 원인을 로그 창에서 읽을 만한 길이로 줄이고, 어느 줄에서 났는지 덧붙인다. */
function describeError(error: TestError): string[] {
  const text = (error.message || error.value || '원인을 알 수 없는 오류').replace(ANSI, '');
  const lines = text
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.trim())
    .slice(0, MAX_ERROR_LINES);
  if (error.location) {
    lines.push(`위치: ${relative(process.cwd(), error.location.file)}:${error.location.line}`);
  }
  return lines.map(line => `    ${line}`);
}

/**
 * 어드민 QA 화면의 로그 창에 그대로 흘려보낼 진행 기록을 만든다.
 * 기본 리포터는 테스트 하나가 끝나야 한 줄을 내보내므로, 화면 단위 진행이 보이도록 단계마다 한 줄씩 남긴다.
 */
export default class QaRunReporter implements Reporter {
  private passedSteps = 0;

  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep) {
    if (step.category !== 'test.step') return;
    if (!step.error) this.passedSteps += 1;
    console.log(`${step.error ? '실패' : '통과'} · ${step.title} (${seconds(step.duration)})`);
  }

  onTestEnd(_test: TestCase, result: TestResult) {
    if (result.status === 'passed' || result.status === 'skipped') return;
    if (result.status === 'timedOut') console.log('제한 시간 안에 끝나지 않았습니다.');
    for (const error of result.errors) describeError(error).forEach(line => console.log(line));
  }

  onError(error: TestError) {
    console.log('테스트를 실행하지 못했습니다.');
    describeError(error).forEach(line => console.log(line));
  }

  onEnd(result: FullResult) {
    const took = seconds(result.duration);
    console.log(
      result.status === 'passed'
        ? `모든 화면을 확인했습니다 · ${this.passedSteps}단계 (${took})`
        : `확인을 끝내지 못했습니다 · 통과 ${this.passedSteps}단계 (${took})`
    );
  }

  printsToStdio() {
    return true;
  }
}
