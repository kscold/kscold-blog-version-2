package com.kscold.blog.chat.adapter.out.discord;

import net.dv8tion.jda.api.EmbedBuilder;

import java.awt.Color;
import java.time.Instant;

final class DiscordMessageEmbeds {

    private DiscordMessageEmbeds() {
    }

    static EmbedBuilder visitorMessage(String username, String content) {
        return new EmbedBuilder()
                .setAuthor(username, null, null)
                .setDescription(content)
                .setColor(new Color(59, 130, 246))
                .setTimestamp(Instant.now());
    }

    static EmbedBuilder adminReply(String adminName, String content) {
        return new EmbedBuilder()
                .setAuthor("✉️ " + adminName + " (웹)", null, null)
                .setDescription(content)
                .setColor(new Color(34, 197, 94))
                .setTimestamp(Instant.now());
    }

    static EmbedBuilder threadOpened(String username, String roomId) {
        return new EmbedBuilder()
                .setTitle("새 채팅 시작")
                .setDescription("**" + username + "** 님이 블로그에서 채팅을 시작했습니다.\n이 스레드에서 답장하면 방문자에게 전달됩니다.")
                .setFooter("roomId: " + roomId)
                .setColor(new Color(30, 41, 59));
    }
}
