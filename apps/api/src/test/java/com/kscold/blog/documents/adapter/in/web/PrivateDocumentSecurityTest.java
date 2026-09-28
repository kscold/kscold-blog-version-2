package com.kscold.blog.documents.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.config.CorsOriginPolicy;
import com.kscold.blog.config.SecurityConfig;
import com.kscold.blog.documents.application.dto.SearchPrivateDocumentsCommand;
import com.kscold.blog.documents.application.dto.UploadPrivateDocumentCommand;
import com.kscold.blog.documents.application.port.in.PrivateDocumentUseCase;
import com.kscold.blog.documents.domain.model.PrivateDocument;
import com.kscold.blog.documents.domain.model.PrivateDocumentCategory;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.GlobalExceptionHandler;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.adapter.in.web.CookieCsrfProtectionFilter;
import com.kscold.blog.identity.adapter.in.web.JwtAuthenticationFilter;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

class PrivateDocumentSecurityTest {

    private static final String ID = "2f6290f3-4016-454f-807d-264c9cc42d69";
    private AnnotationConfigWebApplicationContext context;
    private MockMvc mvc;
    private PrivateDocumentUseCase useCase;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(TestConfiguration.class);
        context.refresh();
        useCase = context.getBean(PrivateDocumentUseCase.class);
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void anonymousCannotReadOrMutateAnyDocumentEndpoint() throws Exception {
        for (MockHttpServletRequestBuilder request : protectedRequests()) {
            mvc.perform(request).andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(useCase);
    }

    @Test
    void ordinaryUserCannotReadOrMutateAnyDocumentEndpoint() throws Exception {
        for (MockHttpServletRequestBuilder request : protectedRequests()) {
            mvc.perform(request.with(authentication(principal("USER"))))
                    .andExpect(status().isForbidden());
        }
        verifyNoInteractions(useCase);
    }

    @Test
    void adminSearchBindsDefaultsAndUsesAuthenticatedOwner() throws Exception {
        when(useCase.search(any())).thenReturn(Page.empty(PageRequest.of(0, 12)));
        mvc.perform(
                        get("/admin/documents")
                                .param("ownerId", "other-owner")
                                .with(authentication(principal("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow, noarchive"));
        ArgumentCaptor<SearchPrivateDocumentsCommand> command =
                ArgumentCaptor.forClass(SearchPrivateDocumentsCommand.class);
        verify(useCase).search(command.capture());
        org.assertj.core.api.Assertions.assertThat(command.getValue().criteria().ownerId())
                .isEqualTo("owner-id");
        org.assertj.core.api.Assertions.assertThat(command.getValue().size()).isEqualTo(12);
    }

    @Test
    void adminMetadataUsesAuthenticatedOwnerAndDoesNotExposeStorageKeys() throws Exception {
        when(useCase.get("owner-id", ID))
                .thenReturn(
                        PrivateDocument.builder()
                                .id(ID)
                                .ownerId("owner-id")
                                .objectKey("documents/private-key")
                                .title("이력서")
                                .fileName("이력서.pdf")
                                .category(PrivateDocumentCategory.RESUME)
                                .size(3)
                                .contentType("application/pdf")
                                .build());
        mvc.perform(
                        get("/admin/documents/" + ID)
                                .param("ownerId", "other-owner")
                                .with(authentication(principal("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Pragma", "no-cache"))
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow, noarchive"))
                .andExpect(jsonPath("$.data.id").value(ID))
                .andExpect(jsonPath("$.data.fileName").value("이력서.pdf"))
                .andExpect(jsonPath("$.data.contentType").value("application/pdf"))
                .andExpect(jsonPath("$.data.ownerId").doesNotExist())
                .andExpect(jsonPath("$.data.objectKey").doesNotExist())
                .andExpect(jsonPath("$.data.publicUrl").doesNotExist());
        verify(useCase).get("owner-id", ID);
    }

    @Test
    void missingOrUnownedMetadataReturnsNotFound() throws Exception {
        when(useCase.get("owner-id", ID))
                .thenThrow(
                        new ResourceNotFoundException(
                                ErrorCode.RESOURCE_NOT_FOUND, "문서를 찾을 수 없습니다."));
        mvc.perform(get("/admin/documents/" + ID).with(authentication(principal("ADMIN"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("문서를 찾을 수 없습니다."));
    }

    @Test
    void multipartBindsCategoryAndExcludesPrivateKeysFromResponse() throws Exception {
        when(useCase.upload(any()))
                .thenReturn(
                        PrivateDocument.builder()
                                .id(ID)
                                .ownerId("owner-id")
                                .objectKey("documents/private-key")
                                .title("이력서")
                                .fileName("이력서.pdf")
                                .category(PrivateDocumentCategory.CAREER)
                                .size(3)
                                .build());
        mvc.perform(
                        multipart("/admin/documents")
                                .file(file())
                                .param("category", "CAREER")
                                .param("description", "경력 정리")
                                .with(authentication(principal("ADMIN"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.category").value("CAREER"))
                .andExpect(jsonPath("$.data.ownerId").doesNotExist())
                .andExpect(jsonPath("$.data.objectKey").doesNotExist())
                .andExpect(jsonPath("$.data.publicUrl").doesNotExist());
        ArgumentCaptor<UploadPrivateDocumentCommand> command =
                ArgumentCaptor.forClass(UploadPrivateDocumentCommand.class);
        verify(useCase).upload(command.capture());
        org.assertj.core.api.Assertions.assertThat(command.getValue().metadata().category())
                .isEqualTo(PrivateDocumentCategory.CAREER);
    }

    private List<MockHttpServletRequestBuilder> protectedRequests() {
        return List.of(
                get("/admin/documents"),
                head("/admin/documents"),
                get("/admin/documents/" + ID),
                head("/admin/documents/" + ID),
                get("/admin/documents/" + ID + "/download"),
                head("/admin/documents/" + ID + "/download"),
                multipart("/admin/documents").file(file()),
                put("/admin/documents/" + ID)
                        .contentType("application/json")
                        .content("{\"title\":\"이력서\",\"category\":\"RESUME\"}"),
                delete("/admin/documents/" + ID));
    }

    private MockMultipartFile file() {
        return new MockMultipartFile("file", "이력서.pdf", "application/pdf", new byte[] {1, 2, 3});
    }

    private UsernamePasswordAuthenticationToken principal(String role) {
        return new UsernamePasswordAuthenticationToken(
                "owner-id", null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }

    @Configuration
    @EnableWebMvc
    @Import({SecurityConfig.class, PrivateDocumentController.class, GlobalExceptionHandler.class})
    static class TestConfiguration {

        @Bean
        PrivateDocumentUseCase useCase() {
            return mock(PrivateDocumentUseCase.class);
        }

        @Bean
        NotificationUseCase notificationUseCase() {
            return mock(NotificationUseCase.class);
        }

        @Bean
        ObjectMapper objectMapper() {
            return new ObjectMapper().findAndRegisterModules();
        }

        @Bean
        CorsOriginPolicy corsOriginPolicy() {
            return new CorsOriginPolicy("https://kscold.com");
        }

        @Bean
        JwtAuthenticationFilter jwtAuthenticationFilter() {
            return new JwtAuthenticationFilter(
                    mock(TokenProvider.class), mock(UserQueryPort.class));
        }

        @Bean
        CookieCsrfProtectionFilter cookieCsrfProtectionFilter(
                CorsOriginPolicy policy, ObjectMapper mapper) {
            return new CookieCsrfProtectionFilter(policy, mapper);
        }
    }
}
