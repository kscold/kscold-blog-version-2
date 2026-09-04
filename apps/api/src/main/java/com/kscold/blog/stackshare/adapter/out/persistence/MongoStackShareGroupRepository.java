package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareGroup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoStackShareGroupRepository extends MongoRepository<StackShareGroup, String> {

    List<StackShareGroup> findAllByOrderByNameAsc();

    Optional<StackShareGroup> findByName(String name);
}
