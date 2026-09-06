package com.kscold.blog.identity.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.util.Collection;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.Query;

class MongoUserRepositoryTest {

    @Test
    void publicProfileQueriesRequireAnActiveAccount() throws NoSuchMethodException {
        Method id = MongoUserRepository.class.getMethod("findActiveById", String.class);
        Method email = MongoUserRepository.class.getMethod("findActiveByEmail", String.class);
        Method username = MongoUserRepository.class.getMethod("findActiveByUsername", String.class);
        Method ids = MongoUserRepository.class.getMethod("findAllActiveById", Collection.class);
        Method all = MongoUserRepository.class.getMethod("findAllActive");

        assertThat(id.getAnnotation(Query.class).value())
                .isEqualTo("{ '_id': ?0, 'deletedAt': null }");
        assertThat(email.getAnnotation(Query.class).value())
                .isEqualTo("{ 'email': ?0, 'deletedAt': null }");
        assertThat(username.getAnnotation(Query.class).value())
                .isEqualTo("{ 'username': ?0, 'deletedAt': null }");
        assertThat(ids.getAnnotation(Query.class).value())
                .isEqualTo("{ '_id': { '$in': ?0 }, 'deletedAt': null }");
        assertThat(all.getAnnotation(Query.class).value()).isEqualTo("{ 'deletedAt': null }");
    }
}
