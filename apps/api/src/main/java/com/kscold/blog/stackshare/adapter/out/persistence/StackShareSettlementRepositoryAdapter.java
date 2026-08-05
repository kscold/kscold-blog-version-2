package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import com.kscold.blog.stackshare.domain.port.out.StackShareSettlementRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class StackShareSettlementRepositoryAdapter implements StackShareSettlementRepository {

    private final MongoStackShareSettlementRepository mongoRepository;

    @Override
    public StackShareSettlement save(StackShareSettlement settlement) {
        return mongoRepository.save(settlement);
    }

    @Override
    public List<StackShareSettlement> findRecent() {
        return mongoRepository.findTop30ByOrderByCreatedAtDesc();
    }
}
