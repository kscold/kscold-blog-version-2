package com.kscold.blog.documents.adapter.out.persistence;

import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import com.kscold.blog.documents.domain.model.PrivateDocumentSearchCriteria;
import com.kscold.blog.documents.domain.port.out.PrivateDocumentRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PrivateDocumentRepositoryAdapter implements PrivateDocumentRepository {

    private final MongoPrivateDocumentRepository mongoRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public PrivateDocument save(PrivateDocument document) {
        return mongoRepository.save(document);
    }

    @Override
    public Page<PrivateDocument> findAll(
            PrivateDocumentSearchCriteria criteria, Pageable pageable) {
        Query query = createSearchQuery(criteria);
        long total = mongoTemplate.count(query, PrivateDocument.class);
        return new PageImpl<>(
                mongoTemplate.find(query.with(pageable), PrivateDocument.class), pageable, total);
    }

    @Override
    public Optional<PrivateDocument> findByIdAndOwnerId(String id, String ownerId) {
        return mongoRepository.findByIdAndOwnerId(id, ownerId);
    }

    @Override
    public Optional<PrivateDocument> updateMetadata(
            String id, String ownerId, PrivateDocumentMetadata metadata) {
        Query query = Query.query(Criteria.where("_id").is(id).and("ownerId").is(ownerId));
        Update update =
                new Update()
                        .set("title", metadata.title())
                        .set("category", metadata.category())
                        .set("description", metadata.description())
                        .set("updatedAt", Instant.now());
        return Optional.ofNullable(
                mongoTemplate.findAndModify(
                        query,
                        update,
                        FindAndModifyOptions.options().returnNew(true),
                        PrivateDocument.class));
    }

    @Override
    public void deleteByIdAndOwnerId(String id, String ownerId) {
        mongoRepository.deleteByIdAndOwnerId(id, ownerId);
    }

    private Query createSearchQuery(PrivateDocumentSearchCriteria search) {
        Criteria criteria = Criteria.where("ownerId").is(search.ownerId());
        if (search.category() != null) {
            criteria.and("category").is(search.category());
        }
        if (search.query() != null && !search.query().isBlank()) {
            // 정규식 문법을 입력값으로 실행하지 않고 이름·제목·설명에서 문자 그대로 찾는다.
            Pattern pattern =
                    Pattern.compile(
                            Pattern.quote(search.query().strip()), Pattern.CASE_INSENSITIVE);
            criteria.andOperator(
                    new Criteria()
                            .orOperator(
                                    Criteria.where("title").regex(pattern),
                                    Criteria.where("fileName").regex(pattern),
                                    Criteria.where("description").regex(pattern)));
        }
        return Query.query(criteria);
    }
}
