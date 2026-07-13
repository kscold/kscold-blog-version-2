package com.kscold.blog.teamprivate.domain.port.out;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import java.util.Optional;

/** 팀 비공개 문서 영속성 포트 (driven 포트) */
public interface TeamPrivateDocRepository {

    Optional<TeamPrivateDoc> findByTeamId(String teamId);

    TeamPrivateDoc save(TeamPrivateDoc doc);
}
