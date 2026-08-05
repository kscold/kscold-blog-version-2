package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import com.kscold.blog.stackshare.domain.port.out.StackShareParticipantRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class StackShareParticipantRepositoryAdapter implements StackShareParticipantRepository {

    private final MongoStackShareParticipantRepository mongoRepository;

    @Override
    public StackShareParticipant save(StackShareParticipant participant) {
        return mongoRepository.save(participant);
    }

    @Override
    public List<StackShareParticipant> findAllByOrderByNameAsc() {
        return mongoRepository.findAllByOrderByNameAsc();
    }

    @Override
    public Optional<StackShareParticipant> findById(String id) {
        return mongoRepository.findById(id);
    }

    @Override
    public Optional<StackShareParticipant> findByPhoneNumber(String phoneNumber) {
        return mongoRepository.findByPhoneNumber(phoneNumber);
    }

    @Override
    public void deleteById(String id) {
        mongoRepository.deleteById(id);
    }
}
