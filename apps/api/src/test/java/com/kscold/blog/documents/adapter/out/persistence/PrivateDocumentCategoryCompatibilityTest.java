package com.kscold.blog.documents.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.documents.domain.model.PrivateDocument;
import java.util.Set;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

class PrivateDocumentCategoryCompatibilityTest {

    private MappingMongoConverter converter;

    @BeforeEach
    void setUp() {
        var conversions = MongoCustomConversions.create(adapter -> {});
        var context = new MongoMappingContext();
        context.setSimpleTypeHolder(conversions.getSimpleTypeHolder());
        context.setInitialEntitySet(Set.of(PrivateDocument.class));
        context.afterPropertiesSet();
        converter = new MappingMongoConverter(NoOpDbRefResolver.INSTANCE, context);
        converter.setCustomConversions(conversions);
        converter.afterPropertiesSet();
    }

    @ParameterizedTest
    @ValueSource(strings = {"RESUME", "CAREER", "PERSONAL", "OTHER", "STORY"})
    void preservesStoredCategoryNamesWithoutMigration(String category) {
        var stored =
                new Document("_id", "document-id")
                        .append("ownerId", "owner-id")
                        .append("title", "경력 자료")
                        .append("category", category);
        var document = converter.read(PrivateDocument.class, stored);
        var rewritten = new Document();
        converter.write(document, rewritten);
        assertThat(document.getCategory().name()).isEqualTo(category);
        assertThat(rewritten.getString("category")).isEqualTo(category);
    }
}
