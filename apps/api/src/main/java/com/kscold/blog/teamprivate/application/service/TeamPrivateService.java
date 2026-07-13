package com.kscold.blog.teamprivate.application.service;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import com.kscold.blog.teamprivate.domain.port.out.TeamPrivateDocRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeamPrivateService {

    private final TeamPrivateDocRepository teamPrivateDocRepository;

    public Optional<TeamPrivateDoc> findByTeamId(String teamId) {
        return teamPrivateDocRepository.findByTeamId(teamId);
    }

    public TeamPrivateDoc upsert(String teamId, TeamPrivateDoc doc) {
        teamPrivateDocRepository
                .findByTeamId(teamId)
                .ifPresent(existing -> doc.setId(existing.getId()));
        doc.setTeamId(teamId);
        return teamPrivateDocRepository.save(doc);
    }
}
