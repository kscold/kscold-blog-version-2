package com.kscold.blog.notification.config;

import com.kscold.blog.notification.domain.model.NotificationChannel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 알림 채널 설정.
 *
 * <p>채널 ID가 아니라 <b>채널 이름</b>을 설정한다. 기동 시 봇이 이름으로 채널을 찾고, 없으면 만들고, 웹훅까지 생성하므로 디스코드에서 ID를 복사해 올 필요가
 * 없다.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "notification.discord")
public class NotificationProperties {

    /** 알림 기능 사용 여부 */
    private boolean enabled = true;

    /** 채널이 없을 때 봇이 직접 만들지 여부. 봇에 채널 관리 권한이 없으면 false 로 둔다. */
    private boolean autoCreateChannel = true;

    /** 회원가입 알림 채널 이름 */
    private String signupChannelName = "회원가입";

    /** 오류 알림 채널 이름 */
    private String errorChannelName = "오류알림";

    /** 방명록 알림 채널 이름 */
    private String guestbookChannelName = "방명록";

    /** 봇이 만드는 웹훅 이름 */
    private String webhookName = "kscold-blog-notifier";

    /** 회원가입 알림이 표시될 봇 이름 */
    private String signupBotName = "회원가입 알림";

    /** 회원가입 알림 봇 아바타 URL(비우면 기본 웹훅 아바타) */
    private String signupBotAvatarUrl = "";

    /** 오류 알림이 표시될 봇 이름 */
    private String errorBotName = "오류 알림";

    /** 오류 알림 봇 아바타 URL(비우면 기본 웹훅 아바타) */
    private String errorBotAvatarUrl = "";

    /** 방명록 알림이 표시될 봇 이름 */
    private String guestbookBotName = "방명록 알림";

    /** 방명록 알림 봇 아바타 URL(비우면 기본 웹훅 아바타) */
    private String guestbookBotAvatarUrl = "";

    /** 채널별로 표시할 봇 이름 */
    public String botName(NotificationChannel channel) {
        return switch (channel) {
            case SIGNUP -> signupBotName;
            case ERROR -> errorBotName;
            case GUESTBOOK -> guestbookBotName;
        };
    }

    /** 채널별 봇 아바타 URL. 비어 있으면 null 을 돌려 웹훅 기본 아바타를 쓰게 함. */
    public String botAvatarUrl(NotificationChannel channel) {
        String url =
                switch (channel) {
                    case SIGNUP -> signupBotAvatarUrl;
                    case ERROR -> errorBotAvatarUrl;
                    case GUESTBOOK -> guestbookBotAvatarUrl;
                };
        return url == null || url.isBlank() ? null : url;
    }
}
