package com.kscold.blog.chat.adapter.out.ratelimit;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.RateLimitExceededException;
import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InMemoryChatRateLimitAdapterTest {

    @Test
    @DisplayName("방문자 메시지는 설정한 윈도우별 허용 횟수를 넘으면 거부한다")
    void visitorMessageLimitIsEnforcedPerRoom() {
        ChatRateLimitProperties properties = properties(2, 1);
        InMemoryChatRateLimitAdapter adapter = new InMemoryChatRateLimitAdapter(properties);

        assertThatCode(() -> adapter.checkVisitorMessageAllowed("room-1"))
                .doesNotThrowAnyException();
        assertThatCode(() -> adapter.checkVisitorMessageAllowed("room-1"))
                .doesNotThrowAnyException();
        assertThatThrownBy(() -> adapter.checkVisitorMessageAllowed("room-1"))
                .isInstanceOf(RateLimitExceededException.class);
        assertThatCode(() -> adapter.checkVisitorMessageAllowed("room-2"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("시스템 이벤트는 방문자 메시지와 분리된 한도를 사용한다")
    void systemEventLimitUsesIndependentWindow() {
        ChatRateLimitProperties properties = properties(1, 1);
        InMemoryChatRateLimitAdapter adapter = new InMemoryChatRateLimitAdapter(properties);

        assertThatCode(() -> adapter.checkVisitorMessageAllowed("room-1"))
                .doesNotThrowAnyException();
        assertThatCode(() -> adapter.checkSystemEventAllowed("room-1")).doesNotThrowAnyException();
        assertThatThrownBy(() -> adapter.checkSystemEventAllowed("room-1"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    private ChatRateLimitProperties properties(int visitorMessages, int systemEvents) {
        ChatRateLimitProperties properties = new ChatRateLimitProperties();
        properties.setVisitorMessages(visitorMessages);
        properties.setSystemEvents(systemEvents);
        properties.setWindow(Duration.ofMinutes(1));
        properties.setMaxTrackedRooms(100);
        return properties;
    }
}
