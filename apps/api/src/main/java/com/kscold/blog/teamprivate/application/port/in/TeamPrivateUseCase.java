package com.kscold.blog.teamprivate.application.port.in;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import java.util.Optional;

/** 팀 비공개 문서 조회/저장 유스케이스 (driving 포트) */
public interface TeamPrivateUseCase {

    Optional<TeamPrivateDoc> findByTeamId(String teamId);

    TeamPrivateDoc upsert(String teamId, TeamPrivateDoc doc);
}
