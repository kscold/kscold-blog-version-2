package com.kscold.blog.analytics.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.domain.model.PathStat;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

class MongoPageVisitLogAdapterTest {

    @Test
    void topPathsAggregatesVisitsAndUniqueVisitorsInOnePipeline() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        MongoPageVisitLogAdapter.RawPathStat raw = new MongoPageVisitLogAdapter.RawPathStat();
        raw.set_id("/blog");
        raw.setVisits(12);
        raw.setUniqueVisitors(7);
        when(mongoTemplate.aggregate(
                        any(Aggregation.class),
                        eq("page_visit_logs"),
                        eq(MongoPageVisitLogAdapter.RawPathStat.class)))
                .thenReturn(new AggregationResults<>(List.of(raw), new Document()));

        List<PathStat> result = new MongoPageVisitLogAdapter(mongoTemplate).topPaths(7, 20);

        assertThat(result).containsExactly(new PathStat("/blog", 12, 7));
        ArgumentCaptor<Aggregation> aggregation = ArgumentCaptor.forClass(Aggregation.class);
        verify(mongoTemplate)
                .aggregate(
                        aggregation.capture(),
                        eq("page_visit_logs"),
                        eq(MongoPageVisitLogAdapter.RawPathStat.class));
        assertThat(aggregation.getValue().toPipeline(Aggregation.DEFAULT_CONTEXT))
                .extracting(document -> document.keySet().iterator().next())
                .containsExactly("$match", "$group", "$group", "$sort", "$limit");
    }
}
