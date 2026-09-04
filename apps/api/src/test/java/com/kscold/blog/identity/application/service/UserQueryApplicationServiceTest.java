package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserQueryApplicationServiceTest {

    @Test
    @DisplayName("시나리오: 여러 사용자 프로필을 저장소에서 한 번에 조회해 ID로 반환한다")
    void getUsersByIdsUsesSingleRepositoryQuery() {
        UserRepository userRepository = mock(UserRepository.class);
        UserQueryApplicationService service = new UserQueryApplicationService(userRepository);
        List<String> ids = List.of("user-1", "user-2");
        User first = user("user-1", "first", "첫 번째");
        User second = user("user-2", "second", null);
        when(userRepository.findAllById(ids)).thenReturn(List.of(first, second));

        Map<String, UserQueryPort.UserInfo> users = service.getUsersByIds(ids);

        assertThat(users).containsOnlyKeys("user-1", "user-2");
        assertThat(users.get("user-1").displayName()).isEqualTo("첫 번째");
        assertThat(users.get("user-2").username()).isEqualTo("second");
        verify(userRepository).findAllById(ids);
    }

    private User user(String id, String username, String displayName) {
        return User.builder()
                .id(id)
                .username(username)
                .profile(User.Profile.builder().displayName(displayName).build())
                .email(username + "@example.com")
                .role(User.Role.USER)
                .build();
    }
}
