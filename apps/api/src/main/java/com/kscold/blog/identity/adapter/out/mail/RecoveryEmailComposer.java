package com.kscold.blog.identity.adapter.out.mail;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.identity.application.port.out.RecoveryMailMessage;
import com.kscold.blog.identity.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecoveryEmailComposer {

    private final RecoveryMailProperties recoveryMailProperties;

    public RecoveryMailMessage buildUsernameReminder(User user) {
        String subject = "[KSCOLD] 가입 아이디 안내";
        String preview = user.getDisplayName() + "님이 가입에 사용한 아이디를 안내드려요.";
        String summary = "가입에 사용한 아이디를 아래에서 바로 확인할 수 있어요.";
        String body = """
                아이디 찾기 요청이 들어와 가입 정보를 확인했습니다.
                아래 아이디로 다시 로그인하시면 됩니다.
                """;
        String details = """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">ACCOUNT</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:22px; color:#475569;">가입 아이디</p>
                          <p style="margin:0; font-size:28px; line-height:36px; font-weight:800; color:#0F172A;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px;">
                    <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">
                      비밀번호가 기억나지 않는다면 아래 링크에서 재설정도 함께 진행할 수 있습니다.
                    </p>
                  </td>
                </tr>
                """.formatted(escapeHtml(user.getUsername()));

        String actionUrl = recoveryMailProperties.resolvePublicUrl("/login/recovery?tab=password");
        String actionLabel = "비밀번호 재설정하기";
        String plainText = """
                %s님, 가입 아이디를 안내드립니다.

                아이디: %s

                비밀번호가 기억나지 않는다면 아래 주소에서 재설정할 수 있습니다.
                %s
                """.formatted(user.getDisplayName(), user.getUsername(), actionUrl);

        return new RecoveryMailMessage(
                user.getEmail(),
                subject,
                plainText,
                buildTemplate(preview, "가입 아이디를 확인해 주세요", summary, body, details, actionUrl, actionLabel)
        );
    }

    public RecoveryMailMessage buildPasswordReset(User user, String resetUrl) {
        String expiryMinutes = Long.toString(recoveryMailProperties.getPasswordResetExpiryMinutes());
        String subject = "[KSCOLD] 비밀번호 재설정 안내";
        String preview = "비밀번호를 다시 설정할 수 있도록 안전한 링크를 보내드려요.";
        String summary = "아래 버튼을 눌러 새 비밀번호를 설정해 주세요.";
        String body = """
                비밀번호 재설정 요청이 확인되어, 한 번만 사용할 수 있는 안전한 링크를 준비했습니다.
                링크는 너무 길게 열어두지 않고 %s분 동안만 유효하게 동작합니다.
                """.formatted(expiryMinutes);
        String details = """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">SECURITY</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">요청 계정</p>
                          <p style="margin:0; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:6px 0 0; font-size:14px; line-height:22px; color:#64748B;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """.formatted(escapeHtml(user.getDisplayName()), escapeHtml(user.getEmail()));
        String plainText = """
                %s님, 비밀번호 재설정 링크를 보내드립니다.

                아래 주소는 %s분 동안만 유효합니다.
                %s

                본인이 요청하지 않았다면 이 메일은 무시하셔도 괜찮습니다.
                """.formatted(user.getDisplayName(), expiryMinutes, resetUrl);

        return new RecoveryMailMessage(
                user.getEmail(),
                subject,
                plainText,
                buildTemplate(preview, "비밀번호를 다시 설정해 주세요", summary, body, details, resetUrl, "비밀번호 다시 설정하기")
        );
    }

    public RecoveryMailMessage buildWelcome(User user) {
        String loginUrl = recoveryMailProperties.resolvePublicUrl("/login");
        String subject = "[KSCOLD] 가입을 환영합니다";
        String preview = user.getDisplayName() + "님의 가입이 완료되었습니다.";
        String summary = "김승찬의 블로그에서 일상과 기술, 작업 기록을 지금부터 편하게 둘러보세요.";
        String body = """
                가입이 정상적으로 완료되었습니다.
                이제 블로그 글, 피드, Vault 노트, 방명록, 채팅 기능을 현재 계정으로 바로 이용하실 수 있습니다.
                """;
        String details = """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">WELCOME</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">가입 계정</p>
                          <p style="margin:0; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:6px 0 0; font-size:14px; line-height:22px; color:#64748B;">아이디 %s 로 바로 로그인할 수 있습니다.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """.formatted(escapeHtml(user.getEmail()), escapeHtml(user.getUsername()));

        String plainText = """
                %s님, 가입을 환영합니다.

                가입한 이메일: %s
                아이디: %s

                로그인:
                %s
                """.formatted(user.getDisplayName(), user.getEmail(), user.getUsername(), loginUrl);

        return new RecoveryMailMessage(
                user.getEmail(),
                subject,
                plainText,
                buildTemplate(preview, "가입을 환영합니다", summary, body, details, loginUrl, "로그인 바로가기")
        );
    }

    public RecoveryMailMessage buildUnreadChatReminder(
            User user,
            String adminName,
            String latestContent,
            long unreadCount,
            String actionUrl
    ) {
        String subject = "[KSCOLD] 새 답장이 도착했습니다";
        String preview = "관리자가 남긴 답장이 아직 확인되지 않았습니다.";
        String summary = "채팅에 새 답장이 있어요. 아래에서 바로 확인할 수 있습니다.";
        String body = """
                관리자가 남긴 새 답장이 아직 읽히지 않아 한 번 더 알려드립니다.
                답장이 쌓이기 전에 아래 버튼으로 들어와 이어서 확인해 주세요.
                """;
        String details = """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">CHAT UPDATE</p>
                          <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#475569;">최근 답장</p>
                          <p style="margin:0 0 12px; font-size:20px; line-height:30px; font-weight:800; color:#0F172A;">%s님의 새 답장 %d건</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """.formatted(
                escapeHtml(adminName),
                unreadCount,
                truncateForMail(latestContent, 140)
        );

        String plainText = """
                %s님, 관리자가 남긴 새 답장 %d건이 아직 확인되지 않았습니다.

                최근 답장:
                %s

                채팅 열기:
                %s
                """.formatted(user.getDisplayName(), unreadCount, latestContent, actionUrl);

        return new RecoveryMailMessage(
                user.getEmail(),
                subject,
                plainText,
                buildTemplate(preview, "새 답장을 확인해 주세요", summary, body, details, actionUrl, "채팅 확인하기")
        );
    }

    public RecoveryMailMessage buildAdminNightRequestConfirmation(AdminNightRequest request) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청이 접수되었습니다";
        String preview = request.getRequesterName() + "님의 Admin Night 신청을 잘 받았습니다.";
        String summary = "신청 PR이 도착했습니다. 확인 후 승인되면 merge / meet 일정으로 이어집니다.";
        String body = """
                미뤄둔 일을 끝내기 위한 Admin Night 신청이 접수되었습니다.
                승인 전까지는 대기 상태로 두고, 확인이 끝나면 일정 슬롯과 함께 실제 만남 안내를 보내드릴게요.
                """;
        String details = buildAdminNightDetails(
                "REQUEST RECEIVED",
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getPreferredSlot()
        );
        String plainText = """
                %s님, Admin Night 신청이 접수되었습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                승인 여부와 일정은 아래 페이지에서 확인할 수 있습니다.
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterName(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getPreferredSlot().getDate(),
                request.getPreferredSlot().getWeekday(),
                request.getPreferredSlot().getTimeLabel(),
                request.getPreferredSlot().getFocus(),
                fallbackText(request.getMessage(), "별도 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                buildTemplate(preview, "신청 PR을 잘 받았습니다", summary, body, details, actionUrl, "Admin Night 페이지 보기")
        );
    }

    public RecoveryMailMessage buildAdminNightRequestNotification(AdminNightRequest request, String adminEmail) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] 새로운 Admin Night 신청이 도착했습니다";
        String preview = request.getRequesterName() + "님이 이번 Admin Night에 함께 붙고 싶다는 신청을 보냈습니다.";
        String summary = "새로운 신청이 도착했습니다. 시간과 의지를 리뷰한 뒤 승인하면 일정이 보드에 반영됩니다.";
        String body = """
                새로운 Admin Night 신청이 도착했습니다.
                신청 내용을 확인하고 승인하면 공개 캘린더와 참가자 메일에 바로 일정이 반영됩니다.
                """;
        String details = buildAdminNightDetails(
                "NEW REQUEST",
                request.getRequesterName() + " · " + request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getPreferredSlot()
        ) + """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#64748B;">신청자 이메일: %s</p>
                    <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">진행 방식: %s</p>
                  </td>
                </tr>
                """.formatted(
                escapeHtml(request.getRequesterEmail()),
                escapeHtml(describeParticipationMode(request.getParticipationMode()))
        );
        String plainText = """
                새로운 Admin Night 신청이 도착했습니다.

                신청자: %s (%s)
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                관리자 페이지:
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterEmail(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getPreferredSlot().getDate(),
                request.getPreferredSlot().getWeekday(),
                request.getPreferredSlot().getTimeLabel(),
                request.getPreferredSlot().getFocus(),
                fallbackText(request.getMessage(), "별도 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                adminEmail,
                subject,
                plainText,
                buildTemplate(preview, "새로운 신청 PR이 도착했습니다", summary, body, details, actionUrl, "관리자 보드에서 확인하기")
        );
    }

    public RecoveryMailMessage buildAdminNightApprovedForRequester(AdminNightRequest request) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 일정이 merge 되었습니다";
        String preview = request.getRequesterName() + "님의 Admin Night 신청이 승인되었습니다.";
        String summary = "승인이 완료되어 일정이 공개 보드에 반영되었습니다. 같은 시간대에 조용히 붙어 끝내면 됩니다.";
        String body = """
                Admin Night 신청이 승인되었습니다.
                공개 보드에도 같은 일정이 반영되었고, 아래 시간대에 맞춰 그대로 merge / meet, 즉 실제 만남 흐름으로 이어가면 됩니다.
                """;
        String details = buildAdminNightDetails(
                "MERGED SLOT",
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getScheduledSlot()
        );
        String plainText = """
                %s님, Admin Night 신청이 승인되었습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                확정 시간: %s %s / %s / %s
                메모: %s

                페이지에서 보드와 안내를 다시 확인할 수 있습니다.
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterName(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getScheduledSlot().getDate(),
                request.getScheduledSlot().getWeekday(),
                request.getScheduledSlot().getTimeLabel(),
                request.getScheduledSlot().getFocus(),
                fallbackText(request.getMessage(), "별도 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                buildTemplate(preview, "일정이 merge 되었습니다", summary, body, details, actionUrl, "보드에서 일정 확인하기")
        );
    }

    public RecoveryMailMessage buildAdminNightInfoRequestedForRequester(AdminNightRequest request) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청에 추가 정보가 필요합니다";
        String preview = request.getRequesterName() + "님의 신청을 확인했고, 조금 더 알고 싶은 내용이 있습니다.";
        String summary = "관리자 메모를 확인하고 같은 신청을 보완해 다시 보내주세요. 보완본이 도착하면 다시 review 합니다.";
        String body = """
                Admin Night 신청을 잘 확인했습니다.
                다만 실제 만남으로 이어가기 전에 조금 더 알고 싶은 정보가 있어, 아래 메모를 남겨 두었습니다.
                """;
        String details = buildAdminNightDetails(
                "추가 정보 요청",
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getPreferredSlot()
        ) + buildAdminNightReviewNote("관리자 메모", request.getReviewNote());
        String plainText = """
                %s님, Admin Night 신청에 추가 정보가 필요합니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                관리자 메모: %s

                아래 페이지에서 내용을 보완해 다시 보내주세요.
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterName(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getPreferredSlot().getDate(),
                request.getPreferredSlot().getWeekday(),
                request.getPreferredSlot().getTimeLabel(),
                request.getPreferredSlot().getFocus(),
                fallbackText(request.getReviewNote(), "추가 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                buildTemplate(preview, "추가 정보가 필요합니다", summary, body, details, actionUrl, "신청 보완하기")
        );
    }

    public RecoveryMailMessage buildAdminNightApprovedForAdmin(AdminNightRequest request, String adminEmail) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] Admin Night 일정 승인이 반영되었습니다";
        String preview = request.getRequesterName() + "님 일정이 보드에 반영되었습니다.";
        String summary = "승인된 신청이 캘린더에 반영되었습니다. 같은 시간대에 실제 만남 흐름으로 이어가면 됩니다.";
        String body = """
                승인한 Admin Night 신청이 일정에 반영되었습니다.
                공개 캘린더와 참가자 안내 메일까지 함께 반영되었으니, 필요한 경우 여기서 다시 확인해 주세요.
                """;
        String details = buildAdminNightDetails(
                "승인 완료",
                request.getRequesterName() + " · " + request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getScheduledSlot()
        );
        String plainText = """
                승인 완료된 Admin Night 일정입니다.

                신청자: %s (%s)
                끝낼 일: %s
                진행 방식: %s
                확정 시간: %s %s / %s / %s

                관리자 페이지:
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterEmail(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getScheduledSlot().getDate(),
                request.getScheduledSlot().getWeekday(),
                request.getScheduledSlot().getTimeLabel(),
                request.getScheduledSlot().getFocus(),
                actionUrl
        );

        return new RecoveryMailMessage(
                adminEmail,
                subject,
                plainText,
                buildTemplate(preview, "승인한 일정이 보드에 올라갔습니다", summary, body, details, actionUrl, "관리자 보드 다시 보기")
        );
    }

    public RecoveryMailMessage buildAdminNightResubmittedConfirmation(AdminNightRequest request) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 보완본이 다시 접수되었습니다";
        String preview = request.getRequesterName() + "님의 보완된 신청을 다시 받았습니다.";
        String summary = "보완한 신청이 다시 접수되었습니다. 확인 후 승인되면 일정이 캘린더에 반영됩니다.";
        String body = """
                관리자 메모를 반영한 보완본이 다시 접수되었습니다.
                신청 내용과 시간대를 다시 review 한 뒤, 승인되면 실제 만남 일정으로 이어집니다.
                """;
        String details = buildAdminNightDetails(
                "보완본 재접수",
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getPreferredSlot()
        );
        String plainText = """
                %s님, 보완한 Admin Night 신청이 다시 접수되었습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                신청 상태는 아래 페이지에서 계속 확인할 수 있습니다.
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterName(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getPreferredSlot().getDate(),
                request.getPreferredSlot().getWeekday(),
                request.getPreferredSlot().getTimeLabel(),
                request.getPreferredSlot().getFocus(),
                fallbackText(request.getMessage(), "별도 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                buildTemplate(preview, "보완한 신청을 다시 받았습니다", summary, body, details, actionUrl, "신청 상태 다시 보기")
        );
    }

    public RecoveryMailMessage buildAdminNightResubmittedNotification(AdminNightRequest request, String adminEmail) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 보완본이 도착했습니다";
        String preview = request.getRequesterName() + "님이 추가 정보를 반영한 보완본을 다시 보냈습니다.";
        String summary = "보완된 신청이 다시 대기열에 올라왔습니다. 확인 후 승인하거나 필요한 경우 메모를 남겨 다시 요청할 수 있습니다.";
        String body = """
                추가 정보를 요청했던 Admin Night 신청의 보완본이 도착했습니다.
                관리자 보드에서 내용을 다시 확인하고, 승인하거나 필요한 경우 메모를 남겨 다시 요청할 수 있습니다.
                """;
        String details = buildAdminNightDetails(
                "보완본 재검토",
                request.getRequesterName() + " · " + request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getPreferredSlot()
        ) + """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <p style="margin:0 0 8px; font-size:14px; line-height:24px; color:#64748B;">신청자 이메일: %s</p>
                    <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">진행 방식: %s</p>
                  </td>
                </tr>
                """.formatted(
                escapeHtml(request.getRequesterEmail()),
                escapeHtml(describeParticipationMode(request.getParticipationMode()))
        );
        String plainText = """
                Admin Night 신청 보완본이 도착했습니다.

                신청자: %s (%s)
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                메모: %s

                관리자 페이지:
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterEmail(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getPreferredSlot().getDate(),
                request.getPreferredSlot().getWeekday(),
                request.getPreferredSlot().getTimeLabel(),
                request.getPreferredSlot().getFocus(),
                fallbackText(request.getMessage(), "별도 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                adminEmail,
                subject,
                plainText,
                buildTemplate(preview, "보완본이 다시 도착했습니다", summary, body, details, actionUrl, "관리자 보드에서 다시 보기")
        );
    }

    public RecoveryMailMessage buildAdminNightRejectedForRequester(AdminNightRequest request) {
        String actionUrl = recoveryMailProperties.resolvePublicUrl("/admin-night");
        String subject = "[KSCOLD] Admin Night 신청 상태를 안내드립니다";
        String preview = request.getRequesterName() + "님의 이번 신청은 이번 슬롯에 바로 반영되지 않았습니다.";
        String summary = "이번 신청은 바로 일정으로 연결되지 않았습니다. 다음 슬롯에 맞춰 다시 가볍게 PR을 보내도 괜찮습니다.";
        String body = """
                이번 신청은 현재 일정에 바로 반영되지는 않았습니다.
                그래도 Admin Night 문화 페이지는 계속 열려 있으니, 다음 시간대에 맞춰 다시 신청해도 괜찮습니다.
                """;
        String details = buildAdminNightDetails(
                "이번 일정 보류",
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getPreferredSlot()
        ) + buildAdminNightReviewNote("관리자 메모", request.getReviewNote());
        String plainText = """
                %s님, 이번 Admin Night 신청은 현재 일정에 바로 반영되지 않았습니다.

                실명: %s
                끝낼 일: %s
                진행 방식: %s
                희망 시간: %s %s / %s / %s
                관리자 메모: %s

                다음 슬롯에 다시 신청하려면 아래 페이지를 확인해 주세요.
                %s
                """.formatted(
                request.getRequesterName(),
                request.getRequesterName(),
                request.getTaskTitle(),
                describeParticipationMode(request.getParticipationMode()),
                request.getPreferredSlot().getDate(),
                request.getPreferredSlot().getWeekday(),
                request.getPreferredSlot().getTimeLabel(),
                request.getPreferredSlot().getFocus(),
                fallbackText(request.getReviewNote(), "별도 메모 없음"),
                actionUrl
        );

        return new RecoveryMailMessage(
                request.getRequesterEmail(),
                subject,
                plainText,
                buildTemplate(preview, "이번 신청은 보류되었습니다", summary, body, details, actionUrl, "다음 슬롯 다시 보기")
        );
    }

    private String buildTemplate(
            String previewText,
            String title,
            String summary,
            String body,
            String detailsHtml,
            String actionUrl,
            String actionLabel
    ) {
        String safePreview = escapeHtml(previewText);
        String safeTitle = escapeHtml(title);
        String safeSummary = escapeHtml(summary);
        String safeBody = paragraphize(body);
        String safeActionUrl = escapeHtml(actionUrl);
        String safeActionLabel = escapeHtml(actionLabel);
        String safeBrand = escapeHtml(recoveryMailProperties.getFromName());

        return """
                <!doctype html>
                <html lang="ko">
                  <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>%s</title>
                  </head>
                  <body style="margin:0; padding:0; background-color:#F3F6FB; font-family:'Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',Arial,sans-serif; color:#0F172A;">
                    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">%s</div>
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3F6FB;">
                      <tr>
                        <td align="center" style="padding:32px 16px;">
                          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;">
                            <tr>
                              <td align="center" style="padding:0 0 16px;">
                                <span style="display:inline-block; padding:9px 16px; border-radius:999px; background-color:#E8EEF8; color:#0F172A; font-size:12px; line-height:18px; letter-spacing:0.18em; font-weight:800;">%s BLOG</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="border:1px solid #E2E8F0; border-radius:28px; background-color:#FFFFFF; box-shadow:0 12px 40px rgba(15,23,42,0.08); overflow:hidden;">
                                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding:36px 32px 12px;">
                                      <p style="margin:0 0 12px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">ACCOUNT SUPPORT</p>
                                      <h1 style="margin:0 0 14px; font-size:34px; line-height:44px; letter-spacing:-0.03em; color:#0F172A; font-weight:800;">%s</h1>
                                      <p style="margin:0; font-size:16px; line-height:28px; color:#475569;">%s</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 32px 8px;">
                                      <p style="margin:0; font-size:15px; line-height:28px; color:#334155;">%s</p>
                                    </td>
                                  </tr>
                                  %s
                                  <tr>
                                    <td align="center" style="padding:0 32px 32px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td align="center" style="border-radius:999px; background-color:#0F172A;">
                                            <a href="%s" target="_blank" style="display:inline-block; padding:15px 28px; font-size:15px; line-height:22px; font-weight:800; color:#FFFFFF; text-decoration:none;">%s</a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0 32px 28px;">
                                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px dashed #CBD5E1; border-radius:18px; background-color:#F8FAFC;">
                                        <tr>
                                          <td style="padding:18px 20px;">
                                            <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.14em; color:#94A3B8; font-weight:700;">DIRECT LINK</p>
                                            <p style="margin:0; font-size:14px; line-height:24px; color:#334155; word-break:break-all;">%s</p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0 32px 36px;">
                                      <p style="margin:0; font-size:13px; line-height:22px; color:#64748B;">
                                        본인이 요청하지 않았다면 이 메일은 무시하셔도 괜찮습니다. 도움이 필요하면 블로그 운영자에게 알려 주세요.
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:18px 12px 0; text-align:center;">
                                <p style="margin:0; font-size:12px; line-height:20px; color:#94A3B8;">KSCOLD BLOG · 김승찬의 블로그, 일상과 기술 그리고 작업 기록을 전합니다.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(
                safeTitle,
                safePreview,
                safeBrand,
                safeTitle,
                safeSummary,
                safeBody,
                detailsHtml,
                safeActionUrl,
                safeActionLabel,
                safeActionUrl
        );
    }

    private String paragraphize(String text) {
        String escaped = escapeHtml(text).replace("\n", "<br />");
        return escaped;
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String truncateForMail(String value, int maxLength) {
        String escaped = escapeHtml(value);
        if (escaped.length() <= maxLength) {
            return escaped;
        }
        return escaped.substring(0, maxLength - 1) + "…";
    }

    private String buildAdminNightDetails(
            String label,
            String headline,
            String message,
            AdminNightRequest.ParticipationMode participationMode,
            AdminNightRequest.SlotInfo slot
    ) {
        return """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0; border-radius:20px; background-color:#F8FAFC;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#94A3B8; font-weight:700;">%s</p>
                          <p style="margin:0 0 8px; font-size:22px; line-height:30px; font-weight:800; color:#0F172A;">%s</p>
                          <p style="margin:0 0 10px; font-size:14px; line-height:24px; color:#475569;">%s %s · %s · %s</p>
                          <p style="margin:0 0 10px; font-size:14px; line-height:24px; color:#475569;">진행 방식: %s</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#64748B;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """.formatted(
                escapeHtml(label),
                escapeHtml(headline),
                escapeHtml(slot.getDate().toString()),
                escapeHtml(slot.getWeekday()),
                escapeHtml(slot.getTimeLabel()),
                escapeHtml(slot.getFocus()),
                escapeHtml(describeParticipationMode(participationMode)),
                escapeHtml(fallbackText(message, "별도 메모 없음"))
        );
    }

    private String buildAdminNightReviewNote(String label, String reviewNote) {
        if (reviewNote == null || reviewNote.isBlank()) {
            return "";
        }

        return """
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #FED7AA; border-radius:20px; background-color:#FFF7ED;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px; font-size:12px; line-height:18px; letter-spacing:0.18em; color:#C2410C; font-weight:700;">%s</p>
                          <p style="margin:0; font-size:14px; line-height:24px; color:#7C2D12;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                """.formatted(
                escapeHtml(label),
                escapeHtml(reviewNote)
        );
    }

    private String describeParticipationMode(AdminNightRequest.ParticipationMode participationMode) {
        if (participationMode == null) {
            return "미정";
        }

        return switch (participationMode) {
            case ONLINE -> "온라인";
            case OFFLINE -> "오프라인";
            case FLEXIBLE -> "온라인 / 오프라인 모두 가능";
        };
    }

    private String fallbackText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
