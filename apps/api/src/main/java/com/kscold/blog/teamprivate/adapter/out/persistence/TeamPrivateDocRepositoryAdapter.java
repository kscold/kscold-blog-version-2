package com.kscold.blog.teamprivate.adapter.out.persistence;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import com.kscold.blog.teamprivate.domain.port.out.TeamPrivateDocRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** TeamPrivateDocRepository 포트의 영속성 어댑터 Spring Data MongoDB를 사용하여 포트 인터페이스를 구현 */
@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class TeamPrivateDocRepositoryAdapter implements TeamPrivateDocRepository {

    private final MongoTeamPrivateDocRepository mongoTeamPrivateDocRepository;

    @Override
    public Optional<TeamPrivateDoc> findByTeamId(String teamId) {
        return mongoTeamPrivateDocRepository.findByTeamId(teamId);
    }

    @Override
    public TeamPrivateDoc save(TeamPrivateDoc doc) {
        return mongoTeamPrivateDocRepository.save(doc);
    }
}
