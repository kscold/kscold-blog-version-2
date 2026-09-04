package com.kscold.blog.config;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

class OutboundHttpConfigTest {

    @Test
    void rejectsNonPositiveTimeout() {
        OutboundHttpProperties properties = new OutboundHttpProperties();
        properties.setReadTimeout(Duration.ZERO);

        assertThatThrownBy(() -> new OutboundHttpConfig(properties).outboundRestClientCustomizer())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("read-timeout");
    }

    @Test
    void abortsRestClientRequestWhenReadTimeoutExpires() throws Exception {
        HttpServer server =
                HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.createContext(
                "/slow",
                exchange -> {
                    try {
                        Thread.sleep(1_000);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                    } finally {
                        exchange.close();
                    }
                });
        server.start();

        try {
            OutboundHttpProperties properties = new OutboundHttpProperties();
            properties.setConnectTimeout(Duration.ofMillis(100));
            properties.setReadTimeout(Duration.ofMillis(100));
            RestClient.Builder builder = RestClient.builder();
            new OutboundHttpConfig(properties).outboundRestClientCustomizer().customize(builder);

            String url = "http://127.0.0.1:" + server.getAddress().getPort() + "/slow";
            assertThatThrownBy(() -> builder.build().get().uri(url).retrieve().toBodilessEntity())
                    .isInstanceOf(ResourceAccessException.class);
        } finally {
            server.stop(0);
        }
    }
}
