package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoStackShareParticipantRepository
        extends MongoRepository<StackShareParticipant, String> {

    List<StackShareParticipant> findAllByOrderByNameAsc();

    Optional<StackShareParticipant> findByPhoneNumber(String phoneNumber);
}
