package com.kscold.blog.teamprivate.adapter.in.web.dto.request;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 팀 비공개 문서 저장(upsert) 요청 DTO */
@Getter
@Builder
@AllArgsConstructor
public class UpsertTeamPrivateDocRequest {

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
    @AllArgsConstructor
    public static class ServerInfo {
        private String label;
        private String command;
        private String password;
    }

    /** 공용 계정 정보 */
    @Getter
    @Builder
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
    @AllArgsConstructor
    public static class EnvConfig {
        private String label;
        private String content;
    }

    /** 요청 DTO를 도메인 엔티티로 변환 */
    public TeamPrivateDoc toDomain() {
        return TeamPrivateDoc.builder()
                .id(id)
                .teamId(teamId)
                .servers(
                        servers != null
                                ? servers.stream()
                                        .map(
                                                server ->
                                                        TeamPrivateDoc.ServerInfo.builder()
                                                                .label(server.getLabel())
                                                                .command(server.getCommand())
                                                                .password(server.getPassword())
                                                                .build())
                                        .toList()
                                : null)
                .sharedAccounts(
                        sharedAccounts != null
                                ? sharedAccounts.stream()
                                        .map(
                                                account ->
                                                        TeamPrivateDoc.SharedAccount.builder()
                                                                .label(account.getLabel())
                                                                .url(account.getUrl())
                                                                .email(account.getEmail())
                                                                .password(account.getPassword())
                                                                .build())
                                        .toList()
                                : null)
                .envConfigs(
                        envConfigs != null
                                ? envConfigs.stream()
                                        .map(
                                                env ->
                                                        TeamPrivateDoc.EnvConfig.builder()
                                                                .label(env.getLabel())
                                                                .content(env.getContent())
                                                                .build())
                                        .toList()
                                : null)
                .notes(notes)
                .businessRegistrationPdfUrl(businessRegistrationPdfUrl)
                .build();
    }
}
