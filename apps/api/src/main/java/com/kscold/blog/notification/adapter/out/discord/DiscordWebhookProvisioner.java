package com.kscold.blog.notification.adapter.out.discord;

import com.kscold.blog.config.DiscordProperties;
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
import net.dv8tion.jda.api.entities.channel.concrete.Category;
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
    private final DiscordProperties discordProperties;
    private final NotificationProperties properties;
    private final Map<NotificationChannel, String> webhookUrls =
            new ConcurrentHashMap<>(new EnumMap<>(NotificationChannel.class));

    public DiscordWebhookProvisioner(
            @Nullable JDA jda,
            DiscordProperties discordProperties,
            NotificationProperties properties) {
        this.jda = jda;
        this.discordProperties = discordProperties;
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

        String guildId = discordProperties.getGuildId();
        if (guildId == null || guildId.isBlank()) {
            log.error("DISCORD_GUILD_ID가 없어 알림 채널 자동 준비를 중단합니다.");
            return;
        }

        Guild guild = jda.getGuildById(guildId);
        if (guild == null) {
            log.error("설정된 Discord 서버를 찾을 수 없어 알림 채널 자동 준비를 중단합니다.");
            return;
        }

        Category category = findOrCreateCategory(guild);
        for (NotificationChannel channel : NotificationChannel.values()) {
            provision(guild, category, channel, properties.channelName(channel));
        }
    }

    private void provision(
            Guild guild,
            @Nullable Category category,
            NotificationChannel channel,
            String channelName) {
        if (channelName == null || channelName.isBlank() || webhookUrls.containsKey(channel)) {
            return;
        }

        try {
            TextChannel textChannel = findOrCreateChannel(guild, category, channelName);
            if (textChannel == null) {
                return;
            }
            alignChannel(textChannel, category, channel);

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
            log.warn(
                    "디스코드 알림 채널 준비 실패: channel={}, type={}",
                    channel,
                    exception.getClass().getSimpleName());
        }
    }

    @Nullable
    private Category findOrCreateCategory(Guild guild) {
        String categoryName = properties.getCategoryName();
        if (categoryName == null || categoryName.isBlank()) {
            return null;
        }

        List<Category> found = guild.getCategoriesByName(categoryName, true);
        if (!found.isEmpty()) {
            return found.getFirst();
        }
        if (!properties.isAutoCreateChannel()) {
            log.info("알림 카테고리 '{}' 을 찾지 못했고 자동 생성이 꺼져 있어 건너뜁니다.", categoryName);
            return null;
        }
        if (!guild.getSelfMember().hasPermission(Permission.MANAGE_CHANNEL)) {
            log.warn("알림 카테고리 '{}' 이 없지만 봇에 채널 관리 권한이 없어 만들지 못했습니다.", categoryName);
            return null;
        }

        Category created = guild.createCategory(categoryName).complete();
        log.info("알림 카테고리 자동 생성: {}", created.getName());
        return created;
    }

    @Nullable
    private TextChannel findOrCreateChannel(
            Guild guild, @Nullable Category category, String channelName) {
        List<TextChannel> found = guild.getTextChannelsByName(channelName, true);
        if (!found.isEmpty()) {
            return found.stream()
                    .filter(
                            channel ->
                                    category != null
                                            && category.equals(channel.getParentCategory()))
                    .findFirst()
                    .orElse(found.getFirst());
        }

        if (!properties.isAutoCreateChannel()) {
            log.info("알림 채널 '{}' 을 찾지 못했고 자동 생성이 꺼져 있어 건너뜁니다.", channelName);
            return null;
        }
        if (!guild.getSelfMember().hasPermission(Permission.MANAGE_CHANNEL)) {
            log.warn("알림 채널 '{}' 이 없지만 봇에 채널 관리 권한이 없어 만들지 못했습니다.", channelName);
            return null;
        }

        var createAction = guild.createTextChannel(channelName);
        if (category != null) {
            createAction.setParent(category);
        }
        TextChannel created = createAction.complete();
        log.info("알림 채널 자동 생성: #{}", created.getName());
        return created;
    }

    private void alignChannel(
            TextChannel channel,
            @Nullable Category category,
            NotificationChannel notificationChannel) {
        if (!properties.isAlignChannelCategory()) {
            return;
        }
        if (!channel.getGuild().getSelfMember().hasPermission(Permission.MANAGE_CHANNEL)) {
            log.warn("채널 #{} 을 운영 카테고리에 정렬할 권한이 없습니다.", channel.getName());
            return;
        }

        String topic = properties.channelTopic(notificationChannel);
        boolean moveRequired = category != null && !category.equals(channel.getParentCategory());
        boolean topicRequired = topic != null && !topic.equals(channel.getTopic());
        if (!moveRequired && !topicRequired) {
            return;
        }

        var manager = channel.getManager();
        if (moveRequired) {
            manager.setParent(category);
        }
        if (topicRequired) {
            manager.setTopic(topic);
        }
        manager.complete();
        log.info("디스코드 알림 채널 정렬 완료: #{}", channel.getName());
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
