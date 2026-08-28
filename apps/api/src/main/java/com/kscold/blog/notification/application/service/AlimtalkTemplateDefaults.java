package com.kscold.blog.notification.application.service;

import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.model.AlimtalkTemplateStatus;
import java.util.List;

final class AlimtalkTemplateDefaults {

    private AlimtalkTemplateDefaults() {}

    static List<AlimtalkTemplate> create() {
        return List.of(
                template(
                        "STACK_SHARE_SETTLEMENT",
                        "KSCOLD 공동 구독 정산 안내",
                        "공동 구독 참여자에게 월별 분담금과 입금 계좌를 안내합니다.",
                        """
                        [KSCOLD 정산 안내]

                        #{이름}님, #{정산기간} #{서비스명} 공동 구독 정산 금액을 안내드립니다.

                        - 총 결제 금액: #{총금액}
                        - 참여 인원: #{참여인원}명
                        - 내 분담금: #{분담금}

                        아래 계좌로 입금해주세요.
                        - 입금 계좌: #{입금계좌}
                        - 입금 기한: #{입금기한}
                        - 문의: #{연락처}

                        금액이나 참여 정보가 다르면 입금 전에 알려주세요.
                        """,
                        List.of(
                                "#{이름}", "#{정산기간}", "#{서비스명}", "#{총금액}", "#{참여인원}", "#{분담금}",
                                "#{입금계좌}", "#{입금기한}", "#{연락처}")),
                template(
                        "SIGNUP_WELCOME",
                        "KSCOLD 가입 안내",
                        "가입 완료 사실과 계정 정보를 안내합니다.",
                        """
                        [KSCOLD 가입 안내]

                        #{이름}님, KSCOLD 가입이 완료되었습니다.

                        - 가입 계정: #{이메일}
                        - 가입 일시: #{가입일시}

                        본인이 요청하지 않은 가입이라면 운영자에게 알려주세요.
                        """,
                        List.of("#{이름}", "#{이메일}", "#{가입일시}")),
                template(
                        "COMMENT_REPLY",
                        "KSCOLD 답글 안내",
                        "댓글이나 방명록에 새 답글이 등록되었음을 안내합니다.",
                        """
                        [KSCOLD 답글 안내]

                        #{이름}님이 남긴 #{콘텐츠종류}에 새로운 답글이 등록되었습니다.

                        - 글 제목: #{글제목}
                        - 답글 작성자: #{답글작성자}
                        - 답글 내용: #{답글요약}

                        KSCOLD에서 전체 내용을 확인해주세요.
                        """,
                        List.of("#{이름}", "#{콘텐츠종류}", "#{글제목}", "#{답글작성자}", "#{답글요약}")),
                template(
                        "CHAT_REMINDER",
                        "KSCOLD 채팅 답변 안내",
                        "채팅 답변이 도착했음을 안내합니다.",
                        """
                        [KSCOLD 채팅 알림]

                        #{이름}님에게 새로운 채팅 답변이 도착했습니다.

                        - 답변 시각: #{답변시각}
                        - 답변 내용: #{답변요약}

                        KSCOLD 채팅에서 이어서 확인해주세요.
                        """,
                        List.of("#{이름}", "#{답변시각}", "#{답변요약}")),
                template(
                        "ADMIN_NIGHT_SCHEDULE",
                        "KSCOLD 오프라인 일정 안내",
                        "관심을 남긴 오프라인 프로그램의 확정 일정을 안내합니다.",
                        """
                        [KSCOLD 일정 안내]

                        #{이름}님이 관심을 남긴 #{프로그램명} 일정이 확정되었습니다.

                        - 일시: #{일시}
                        - 장소: #{장소}
                        - 참가비: #{참가비}

                        자세한 안내는 KSCOLD에서 확인해주세요.
                        """,
                        List.of("#{이름}", "#{프로그램명}", "#{일시}", "#{장소}", "#{참가비}")));
    }

    private static AlimtalkTemplate template(
            String key, String name, String purpose, String body, List<String> variables) {
        return AlimtalkTemplate.builder()
                .templateKey(key)
                .name(name)
                .purpose(purpose)
                .body(body)
                .variables(variables)
                .status(AlimtalkTemplateStatus.DRAFT)
                .build();
    }
}
