package com.kscold.blog.teamprivate.adapter.out.persistence;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoTeamPrivateDocRepository extends MongoRepository<TeamPrivateDoc, String> {

    Optional<TeamPrivateDoc> findByTeamId(String teamId);
}
