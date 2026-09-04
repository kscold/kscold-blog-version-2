package com.kscold.blog.chat.adapter.out.ratelimit;

import jakarta.validation.constraints.Min;
import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@Component
@ConfigurationProperties(prefix = "chat.rate-limit")
public class ChatRateLimitProperties {

    @Min(1)
    private int visitorMessages = 12;

    @Min(1)
    private int systemEvents = 2;

    private Duration window = Duration.ofMinutes(1);

    @Min(1)
    private long maxTrackedRooms = 10000;
}
