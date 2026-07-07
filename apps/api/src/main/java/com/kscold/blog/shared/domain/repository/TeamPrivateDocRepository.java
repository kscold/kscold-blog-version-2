package com.kscold.blog.shared.domain.repository;

import com.kscold.blog.shared.domain.model.TeamPrivateDoc;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TeamPrivateDocRepository extends MongoRepository<TeamPrivateDoc, String> {
    Optional<TeamPrivateDoc> findByTeamId(String teamId);
}
