import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | KSCOLD',
  description: '콜딩(Colding)의 개인정보 처리방침입니다.',
};

const EFFECTIVE_DATE = '2026년 4월 22일';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-6 py-16 lg:py-24 [word-break:keep-all]">
        <header className="mb-12">
          <p className="text-xs font-mono text-surface-400 uppercase tracking-[0.25em] mb-3">
            Privacy Policy
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-surface-900">
            개인정보 처리방침
          </h1>
          <p className="mt-4 text-sm text-surface-500">
            시행일: {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="prose prose-sm sm:prose max-w-none text-surface-700 leading-7 space-y-10">
          <p>
            콜딩(이하 “회사”)은 개인정보 보호법을 준수하며, 정보 주체의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리하기 위해 본 개인정보 처리방침을 수립·공개합니다.
          </p>

          <Section title="1. 수집하는 개인정보 항목과 수집 방법">
            <p>회사는 KSCOLD(kscold.com) 서비스 제공을 위해 아래 정보를 수집합니다.</p>
            <List>
              <li>회원가입 시: 이메일, 비밀번호(해시 저장), 닉네임/표시 이름</li>
              <li>프로필 설정 시(선택): 아바타 이미지, 소개, 소셜 링크</li>
              <li>
                이용 과정에서 자동 생성: 접속 IP, 접속 로그, 서비스 이용 기록, 쿠키(JWT 세션 유지용)
              </li>
              <li>
                문의/댓글/피드/방명록 작성 시: 본인이 입력한 본문 및 첨부 이미지
              </li>
              <li>
                접근 요청 기능 사용 시: 요청 대상 글, 작성한 메시지
              </li>
            </List>
          </Section>

          <Section title="2. 개인정보 수집 및 이용 목적">
            <List>
              <li>회원 식별, 로그인, 비밀번호 복구 등 기본 계정 관리</li>
              <li>블로그 글 열람 요청 승인·거절 및 해당 결과 이메일 안내</li>
              <li>방문자 채팅 응대, 디스코드 연동을 통한 실시간 알림</li>
              <li>부정 이용 방지, 보안, 오류 모니터링</li>
              <li>접속 통계 집계 및 서비스 개선</li>
            </List>
          </Section>

          <Section title="3. 개인정보의 보유 및 이용 기간">
            <p>
              회원 탈퇴 또는 관리자의 계정 삭제(비활성화·영구삭제) 시점까지 보관하며, 아래 경우에는 관련 법령에 따라 보관합니다.
            </p>
            <List>
              <li>접속 로그, IP 정보: 3개월 (통신비밀보호법)</li>
              <li>부정 이용 기록: 1년 (내부 방침)</li>
            </List>
            <p className="mt-4">
              <strong>소프트 딜리트(계정 비활성화):</strong> 로그인은 차단되며, 작성한 공개 콘텐츠는 유지됩니다. 복구가 가능합니다.
              <br />
              <strong>하드 딜리트(영구 삭제):</strong> 관리자의 영구 삭제 요청 시 즉시 DB에서 제거되며 복구할 수 없습니다.
            </p>
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            <p>
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 예외적으로 법령에 근거하거나 수사기관의 적법한 요청이 있는 경우에만 제공합니다.
            </p>
          </Section>

          <Section title="5. 개인정보 처리 위탁">
            <p>서비스 제공을 위해 아래 처리자에게 개인정보 처리를 위탁하고 있습니다.</p>
            <List>
              <li>이메일 발송: 구글(Gmail SMTP) — 비밀번호 복구 및 접근 승인 알림 발송</li>
              <li>실시간 알림: Discord — 방문자 채팅 내용 전달</li>
              <li>이미지 저장: 자체 MinIO(S3 호환) — 프로필·피드 이미지 보관</li>
            </List>
          </Section>

          <Section title="6. 이용자의 권리와 행사 방법">
            <List>
              <li>이용자는 언제든지 자신의 개인정보를 조회·수정·삭제할 수 있습니다.</li>
              <li>회원 탈퇴 및 개인정보 삭제 요청은 아래 연락처로 접수해 주세요.</li>
              <li>법정대리인의 동의가 필요한 만 14세 미만 아동의 회원가입은 받지 않습니다.</li>
            </List>
          </Section>

          <Section title="7. 개인정보의 안전성 확보 조치">
            <List>
              <li>비밀번호 BCrypt 해시 저장, 평문 비밀번호 미보관</li>
              <li>JWT 기반 세션 관리 및 HTTPS 전 구간 암호화</li>
              <li>관리자 외 내부 접근 통제</li>
              <li>정기적 보안 점검 및 로그 모니터링</li>
            </List>
          </Section>

          <Section title="8. 쿠키 사용">
            <p>
              로그인 상태 유지를 위해 JWT 토큰을 localStorage 및 HttpOnly 쿠키 형태로 저장합니다. 사용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 기반 기능을 이용할 수 없습니다.
            </p>
          </Section>

          <Section title="9. 개인정보 보호책임자">
            <address className="not-italic">
              <p>상호: 콜딩(Colding)</p>
              <p>대표자: 김승찬</p>
              <p>이메일: <a href="mailto:developerkscold@gmail.com" className="underline">developerkscold@gmail.com</a></p>
              <p>사업자 문의: <a href="mailto:coldingcontact@gmail.com" className="underline">coldingcontact@gmail.com</a></p>
            </address>
          </Section>

          <Section title="10. 고지의 의무">
            <p>
              본 방침은 법령 변경 및 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 이 페이지를 통해 사전 공지합니다.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-surface-900 mb-4">{title}</h2>
      <div className="space-y-3 text-sm">{children}</div>
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2">{children}</ul>;
}
