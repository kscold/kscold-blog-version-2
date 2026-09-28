package com.kscold.blog.documents.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kscold.blog.documents.application.dto.SearchPrivateDocumentsCommand;
import com.kscold.blog.documents.application.dto.UploadPrivateDocumentCommand;
import com.kscold.blog.documents.application.port.in.PrivateDocumentUseCase;
import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentCategory;
import com.kscold.blog.documents.domain.model.PrivateDocumentMetadata;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

class PrivateDocumentCategoryBindingTest {

    private static final String ID = "2f6290f3-4016-454f-807d-264c9cc42d69";
    private AnnotationConfigWebApplicationContext context;
    private MockMvc mvc;
    private PrivateDocumentUseCase useCase;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(PrivateDocumentSecurityTest.TestConfiguration.class);
        context.refresh();
        useCase = context.getBean(PrivateDocumentUseCase.class);
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @ParameterizedTest
    @EnumSource(
            value = PrivateDocumentCategory.class,
            names = {"RESUME", "CAREER", "STORY"})
    void multipartSeparatesResumeSourceAndStory(PrivateDocumentCategory category) throws Exception {
        when(useCase.upload(any())).thenReturn(document(category));
        mvc.perform(
                        multipart("/admin/documents")
                                .file(
                                        new MockMultipartFile(
                                                "file",
                                                "면접 정리.md",
                                                "text/markdown",
                                                new byte[] {1}))
                                .param("category", category.name())
                                .with(authentication(admin())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.category").value(category.name()));
        var command = ArgumentCaptor.forClass(UploadPrivateDocumentCommand.class);
        verify(useCase).upload(command.capture());
        assertThat(command.getValue().metadata().category()).isEqualTo(category);
        assertThat(command.getValue().ownerId()).isEqualTo("owner-id");
    }

    @ParameterizedTest
    @EnumSource(
            value = PrivateDocumentCategory.class,
            names = {"RESUME", "CAREER", "STORY"})
    void searchKeepsEachCareerGroupSeparate(PrivateDocumentCategory category) throws Exception {
        when(useCase.search(any())).thenReturn(Page.empty(PageRequest.of(0, 12)));
        mvc.perform(
                        get("/admin/documents")
                                .param("category", category.name())
                                .param("query", "경험 정리")
                                .with(authentication(admin())))
                .andExpect(status().isOk());
        var command = ArgumentCaptor.forClass(SearchPrivateDocumentsCommand.class);
        verify(useCase).search(command.capture());
        assertThat(command.getValue().criteria().category()).isEqualTo(category);
        assertThat(command.getValue().criteria().ownerId()).isEqualTo("owner-id");
    }

    @ParameterizedTest
    @EnumSource(
            value = PrivateDocumentCategory.class,
            names = {"RESUME", "CAREER", "STORY"})
    void metadataUpdateBindsExplicitCareerGroup(PrivateDocumentCategory category) throws Exception {
        when(useCase.update(eq("owner-id"), eq(ID), any())).thenReturn(document(category));
        mvc.perform(
                        put("/admin/documents/" + ID)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"title\":\"면접 정리\",\"category\":\""
                                                + category.name()
                                                + "\"}")
                                .with(authentication(admin())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.category").value(category.name()));
        var metadata = ArgumentCaptor.forClass(PrivateDocumentMetadata.class);
        verify(useCase).update(eq("owner-id"), eq(ID), metadata.capture());
        assertThat(metadata.getValue().category()).isEqualTo(category);
    }

    private PrivateDocument document(PrivateDocumentCategory category) {
        return PrivateDocument.builder()
                .id(ID)
                .ownerId("owner-id")
                .title("면접 정리")
                .fileName("면접 정리.md")
                .category(category)
                .size(1)
                .build();
    }

    private UsernamePasswordAuthenticationToken admin() {
        return new UsernamePasswordAuthenticationToken(
                "owner-id", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }
}
