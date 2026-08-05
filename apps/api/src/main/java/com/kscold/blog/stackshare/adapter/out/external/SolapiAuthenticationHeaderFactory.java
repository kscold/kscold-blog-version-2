package com.kscold.blog.stackshare.adapter.out.external;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class SolapiAuthenticationHeaderFactory {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final Clock clock;

    public SolapiAuthenticationHeaderFactory() {
        this(Clock.systemUTC());
    }

    SolapiAuthenticationHeaderFactory(Clock clock) {
        this.clock = clock;
    }

    public String create(String apiKey, String apiSecret) {
        String date = DateTimeFormatter.ISO_INSTANT.format(Instant.now(clock));
        String salt = createSalt();
        String signature = sign(apiSecret, date + salt);
        return "HMAC-SHA256 apiKey=%s, date=%s, salt=%s, signature=%s"
                .formatted(apiKey, date, salt, signature);
    }

    private String createSalt() {
        byte[] bytes = new byte[16];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String sign(String apiSecret, String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("SOLAPI 인증 서명을 만들지 못했습니다.", exception);
        }
    }
}
