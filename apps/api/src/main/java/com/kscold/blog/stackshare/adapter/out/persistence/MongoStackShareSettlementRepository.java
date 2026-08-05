package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoStackShareSettlementRepository
        extends MongoRepository<StackShareSettlement, String> {

    List<StackShareSettlement> findTop30ByOrderByCreatedAtDesc();
}
