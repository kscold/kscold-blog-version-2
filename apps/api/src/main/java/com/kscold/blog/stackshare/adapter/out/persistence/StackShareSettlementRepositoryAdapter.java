package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import com.kscold.blog.stackshare.domain.port.out.StackShareSettlementRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class StackShareSettlementRepositoryAdapter implements StackShareSettlementRepository {

    private static final String SETTLED_AT = "settledAt";

    private final MongoStackShareSettlementRepository mongoRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public StackShareSettlement save(StackShareSettlement settlement) {
        return mongoRepository.save(settlement);
    }

    @Override
    public List<StackShareSettlement> findRecent() {
        return mongoRepository.findTop30ByOrderByCreatedAtDesc();
    }

    @Override
    public Optional<StackShareSettlement> updateSettledAt(String id, LocalDateTime settledAt) {
        Query query = Query.query(Criteria.where("_id").is(id));
        Update update =
                settledAt == null
                        ? new Update().unset(SETTLED_AT)
                        : new Update().set(SETTLED_AT, settledAt);
        FindAndModifyOptions options = FindAndModifyOptions.options().returnNew(true);
        return Optional.ofNullable(
                mongoTemplate.findAndModify(query, update, options, StackShareSettlement.class));
    }
}
