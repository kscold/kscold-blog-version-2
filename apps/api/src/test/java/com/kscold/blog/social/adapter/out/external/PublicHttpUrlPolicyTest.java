package com.kscold.blog.social.adapter.out.external;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import java.net.InetAddress;
import java.net.URI;
import org.junit.jupiter.api.Test;

class PublicHttpUrlPolicyTest {

    @Test
    void 공개주소만해석되면허용한다() throws Exception {
        PublicHttpUrlPolicy policy =
                new PublicHttpUrlPolicy(
                        host -> new InetAddress[] {InetAddress.getByName("93.184.216.34")});

        assertThat(policy.validate("https://example.com/post?q=1"))
                .isEqualTo(URI.create("https://example.com/post?q=1"));
    }

    @Test
    void 하나라도내부주소로해석되면차단한다() throws Exception {
        PublicHttpUrlPolicy policy =
                new PublicHttpUrlPolicy(
                        host ->
                                new InetAddress[] {
                                    InetAddress.getByName("93.184.216.34"),
                                    InetAddress.getByName("127.0.0.1")
                                });

        assertThatThrownBy(() -> policy.validate("https://example.com"))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void 내부예약주소와지원하지않는스킴을차단한다() {
        PublicHttpUrlPolicy policy = new PublicHttpUrlPolicy();

        for (String url :
                new String[] {
                    "http://127.0.0.1",
                    "http://10.0.0.1",
                    "http://100.64.0.1",
                    "http://169.254.169.254/latest/meta-data",
                    "http://192.168.0.1",
                    "http://198.18.0.1",
                    "http://[::1]",
                    "http://[fc00::1]",
                    "http://[2001:db8::1]",
                    "http://example.local",
                    "http://service.internal",
                    "http://example.com:8080",
                    "file:///etc/passwd",
                    "ftp://example.com/file"
                }) {
            assertThatThrownBy(() -> policy.validate(url))
                    .as("차단 대상: %s", url)
                    .isInstanceOf(InvalidRequestException.class);
        }
    }

    @Test
    void 사용자정보가포함된주소를차단한다() {
        PublicHttpUrlPolicy policy =
                new PublicHttpUrlPolicy(
                        host -> new InetAddress[] {InetAddress.getByName("93.184.216.34")});

        assertThatThrownBy(() -> policy.validate("https://user:password@example.com"))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void 상대리디렉션도새목적지를검증한다() throws Exception {
        PublicHttpUrlPolicy policy =
                new PublicHttpUrlPolicy(
                        host -> {
                            if (host.equals("internal.example")) {
                                return new InetAddress[] {InetAddress.getByName("10.0.0.8")};
                            }
                            return new InetAddress[] {InetAddress.getByName("93.184.216.34")};
                        });

        assertThat(policy.resolveRedirect(URI.create("https://example.com/a"), "/next"))
                .isEqualTo(URI.create("https://example.com/next"));
        assertThatThrownBy(
                        () ->
                                policy.resolveRedirect(
                                        URI.create("https://example.com/a"),
                                        "https://internal.example/private"))
                .isInstanceOf(InvalidRequestException.class);
    }
}
