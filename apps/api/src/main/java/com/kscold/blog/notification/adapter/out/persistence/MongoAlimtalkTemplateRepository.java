package com.kscold.blog.notification.adapter.out.persistence;

import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoAlimtalkTemplateRepository extends MongoRepository<AlimtalkTemplate, String> {

    Optional<AlimtalkTemplate> findByTemplateKey(String templateKey);
}
