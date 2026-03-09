package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.application.dto.TagCommand;
import com.kscold.blog.blog.domain.model.Tag;

import java.util.List;

public interface TagUseCase {

    List<Tag> getAll();

    Tag getById(String id);

    Tag getBySlug(String slug);

    Tag create(TagCommand command);

    Tag update(String id, TagCommand command);

    void delete(String id);

    Tag findOrCreateByName(String name);

    void incrementPostCount(String tagId);

    void decrementPostCount(String tagId);
}
