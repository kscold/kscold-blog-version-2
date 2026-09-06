package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.command.UpdateProfileCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserProfileApplicationServiceTest {

    private UserRepository userRepository;
    private UserProfileApplicationService service;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        service = new UserProfileApplicationService(userRepository);
        user =
                User.builder()
                        .id("user-1")
                        .username("kscold")
                        .email("user@example.com")
                        .role(User.Role.USER)
                        .profile(User.Profile.builder().displayName("기존 이름").build())
                        .build();
        when(userRepository.findActiveById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.updateProfileIfActive(eq("user-1"), any(User.Profile.class)))
                .thenAnswer(
                        invocation -> {
                            user.setProfile(invocation.getArgument(1));
                            return Optional.of(user);
                        });
    }

    @Test
    void 프로필_문자열과_기술_스택을_정규화한다() {
        UpdateProfileCommand command =
                UpdateProfileCommand.builder()
                        .displayName(" 새 이름 ")
                        .bio(" 소개 ")
                        .avatar(" https://bucket.kscold.com/avatar.png ")
                        .socialLinks(Map.of("github", " https://github.com/kscold "))
                        .techStack(List.of(" Java ", "Java", " Python "))
                        .build();

        service.updateMyProfile("user-1", command);

        assertThat(user.getProfile().getDisplayName()).isEqualTo("새 이름");
        assertThat(user.getProfile().getBio()).isEqualTo("소개");
        assertThat(user.getProfile().getAvatar()).isEqualTo("https://bucket.kscold.com/avatar.png");
        assertThat(user.getProfile().getSocialLinks())
                .containsEntry("github", "https://github.com/kscold");
        assertThat(user.getProfile().getTechStack()).containsExactly("Java", "Python");
        verify(userRepository).updateProfileIfActive("user-1", user.getProfile());
        verify(userRepository, never()).save(any());
    }

    @Test
    void 위험한_소셜_링크와_프로필_이미지_스킴을_거부한다() {
        UpdateProfileCommand scriptLink =
                UpdateProfileCommand.builder()
                        .socialLinks(Map.of("website", "javascript:alert(1)"))
                        .build();
        UpdateProfileCommand insecureAvatar =
                UpdateProfileCommand.builder().avatar("http://example.com/avatar.png").build();

        assertThatThrownBy(() -> service.updateMyProfile("user-1", scriptLink))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> service.updateMyProfile("user-1", insecureAvatar))
                .isInstanceOf(InvalidRequestException.class);
        verify(userRepository, never()).updateProfileIfActive(eq("user-1"), any());
    }

    @Test
    void 지원하지_않는_링크와_과도한_기술_스택을_서비스에서도_거부한다() {
        UpdateProfileCommand unsupportedLink =
                UpdateProfileCommand.builder()
                        .socialLinks(Map.of("custom", "https://example.com"))
                        .build();
        UpdateProfileCommand tooManyStacks =
                UpdateProfileCommand.builder()
                        .techStack(
                                java.util.stream.IntStream.rangeClosed(1, 31)
                                        .mapToObj(index -> "stack-" + index)
                                        .toList())
                        .build();

        assertThatThrownBy(() -> service.updateMyProfile("user-1", unsupportedLink))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> service.updateMyProfile("user-1", tooManyStacks))
                .isInstanceOf(InvalidRequestException.class);
        verify(userRepository, never()).updateProfileIfActive(eq("user-1"), any());
    }

    @Test
    void 탈퇴한_사용자의_공개_프로필을_숨긴다() {
        User deleted =
                User.builder()
                        .id("deleted-1")
                        .username("deleted")
                        .deletedAt(LocalDateTime.now())
                        .build();
        when(userRepository.findActiveByUsername("deleted")).thenReturn(Optional.of(deleted));

        assertThatThrownBy(() -> service.getPublicProfile("deleted"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void 기술_스택_목록에서_탈퇴한_사용자를_제외한다() {
        user.setProfile(User.Profile.builder().techStack(List.of("Spring Boot")).build());
        User deleted =
                User.builder()
                        .id("deleted-1")
                        .username("deleted")
                        .deletedAt(LocalDateTime.now())
                        .profile(User.Profile.builder().techStack(List.of("Retired Stack")).build())
                        .build();
        when(userRepository.findAllActive()).thenReturn(List.of(user, deleted));

        assertThat(service.getAllTechStacks()).containsExactly("Spring Boot");
        verify(userRepository).findAllActive();
    }

    @Test
    void 프로필_변경_중_탈퇴한_사용자는_찾을_수_없는_사용자로_처리한다() {
        when(userRepository.updateProfileIfActive(eq("user-1"), any(User.Profile.class)))
                .thenReturn(Optional.empty());
        UpdateProfileCommand command = UpdateProfileCommand.builder().displayName("새 이름").build();

        assertThatThrownBy(() -> service.updateMyProfile("user-1", command))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void 프로필_응답은_원자_갱신이_반환한_최종_사용자를_사용한다() {
        User persisted =
                User.builder()
                        .id("user-1")
                        .username("kscold")
                        .email("user@example.com")
                        .role(User.Role.USER)
                        .profile(User.Profile.builder().displayName("저장된 이름").build())
                        .build();
        when(userRepository.updateProfileIfActive(eq("user-1"), any(User.Profile.class)))
                .thenReturn(Optional.of(persisted));

        AuthResponse.UserInfo response =
                service.updateMyProfile(
                        "user-1", UpdateProfileCommand.builder().displayName("요청 이름").build());

        assertThat(response.getDisplayName()).isEqualTo("저장된 이름");
    }
}
