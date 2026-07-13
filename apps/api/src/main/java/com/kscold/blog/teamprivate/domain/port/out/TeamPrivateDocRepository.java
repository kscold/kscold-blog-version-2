package com.kscold.blog.teamprivate.domain.port.out;

import com.kscold.blog.teamprivate.domain.model.TeamPrivateDoc;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TeamPrivateDocRepository extends MongoRepository<TeamPrivateDoc, String> {
    Optional<TeamPrivateDoc> findByTeamId(String teamId);
}
