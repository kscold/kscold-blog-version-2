package com.kscold.blog.vault.agent.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "vault.agent")
public class VaultAgentProperties {

    private String host = "localhost";
    private int port = 9090;
    private long deadlineMillis = 60000;
}
