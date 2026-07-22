package com.kscold.blog.notification.adapter.out.discord;

import com.kscold.blog.notification.config.NotificationProperties;
import com.kscold.blog.notification.domain.model.NotificationChannel;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Webhook;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

/**
 * 채널과 웹훅을 자동으로 준비함.
 *
 * <p>순서: ① 설정된 이름으로 채널을 찾고 ② 없으면 만들고(권한 있을 때) ③ 그 채널의 웹훅을 찾거나 만들어 URL을 캐싱한다. 덕분에 디스코드에서 채널 ID나 웹훅
 * URL을 복사해 환경변수에 넣는 작업이 필요 없다.
 *
 * <p>권한이 없거나 실패하면 해당 채널만 비활성으로 두고 앱은 정상 동작한다.
 */
@Slf4j
@Component
public class DiscordWebhookProvisioner {

    @Nullable private final JDA jda;
    private final NotificationProperties properties;
    private final Map<NotificationChannel, String> webhookUrls =
            new ConcurrentHashMap<>(new EnumMap<>(NotificationChannel.class));

    public DiscordWebhookProvisioner(@Nullable JDA jda, NotificationProperties properties) {
        this.jda = jda;
        this.properties = properties;
    }

    /** 준비된 웹훅 URL. 아직 준비되지 않았으면 비어 있음. */
    public Optional<String> webhookUrl(NotificationChannel channel) {
        return Optional.ofNullable(webhookUrls.get(channel));
    }

    public boolean hasAnyWebhook() {
        return !webhookUrls.isEmpty();
    }

    /** 모든 알림 채널의 웹훅을 준비함. 봇 연결이 끝난 뒤 한 번 호출된다. */
    public void provisionAll() {
        if (jda == null || !properties.isEnabled()) {
            return;
        }

        for (Guild guild : jda.getGuilds()) {
            provision(guild, NotificationChannel.SIGNUP, properties.getSignupChannelName());
            provision(guild, NotificationChannel.ERROR, properties.getErrorChannelName());
        }
    }

    private void provision(Guild guild, NotificationChannel channel, String channelName) {
        if (channelName == null || channelName.isBlank() || webhookUrls.containsKey(channel)) {
            return;
        }

        try {
            TextChannel textChannel = findOrCreateChannel(guild, channelName);
            if (textChannel == null) {
                return;
            }

            findOrCreateWebhook(textChannel)
                    .ifPresent(
                            url -> {
                                webhookUrls.put(channel, url);
                                log.info(
                                        "디스코드 알림 채널 준비 완료: {} -> #{}",
                                        channel,
                                        textChannel.getName());
                            });
        } catch (Exception exception) {
            log.warn("디스코드 알림 채널 준비 실패: {} ({})", channel, channelName, exception);
        }
    }

    @Nullable
    private TextChannel findOrCreateChannel(Guild guild, String channelName) {
        List<TextChannel> found = guild.getTextChannelsByName(channelName, true);
        if (!found.isEmpty()) {
            return found.getFirst();
        }

        if (!properties.isAutoCreateChannel()) {
            log.info("알림 채널 '{}' 을 찾지 못했고 자동 생성이 꺼져 있어 건너뜁니다.", channelName);
            return null;
        }
        if (!guild.getSelfMember().hasPermission(Permission.MANAGE_CHANNEL)) {
            log.warn("알림 채널 '{}' 이 없지만 봇에 채널 관리 권한이 없어 만들지 못했습니다.", channelName);
            return null;
        }

        TextChannel created = guild.createTextChannel(channelName).complete();
        log.info("알림 채널 자동 생성: #{}", created.getName());
        return created;
    }

    private Optional<String> findOrCreateWebhook(TextChannel channel) {
        if (!channel.getGuild()
                .getSelfMember()
                .hasPermission(channel, Permission.MANAGE_WEBHOOKS)) {
            log.warn("채널 #{} 에 웹훅 관리 권한이 없어 웹훅을 준비하지 못했습니다.", channel.getName());
            return Optional.empty();
        }

        // 이미 우리가 만든 웹훅이 있으면 재사용한다(재기동마다 새로 만들지 않도록).
        Optional<String> existing =
                channel.retrieveWebhooks().complete().stream()
                        .filter(webhook -> properties.getWebhookName().equals(webhook.getName()))
                        .map(Webhook::getUrl)
                        .findFirst();
        if (existing.isPresent()) {
            return existing;
        }

        Webhook created = channel.createWebhook(properties.getWebhookName()).complete();
        log.info("웹훅 자동 생성: #{} ({})", channel.getName(), properties.getWebhookName());
        return Optional.of(created.getUrl());
    }
}
