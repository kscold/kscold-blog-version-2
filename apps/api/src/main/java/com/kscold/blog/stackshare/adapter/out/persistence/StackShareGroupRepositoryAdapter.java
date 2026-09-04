package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareGroup;
import com.kscold.blog.stackshare.domain.port.out.StackShareGroupRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class StackShareGroupRepositoryAdapter implements StackShareGroupRepository {

    private final MongoStackShareGroupRepository repository;

    @Override
    public StackShareGroup save(StackShareGroup group) {
        return repository.save(group);
    }

    @Override
    public List<StackShareGroup> findAllByOrderByNameAsc() {
        return repository.findAllByOrderByNameAsc();
    }

    @Override
    public Optional<StackShareGroup> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public Optional<StackShareGroup> findByName(String name) {
        return repository.findByName(name);
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
