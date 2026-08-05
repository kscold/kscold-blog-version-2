package com.kscold.blog.notification.adapter.out.persistence;

import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.port.out.AlimtalkTemplateRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class AlimtalkTemplateRepositoryAdapter implements AlimtalkTemplateRepository {

    private final MongoAlimtalkTemplateRepository mongoRepository;

    @Override
    public AlimtalkTemplate save(AlimtalkTemplate template) {
        return mongoRepository.save(template);
    }

    @Override
    public List<AlimtalkTemplate> findAll() {
        return mongoRepository.findAll();
    }

    @Override
    public Optional<AlimtalkTemplate> findByTemplateKey(String templateKey) {
        return mongoRepository.findByTemplateKey(templateKey);
    }
}
