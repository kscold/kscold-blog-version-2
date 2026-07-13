package com.kscold.blog.teamprivate.domain.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "team_private_docs")
public class TeamPrivateDoc {

    @Id private String id;

    private String teamId;

    private List<ServerInfo> servers;
    private List<SharedAccount> sharedAccounts;
    private List<EnvConfig> envConfigs;
    private List<String> notes;
    private String businessRegistrationPdfUrl;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServerInfo {
        private String label;
        private String command;
        private String password;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharedAccount {
        private String label;
        private String url;
        private String email;
        private String password;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnvConfig {
        private String label;
        private String content;
    }
}
