package com.kscold.blog.notification.config;

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

    /** 봇이 만드는 웹훅 이름 */
    private String webhookName = "kscold-blog-notifier";
}
