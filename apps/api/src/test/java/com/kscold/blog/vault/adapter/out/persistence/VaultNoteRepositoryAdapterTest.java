package com.kscold.blog.vault.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

class VaultNoteRepositoryAdapterTest {

    @Test
    void readsTheMinimalVaultSitemapIndexWithUpdatedAt() {
        MongoTemplate mongoTemplate = mock(MongoTemplate.class);
        Instant updatedAt = Instant.parse("2026-09-02T00:00:00Z");
        Document row =
                new Document("slug", "vault-note")
                        .append("contentLength", 120)
                        .append("updatedAt", Date.from(updatedAt));
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("vault_notes"), eq(Document.class)))
                .thenReturn(new AggregationResults<>(List.of(row), new Document()));
        VaultNoteRepositoryAdapter adapter =
                new VaultNoteRepositoryAdapter(mock(MongoVaultNoteRepository.class), mongoTemplate);

        List<VaultNoteRepository.SitemapNote> result = adapter.findAllForSitemap();

        assertThat(result)
                .containsExactly(new VaultNoteRepository.SitemapNote("vault-note", 120, updatedAt));
        ArgumentCaptor<Aggregation> aggregation = ArgumentCaptor.forClass(Aggregation.class);
        verify(mongoTemplate)
                .aggregate(aggregation.capture(), eq("vault_notes"), eq(Document.class));
        Document projection =
                aggregation
                        .getValue()
                        .toPipeline(Aggregation.DEFAULT_CONTEXT)
                        .getFirst()
                        .get("$project", Document.class);
        assertThat(projection.keySet())
                .containsExactlyInAnyOrder("_id", "slug", "contentLength", "updatedAt");
        assertThat(projection.toJson()).contains("$strLenCP", "$ifNull");
    }
}
