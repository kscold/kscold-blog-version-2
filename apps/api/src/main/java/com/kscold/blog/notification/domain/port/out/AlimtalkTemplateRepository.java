package com.kscold.blog.notification.domain.port.out;

import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import java.util.List;
import java.util.Optional;

public interface AlimtalkTemplateRepository {

    AlimtalkTemplate save(AlimtalkTemplate template);

    List<AlimtalkTemplate> findAll();

    Optional<AlimtalkTemplate> findByTemplateKey(String templateKey);
}
