package com.kscold.blog.teamprivate.adapter.in.web.dto.response;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 팀 비공개 문서 응답 DTO */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamPrivateDocResponse {

    private String id;
    private String teamId;
    private List<ServerInfo> servers;
    private List<SharedAccount> sharedAccounts;
    private List<EnvConfig> envConfigs;
    private List<String> notes;
    private String businessRegistrationPdfUrl;

    /** 서버 정보 */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServerInfo {
        private String label;
        private String command;
        private String password;
    }

    /** 공용 계정 정보 */
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

    /** 환경 설정 정보 */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnvConfig {
        private String label;
        private String content;
    }

    /** TeamPrivateDoc 엔티티를 TeamPrivateDocResponse로 변환 (null 입력 시 null 반환) */
    public static TeamPrivateDocResponse from(TeamPrivateDoc doc) {
        if (doc == null) {
            return null;
        }
        return TeamPrivateDocResponse.builder()
                .id(doc.getId())
                .teamId(doc.getTeamId())
                .servers(
                        doc.getServers() != null
                                ? doc.getServers().stream()
                                        .map(
                                                server ->
                                                        ServerInfo.builder()
                                                                .label(server.getLabel())
                                                                .command(server.getCommand())
                                                                .password(server.getPassword())
                                                                .build())
                                        .toList()
                                : null)
                .sharedAccounts(
                        doc.getSharedAccounts() != null
                                ? doc.getSharedAccounts().stream()
                                        .map(
                                                account ->
                                                        SharedAccount.builder()
                                                                .label(account.getLabel())
                                                                .url(account.getUrl())
                                                                .email(account.getEmail())
                                                                .password(account.getPassword())
                                                                .build())
                                        .toList()
                                : null)
                .envConfigs(
                        doc.getEnvConfigs() != null
                                ? doc.getEnvConfigs().stream()
                                        .map(
                                                env ->
                                                        EnvConfig.builder()
                                                                .label(env.getLabel())
                                                                .content(env.getContent())
                                                                .build())
                                        .toList()
                                : null)
                .notes(doc.getNotes())
                .businessRegistrationPdfUrl(doc.getBusinessRegistrationPdfUrl())
                .build();
    }
}
