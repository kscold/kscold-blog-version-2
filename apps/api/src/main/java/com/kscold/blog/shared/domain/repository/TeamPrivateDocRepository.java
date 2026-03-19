package com.kscold.blog.shared.domain.repository;

import com.kscold.blog.shared.domain.model.TeamPrivateDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TeamPrivateDocRepository extends MongoRepository<TeamPrivateDoc, String> {
    Optional<TeamPrivateDoc> findByTeamId(String teamId);
}
