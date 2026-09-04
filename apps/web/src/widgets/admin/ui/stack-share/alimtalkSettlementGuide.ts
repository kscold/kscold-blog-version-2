import type { AlimtalkTemplate } from '@/features/notification-template';

export const SETTLEMENT_TEMPLATE_KEY = 'STACK_SHARE_SETTLEMENT';

export const SETTLEMENT_VARIABLE_GUIDES = [
  { variable: '#{이름}', example: '김가을', note: '수신자 실명' },
  { variable: '#{정산기간}', example: '2026년 8월', note: '정산 대상 월 또는 기간' },
  { variable: '#{서비스명}', example: 'ChatGPT Team', note: '공동 구독 서비스명' },
  { variable: '#{총금액}', example: '100,000원', note: '원 단위를 포함한 총 결제 금액' },
  { variable: '#{참여인원}', example: '5', note: '문구에 명이 붙으므로 숫자만 입력' },
  { variable: '#{분담금}', example: '20,000원', note: '원 단위를 포함한 개인 분담금' },
  {
    variable: '#{입금계좌}',
    example: '토스뱅크 1000-1234-5678 (김승찬)',
    note: '은행명, 계좌번호, 예금주 순서',
  },
  { variable: '#{입금기한}', example: '2026년 9월 5일', note: '연월일을 모두 표시' },
  { variable: '#{연락처}', example: '010-1234-5678', note: '문의 가능한 휴대전화 번호' },
] as const;

export const SETTLEMENT_REVIEW_COMMENT =
  '공동 구독 서비스 참여자에게 확정된 정산 금액, 참여 인원, 입금 계좌와 기한을 안내하는 정보성 메시지입니다. 광고·프로모션 목적이 아니며, 수신자는 서비스 참여 및 정산 안내에 동의한 회원입니다.';

export const SETTLEMENT_REGISTRATION_STEPS = [
  'SOLAPI에서 강조표기형 알림톡 템플릿을 새로 만듭니다.',
  '메시지 유형은 정보성, 버튼과 대체 발송은 없음으로 선택합니다.',
  '강조 제목과 보조문구를 각각 복사하고 본문은 내용 칸에 붙여넣습니다.',
  '아홉 개 변수를 예시와 같은 형식으로 등록하고 검수 의견을 함께 제출합니다.',
  '승인 상태가 된 뒤 발급된 템플릿 ID를 KSCOLD 관리자 화면에 입력합니다.',
  '상태를 승인 완료로 저장하고 본인 번호로 먼저 발송해 최종 확인합니다.',
] as const;

export function createSettlementRegistrationText(template: AlimtalkTemplate) {
  const fields = [`템플릿 이름\n${template.name}`, `템플릿 유형\n${template.templateType}`];
  if (template.emphasisTitle) {
    fields.push(`강조표기 제목\n${template.emphasisTitle}`);
  }
  if (template.emphasisSubtitle) {
    fields.push(`강조표기 보조문구\n${template.emphasisSubtitle}`);
  }
  fields.push(`내용\n${template.body.trim()}`);
  return fields.join('\n\n');
}

export function createSettlementSampleBody(template: AlimtalkTemplate) {
  return SETTLEMENT_VARIABLE_GUIDES.reduce(
    (body, guide) => body.replaceAll(guide.variable, guide.example),
    template.body
  );
}

export function createSettlementVariableText() {
  return SETTLEMENT_VARIABLE_GUIDES.map(
    guide => `${guide.variable}: ${guide.example} (${guide.note})`
  ).join('\n');
}
