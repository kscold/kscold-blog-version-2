package com.kscold.blog.social.adapter.out.external;

import com.kscold.blog.exception.InvalidRequestException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Locale;
import org.springframework.stereotype.Component;

/** 외부 문서 조회가 공개 인터넷의 HTTP(S) 주소로만 향하도록 제한한다. */
@Component
class PublicHttpUrlPolicy {

    private static final int MAX_URL_LENGTH = 4096;

    private final HostResolver hostResolver;

    PublicHttpUrlPolicy() {
        this(InetAddress::getAllByName);
    }

    PublicHttpUrlPolicy(HostResolver hostResolver) {
        this.hostResolver = hostResolver;
    }

    URI validate(String url) {
        if (url == null || url.isBlank() || url.length() > MAX_URL_LENGTH) {
            throw InvalidRequestException.invalidInput("유효한 URL을 입력해주세요");
        }

        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            if (scheme == null
                    || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw InvalidRequestException.invalidInput("http/https URL만 허용됩니다");
            }
            if (uri.getRawUserInfo() != null) {
                throw InvalidRequestException.invalidInput("사용자 정보가 포함된 URL은 허용되지 않습니다");
            }
            if (uri.getPort() != -1 && uri.getPort() != 80 && uri.getPort() != 443) {
                throw InvalidRequestException.invalidInput("HTTP 표준 포트만 허용됩니다");
            }

            String host = normalizeHost(uri.getHost());
            if (host == null || host.isBlank()) {
                throw InvalidRequestException.invalidInput("유효하지 않은 URL입니다");
            }
            if (isSpecialUseHost(host)) {
                throw InvalidRequestException.invalidInput("내부 네트워크 호스트는 허용되지 않습니다");
            }

            InetAddress[] addresses = hostResolver.resolve(host);
            if (addresses.length == 0) {
                throw InvalidRequestException.invalidInput("호스트를 확인할 수 없습니다");
            }
            for (InetAddress address : addresses) {
                if (!isPublicAddress(address)) {
                    throw InvalidRequestException.invalidInput("내부 또는 예약 네트워크 주소로의 요청은 허용되지 않습니다");
                }
            }
            return uri;
        } catch (UnknownHostException e) {
            throw InvalidRequestException.invalidInput("호스트를 확인할 수 없습니다");
        } catch (URISyntaxException e) {
            throw InvalidRequestException.invalidInput("유효하지 않은 URL입니다");
        }
    }

    URI resolveRedirect(URI current, String location) {
        if (location == null || location.isBlank()) {
            throw InvalidRequestException.invalidInput("리디렉션 위치가 올바르지 않습니다");
        }
        try {
            return validate(current.resolve(new URI(location)).toString());
        } catch (URISyntaxException | IllegalArgumentException e) {
            throw InvalidRequestException.invalidInput("리디렉션 위치가 올바르지 않습니다");
        }
    }

    private String normalizeHost(String host) {
        if (host == null) {
            return null;
        }
        String normalized = host.toLowerCase(Locale.ROOT);
        return normalized.endsWith(".")
                ? normalized.substring(0, normalized.length() - 1)
                : normalized;
    }

    private boolean isPublicAddress(InetAddress address) {
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return false;
        }

        byte[] bytes = address.getAddress();
        return bytes.length == 4 ? isPublicIpv4(bytes) : isPublicIpv6(bytes);
    }

    private boolean isSpecialUseHost(String host) {
        return host.equals("localhost")
                || host.endsWith(".localhost")
                || host.endsWith(".local")
                || host.endsWith(".internal")
                || host.equals("home.arpa")
                || host.endsWith(".home.arpa");
    }

    private boolean isPublicIpv4(byte[] bytes) {
        int first = Byte.toUnsignedInt(bytes[0]);
        int second = Byte.toUnsignedInt(bytes[1]);
        int third = Byte.toUnsignedInt(bytes[2]);

        return first != 0
                && first != 10
                && first != 127
                && !(first == 100 && second >= 64 && second <= 127)
                && !(first == 169 && second == 254)
                && !(first == 172 && second >= 16 && second <= 31)
                && !(first == 192 && second == 0 && third == 0)
                && !(first == 192 && second == 0 && third == 2)
                && !(first == 192 && second == 88 && third == 99)
                && !(first == 192 && second == 168)
                && !(first == 198 && (second == 18 || second == 19))
                && !(first == 198 && second == 51 && third == 100)
                && !(first == 203 && second == 0 && third == 113)
                && first < 224;
    }

    private boolean isPublicIpv6(byte[] bytes) {
        int first = Byte.toUnsignedInt(bytes[0]);
        int second = Byte.toUnsignedInt(bytes[1]);

        // 2000::/3 전역 유니캐스트만 허용하고 문서화 전용 2001:db8::/32는 제외한다.
        boolean globalUnicast = first >= 0x20 && first <= 0x3f;
        boolean documentation =
                first == 0x20
                        && second == 0x01
                        && Byte.toUnsignedInt(bytes[2]) == 0x0d
                        && Byte.toUnsignedInt(bytes[3]) == 0xb8;
        return globalUnicast && !documentation;
    }

    @FunctionalInterface
    interface HostResolver {
        InetAddress[] resolve(String host) throws UnknownHostException;
    }
}
