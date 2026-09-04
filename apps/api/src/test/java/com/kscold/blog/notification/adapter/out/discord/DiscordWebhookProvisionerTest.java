package com.kscold.blog.notification.adapter.out.discord;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kscold.blog.config.DiscordProperties;
import com.kscold.blog.notification.config.NotificationProperties;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Guild;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DiscordWebhookProvisionerTest {

    @Mock private JDA jda;
    @Mock private Guild guild;

    private DiscordProperties discordProperties;
    private NotificationProperties notificationProperties;

    @BeforeEach
    void setUp() {
        discordProperties = new DiscordProperties();
        notificationProperties = new NotificationProperties();
        notificationProperties.setCategoryName("");
        notificationProperties.setSignupChannelName("");
        notificationProperties.setErrorChannelName("");
        notificationProperties.setGuestbookChannelName("");
    }

    @Test
    @DisplayName("설정된 서버 하나만 대상으로 알림 채널을 준비한다")
    void provisionsConfiguredGuildOnly() {
        discordProperties.setGuildId("guild-1");
        when(jda.getGuildById("guild-1")).thenReturn(guild);

        provisioner().provisionAll();

        verify(jda).getGuildById("guild-1");
        verify(jda, never()).getGuilds();
        verifyNoInteractions(guild);
    }

    @Test
    @DisplayName("서버 ID가 없으면 봇이 참여한 서버를 탐색하지 않는다")
    void skipsProvisioningWithoutGuildId() {
        provisioner().provisionAll();

        verify(jda, never()).getGuildById(anyString());
        verify(jda, never()).getGuilds();
    }

    @Test
    @DisplayName("설정된 서버를 찾지 못해도 다른 서버로 대체하지 않는다")
    void doesNotFallbackToAnotherGuild() {
        discordProperties.setGuildId("missing-guild");

        provisioner().provisionAll();

        verify(jda).getGuildById("missing-guild");
        verify(jda, never()).getGuilds();
    }

    private DiscordWebhookProvisioner provisioner() {
        return new DiscordWebhookProvisioner(jda, discordProperties, notificationProperties);
    }
}
