package com.kscold.blog.shared.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "team_private_docs")
public class TeamPrivateDoc {

    @Id
    private String id;

    private String teamId;

    private List<ServerInfo> servers;
    private List<SharedAccount> sharedAccounts;
    private List<EnvConfig> envConfigs;
    private List<String> notes;
    private String businessRegistrationPdfUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServerInfo {
        private String label;
        private String command;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharedAccount {
        private String label;
        private String url;
        private String email;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnvConfig {
        private String label;
        private String content;
    }
}
