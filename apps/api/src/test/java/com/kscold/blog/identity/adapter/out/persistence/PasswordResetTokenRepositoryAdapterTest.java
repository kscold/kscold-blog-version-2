package com.kscold.blog.identity.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.domain.model.PasswordResetToken;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

class PasswordResetTokenRepositoryAdapterTest {

    @Test
    void consumesATokenWithOneAtomicFindAndRemove() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        PasswordResetToken token = PasswordResetToken.builder().tokenHash("token-hash").build();
        when(mongoTemplate.findAndRemove(any(Query.class), eq(PasswordResetToken.class)))
                .thenReturn(token, (PasswordResetToken) null);
        PasswordResetTokenRepositoryAdapter adapter =
                new PasswordResetTokenRepositoryAdapter(
                        mock(MongoPasswordResetTokenRepository.class), mongoTemplate);

        Optional<PasswordResetToken> first = adapter.consumeByTokenHash("token-hash");
        Optional<PasswordResetToken> second = adapter.consumeByTokenHash("token-hash");

        assertThat(first).contains(token);
        assertThat(second).isEmpty();
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate, times(2))
                .findAndRemove(query.capture(), eq(PasswordResetToken.class));
        assertThat(query.getAllValues())
                .allSatisfy(
                        captured ->
                                assertThat(captured.getQueryObject())
                                        .containsEntry("tokenHash", "token-hash"));
    }
}
