package com.kscold.blog.documents.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentCategory;
import com.kscold.blog.documents.domain.model.PrivateDocumentSearchCriteria;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

@ExtendWith(MockitoExtension.class)
class PrivateDocumentRepositoryAdapterTest {

    @Mock private MongoPrivateDocumentRepository repository;
    @Mock private MongoTemplate mongoTemplate;

    @Test
    void scopesSearchAndCountToOwnerAndQuotesRegexInput() {
        when(mongoTemplate.count(any(Query.class), eq(PrivateDocument.class))).thenReturn(0L);
        when(mongoTemplate.find(any(Query.class), eq(PrivateDocument.class))).thenReturn(List.of());
        PrivateDocumentRepositoryAdapter adapter =
                new PrivateDocumentRepositoryAdapter(repository, mongoTemplate);
        adapter.findAll(
                new PrivateDocumentSearchCriteria("owner", PrivateDocumentCategory.CAREER, ".*"),
                PageRequest.of(1, 12, Sort.by(Sort.Direction.DESC, "createdAt", "id")));
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(query.capture(), eq(PrivateDocument.class));
        Document conditions = query.getValue().getQueryObject();
        assertThat(conditions.getString("ownerId")).isEqualTo("owner");
        assertThat(conditions.get("category")).isEqualTo(PrivateDocumentCategory.CAREER);
        assertThat(conditions.toString()).contains("\\Q.*\\E");
        assertThat(query.getValue().getSkip()).isEqualTo(12);
        assertThat(query.getValue().getLimit()).isEqualTo(12);
    }
}
