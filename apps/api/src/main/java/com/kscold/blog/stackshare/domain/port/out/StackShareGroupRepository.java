package com.kscold.blog.stackshare.domain.port.out;

import com.kscold.blog.stackshare.domain.model.StackShareGroup;
import java.util.List;
import java.util.Optional;

public interface StackShareGroupRepository {

    StackShareGroup save(StackShareGroup group);

    List<StackShareGroup> findAllByOrderByNameAsc();

    Optional<StackShareGroup> findById(String id);

    Optional<StackShareGroup> findByName(String name);

    void deleteById(String id);
}
