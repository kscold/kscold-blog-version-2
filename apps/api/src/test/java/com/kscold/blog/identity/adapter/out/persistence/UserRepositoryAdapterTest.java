package com.kscold.blog.identity.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.mongodb.client.result.UpdateResult;
import java.util.Optional;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
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
                .containsEntry("deletedAt", null);
        Document set = update.getValue().getUpdateObject().get("$set", Document.class);
        assertThat(set)
                .containsEntry("password", "encoded-password")
                .containsKey("updatedAt")
                .doesNotContainKeys("profile", "deletedAt", "credentialVersion");
        Document increment = update.getValue().getUpdateObject().get("$inc", Document.class);
        assertThat(increment).containsEntry("credentialVersion", 1L);
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

    @Test
    void updatesOnlyProfileAndReturnsTheNewActiveUser() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        User.Profile profile = User.Profile.builder().displayName("새 이름").build();
        User updatedUser = User.builder().id("user-1").profile(profile).build();
        when(mongoTemplate.findAndModify(
                        any(Query.class),
                        any(UpdateDefinition.class),
                        any(FindAndModifyOptions.class),
                        eq(User.class)))
                .thenReturn(updatedUser);
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mock(MongoUserRepository.class), mongoTemplate);

        Optional<User> result = adapter.updateProfileIfActive("user-1", profile);

        assertThat(result).containsSame(updatedUser);
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<UpdateDefinition> update = ArgumentCaptor.forClass(UpdateDefinition.class);
        ArgumentCaptor<FindAndModifyOptions> options =
                ArgumentCaptor.forClass(FindAndModifyOptions.class);
        verify(mongoTemplate)
                .findAndModify(
                        query.capture(), update.capture(), options.capture(), eq(User.class));
        assertThat(query.getValue().getQueryObject())
                .containsEntry("_id", "user-1")
                .containsEntry("deletedAt", null);
        Document set = update.getValue().getUpdateObject().get("$set", Document.class);
        assertThat(set)
                .containsEntry("profile", profile)
                .containsKey("updatedAt")
                .doesNotContainKeys("password", "deletedAt", "credentialVersion");
        assertThat(update.getValue().getUpdateObject()).doesNotContainKey("$inc");
        assertThat(options.getValue().isReturnNew()).isTrue();
    }

    @Test
    void reportsMissingProfileTargetWhenNoActiveUserWasFound() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.findAndModify(
                        any(Query.class),
                        any(UpdateDefinition.class),
                        any(FindAndModifyOptions.class),
                        eq(User.class)))
                .thenReturn(null);
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mock(MongoUserRepository.class), mongoTemplate);

        assertThat(adapter.updateProfileIfActive("user-1", User.Profile.builder().build()))
                .isEmpty();
    }

    @Test
    void softDeletesOnlyTheActiveUserAndIncrementsCredentialVersion() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateFirst(
                        any(Query.class), any(UpdateDefinition.class), eq(User.class)))
                .thenReturn(UpdateResult.acknowledged(1L, 1L, null));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mock(MongoUserRepository.class), mongoTemplate);

        boolean updated = adapter.softDeleteIfActive("user-1");

        assertThat(updated).isTrue();
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<UpdateDefinition> update = ArgumentCaptor.forClass(UpdateDefinition.class);
        verify(mongoTemplate).updateFirst(query.capture(), update.capture(), eq(User.class));
        assertThat(query.getValue().getQueryObject())
                .containsEntry("_id", "user-1")
                .containsEntry("deletedAt", null);
        Document set = update.getValue().getUpdateObject().get("$set", Document.class);
        assertThat(set)
                .containsKeys("deletedAt", "updatedAt")
                .doesNotContainKeys("password", "profile", "credentialVersion");
        Document increment = update.getValue().getUpdateObject().get("$inc", Document.class);
        assertThat(increment).containsOnlyKeys("credentialVersion");
        assertThat(increment).containsEntry("credentialVersion", 1L);
    }

    @Test
    void reportsFailureWhenNoActiveUserWasSoftDeleted() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        when(mongoTemplate.updateFirst(
                        any(Query.class), any(UpdateDefinition.class), eq(User.class)))
                .thenReturn(UpdateResult.acknowledged(0L, 0L, null));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mock(MongoUserRepository.class), mongoTemplate);

        assertThat(adapter.softDeleteIfActive("user-1")).isFalse();
    }

    @Test
    void mapsMissingCredentialVersionAndProfileToLegacyDefaults() {
        MongoUserRepository mongoUserRepository = mock(MongoUserRepository.class);
        MongoUserRepository.ActiveAuthenticationProjection projection =
                mock(MongoUserRepository.ActiveAuthenticationProjection.class);
        when(projection.getRole()).thenReturn(User.Role.USER);
        when(projection.getCredentialVersion()).thenReturn(null);
        when(projection.getUsername()).thenReturn("legacy-user");
        when(projection.getProfile()).thenReturn(null);
        when(mongoUserRepository.findActiveAuthenticationById("user-1"))
                .thenReturn(Optional.of(projection));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mongoUserRepository, mock(MongoTemplate.class));

        UserRepository.AuthenticationState state =
                adapter.findActiveAuthenticationById("user-1").orElseThrow();

        assertThat(state.credentialVersion()).isZero();
        assertThat(state.displayName()).isEqualTo("legacy-user");
    }

    @Test
    void mapsProfileDisplayNameFromAuthenticationProjection() {
        MongoUserRepository mongoUserRepository = mock(MongoUserRepository.class);
        MongoUserRepository.ActiveAuthenticationProjection projection =
                mock(MongoUserRepository.ActiveAuthenticationProjection.class);
        User.Profile profile = User.Profile.builder().displayName("표시 이름").build();
        when(projection.getRole()).thenReturn(User.Role.ADMIN);
        when(projection.getCredentialVersion()).thenReturn(2L);
        when(projection.getUsername()).thenReturn("admin");
        when(projection.getProfile()).thenReturn(profile);
        when(mongoUserRepository.findActiveAuthenticationById("admin-1"))
                .thenReturn(Optional.of(projection));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mongoUserRepository, mock(MongoTemplate.class));

        UserRepository.AuthenticationState state =
                adapter.findActiveAuthenticationById("admin-1").orElseThrow();

        assertThat(state.role()).isEqualTo(User.Role.ADMIN);
        assertThat(state.credentialVersion()).isEqualTo(2L);
        assertThat(state.displayName()).isEqualTo("표시 이름");
    }

    @Test
    void rejectsAuthenticationProjectionWithoutRole() {
        MongoUserRepository mongoUserRepository = mock(MongoUserRepository.class);
        MongoUserRepository.ActiveAuthenticationProjection projection =
                mock(MongoUserRepository.ActiveAuthenticationProjection.class);
        when(projection.getRole()).thenReturn(null);
        when(mongoUserRepository.findActiveAuthenticationById("user-1"))
                .thenReturn(Optional.of(projection));
        UserRepositoryAdapter adapter =
                new UserRepositoryAdapter(mongoUserRepository, mock(MongoTemplate.class));

        assertThat(adapter.findActiveAuthenticationById("user-1")).isEmpty();
    }
}
