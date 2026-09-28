package com.kscold.blog.vault.agent.adapter.in.web;

import com.kscold.blog.shared.security.OneWayIdentifierHasher;
import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

/** 비용 제한은 브라우저 정보가 아닌 검증된 연결 IP만 해시하며 미설정 프록시는 신뢰하지 않는다. */
@Component
public class PageAgentClientIdentifierResolver {

    private final Set<String> trustedProxies;

    public PageAgentClientIdentifierResolver(VaultAgentProperties properties) {
        trustedProxies = trustedAddresses(properties.getPageChatTrustedProxyAddresses());
    }

    public String resolve(HttpServletRequest request) {
        String remote = literalAddress(request.getRemoteAddr());
        String client = remote == null ? "unknown" : remote;
        if (trustedProxies.contains(client)) {
            String forwarded = forwardedClient(request);
            if (forwarded != null) {
                client = forwarded;
            }
        }
        return OneWayIdentifierHasher.hash("page-agent:" + client);
    }

    private String forwardedClient(HttpServletRequest request) {
        List<String> headers = Collections.list(request.getHeaders("X-Forwarded-For"));
        if (headers.size() != 1 || headers.getFirst().length() > 1024) {
            return null;
        }
        String[] entries = headers.getFirst().split(",", -1);
        if (entries.length > 8) {
            return null;
        }
        String[] addresses = new String[entries.length];
        for (int index = 0; index < entries.length; index++) {
            addresses[index] = literalAddress(entries[index].trim());
            if (addresses[index] == null) {
                return null;
            }
        }
        for (int index = addresses.length - 1; index >= 0; index--) {
            if (!trustedProxies.contains(addresses[index])) {
                return addresses[index];
            }
        }
        return null;
    }

    private static Set<String> trustedAddresses(String configured) {
        if (configured == null || configured.isBlank()) {
            return Set.of();
        }
        String[] entries = configured.split(",", -1);
        if (configured.length() > 2048 || entries.length > 32) {
            throw new IllegalArgumentException("페이지 Agent 프록시 설정이 유효하지 않습니다.");
        }
        Set<String> addresses = new HashSet<>();
        for (String entry : entries) {
            String address = literalAddress(entry.trim());
            if (address == null) {
                throw new IllegalArgumentException("페이지 Agent 프록시 설정이 유효하지 않습니다.");
            }
            addresses.add(address);
        }
        return Set.copyOf(addresses);
    }

    private static String literalAddress(String address) {
        if (address == null || address.length() > 64) {
            return null;
        }
        try {
            if (address.contains(":") && address.matches("[0-9a-fA-F:.]+")) {
                // 콜론이 포함된 IP 리터럴만 전달하므로 호스트명 DNS 조회를 하지 않는다.
                return InetAddress.getByName(address).getHostAddress();
            }
            if (!address.matches("[0-9]{1,3}(?:\\.[0-9]{1,3}){3}")) {
                return null;
            }
            String[] parts = address.split("\\.");
            byte[] bytes = new byte[4];
            for (int index = 0; index < parts.length; index++) {
                int value = Integer.parseInt(parts[index]);
                if (value > 255) {
                    return null;
                }
                bytes[index] = (byte) value;
            }
            return InetAddress.getByAddress(bytes).getHostAddress();
        } catch (UnknownHostException | NumberFormatException exception) {
            return null;
        }
    }
}
