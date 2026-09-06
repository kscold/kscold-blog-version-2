package com.kscold.blog.adminnight.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import java.lang.reflect.Method;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.repository.Query;

class MongoAdminNightRequestRepositoryTest {

    @Test
    @DisplayName("캘린더 조회는 시작일과 종료일을 모두 포함하고 날짜순으로 정렬한다")
    void calendarQueryUsesInclusiveBoundaries() throws NoSuchMethodException {
        Method method =
                MongoAdminNightRequestRepository.class.getMethod(
                        "findScheduledBetweenInclusive",
                        AdminNightRequest.Status.class,
                        LocalDate.class,
                        LocalDate.class);

        Query query = method.getAnnotation(Query.class);

        assertThat(query).isNotNull();
        assertThat(query.value())
                .isEqualTo("{ 'status': ?0, 'scheduledSlot.date': { '$gte': ?1, '$lte': ?2 } }");
        assertThat(query.sort()).isEqualTo("{ 'scheduledSlot.date': 1 }");
    }
}
