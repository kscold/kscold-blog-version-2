package com.kscold.blog.identity.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.User;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.UpdateDefinition;

class UserRepositoryAdapterTest {

    @Test
    void updatesPasswordOnlyWhenTheAccountIsActive() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateFirst(
                        any(Query.class), any(UpdateDefinition.class), eq(User.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 1L, null));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mock(MongoUserRepository.class), mongoTemplate);

        boolean updated = adapter.updatePasswordIfActive("user-1", "encoded-password");

        assertThat(updated).isTrue();
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<UpdateDefinition> update = ArgumentCaptor.forClass(UpdateDefinition.class);
        verify(mongoTemplate).updateFirst(query.capture(), update.capture(), eq(User.class));
        assertThat(query.getValue().getQueryObject())
                .containsEntry("_id", "user-1")
                .containsKey("deletedAt");
        Document set = update.getValue().getUpdateObject().get("$set", Document.class);
        assertThat(set).containsEntry("password", "encoded-password").containsKey("updatedAt");
    }

    @Test
    void reportsFailureWhenNoActiveAccountWasModified() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateFirst(
                        any(Query.class), any(UpdateDefinition.class), eq(User.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 0L, null));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mock(MongoUserRepository.class), mongoTemplate);

        assertThat(adapter.updatePasswordIfActive("user-1", "encoded-password")).isFalse();
    }
}
