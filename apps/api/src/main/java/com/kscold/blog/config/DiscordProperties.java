package com.kscold.blog.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "discord")
public class DiscordProperties {

    private String token = "";
    private String guildId = "";
    private String channelId = "";

    public boolean isConfiguredGuild(String candidateGuildId) {
        return guildId != null && !guildId.isBlank() && guildId.equals(candidateGuildId);
    }
}
