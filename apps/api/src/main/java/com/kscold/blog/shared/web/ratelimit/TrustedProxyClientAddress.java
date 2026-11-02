package com.kscold.blog.shared.web.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 요청을 보낸 클라이언트 IP를 고른다.
 *
 * <p>바로 앞 연결이 믿을 프록시(운영 Nginx 등)일 때만 X-Forwarded-For를 보고, 그 안에서도 믿을 프록시가 아닌 가장 오른쪽 주소를 쓴다. 그 밖의 연결이
 * 보낸 X-Forwarded-For는 위조할 수 있으므로 무시한다.
 */
final class TrustedProxyClientAddress {

    private static final int MAX_FORWARDED_LENGTH = 1024;
    private static final int MAX_FORWARDED_ENTRIES = 8;

    private final List<AddressRange> trustedProxies;

    TrustedProxyClientAddress(String configured) {
        this.trustedProxies = parseRanges(configured);
    }

    String resolve(HttpServletRequest request) {
        InetAddress remote = parseLiteral(request.getRemoteAddr());
        if (remote == null) {
            return "unknown";
        }
        if (!isTrusted(remote)) {
            return remote.getHostAddress();
        }
        InetAddress forwarded = forwardedClient(request);
        return (forwarded == null ? remote : forwarded).getHostAddress();
    }

    private InetAddress forwardedClient(HttpServletRequest request) {
        List<String> headers = Collections.list(request.getHeaders("X-Forwarded-For"));
        if (headers.size() != 1 || headers.getFirst().length() > MAX_FORWARDED_LENGTH) {
            return null;
        }
        String[] entries = headers.getFirst().split(",", -1);
        if (entries.length > MAX_FORWARDED_ENTRIES) {
            return null;
        }
        for (int index = entries.length - 1; index >= 0; index--) {
            InetAddress address = parseLiteral(entries[index].trim());
            if (address == null) {
                return null;
            }
            if (!isTrusted(address)) {
                return address;
            }
        }
        return null;
    }

    private boolean isTrusted(InetAddress address) {
        return trustedProxies.stream().anyMatch(range -> range.contains(address));
    }

    private static List<AddressRange> parseRanges(String configured) {
        List<AddressRange> ranges = new ArrayList<>();
        if (configured == null || configured.isBlank()) {
            return List.of();
        }
        for (String entry : configured.split(",")) {
            ranges.add(AddressRange.parse(entry.trim()));
        }
        return List.copyOf(ranges);
    }

    /** IP 리터럴만 받는다. 호스트명은 DNS 조회를 일으키므로 거른다. */
    static InetAddress parseLiteral(String value) {
        if (value == null || value.isEmpty() || value.length() > 64) {
            return null;
        }
        boolean isIpv4 = value.matches("[0-9]{1,3}(?:\\.[0-9]{1,3}){3}");
        boolean isIpv6 = value.contains(":") && value.matches("[0-9a-fA-F:.]+");
        if (!isIpv4 && !isIpv6) {
            return null;
        }
        try {
            return InetAddress.getByName(value);
        } catch (UnknownHostException exception) {
            return null;
        }
    }

    private record AddressRange(byte[] network, int prefixLength) {

        static AddressRange parse(String cidr) {
            String[] parts = cidr.split("/", 2);
            InetAddress address = parseLiteral(parts[0]);
            if (address == null) {
                throw new IllegalArgumentException("api.rate-limit.trusted-proxies 값이 올바르지 않습니다.");
            }
            int maxPrefix = address.getAddress().length * 8;
            int prefix = parts.length == 2 ? Integer.parseInt(parts[1]) : maxPrefix;
            if (prefix < 0 || prefix > maxPrefix) {
                throw new IllegalArgumentException("api.rate-limit.trusted-proxies 값이 올바르지 않습니다.");
            }
            return new AddressRange(address.getAddress(), prefix);
        }

        boolean contains(InetAddress candidate) {
            byte[] bytes = candidate.getAddress();
            if (bytes.length != network.length) {
                return false;
            }
            int fullBytes = prefixLength / 8;
            for (int index = 0; index < fullBytes; index++) {
                if (bytes[index] != network[index]) {
                    return false;
                }
            }
            int remainingBits = prefixLength % 8;
            if (remainingBits == 0) {
                return true;
            }
            int mask = 0xFF << (8 - remainingBits);
            return (bytes[fullBytes] & mask) == (network[fullBytes] & mask);
        }
    }
}
