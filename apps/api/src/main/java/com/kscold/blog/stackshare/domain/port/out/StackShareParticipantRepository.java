package com.kscold.blog.stackshare.domain.port.out;

import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import java.util.List;
import java.util.Optional;

public interface StackShareParticipantRepository {

    StackShareParticipant save(StackShareParticipant participant);

    List<StackShareParticipant> findAllByOrderByNameAsc();

    Optional<StackShareParticipant> findById(String id);

    Optional<StackShareParticipant> findByPhoneNumber(String phoneNumber);

    void deleteById(String id);
}
