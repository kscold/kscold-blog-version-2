package com.kscold.blog.shared.application;

import com.kscold.blog.shared.domain.model.TeamPrivateDoc;
import com.kscold.blog.shared.domain.repository.TeamPrivateDocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamPrivateService {

    private final TeamPrivateDocRepository teamPrivateDocRepository;

    public Optional<TeamPrivateDoc> findByTeamId(String teamId) {
        return teamPrivateDocRepository.findByTeamId(teamId);
    }

    public TeamPrivateDoc upsert(String teamId, TeamPrivateDoc doc) {
        teamPrivateDocRepository.findByTeamId(teamId).ifPresent(existing -> doc.setId(existing.getId()));
        doc.setTeamId(teamId);
        return teamPrivateDocRepository.save(doc);
    }
}
