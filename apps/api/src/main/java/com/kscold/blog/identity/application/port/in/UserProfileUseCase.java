package com.kscold.blog.identity.application.port.in;

import com.kscold.blog.identity.application.dto.command.UpdateProfileCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PublicProfileResponse;
import java.util.List;

public interface UserProfileUseCase {

    AuthResponse.UserInfo updateMyProfile(String userId, UpdateProfileCommand command);

    AuthResponse.UserInfo updateUserProfile(String targetUserId, UpdateProfileCommand command);

    List<String> getAllTechStacks();

    PublicProfileResponse getPublicProfile(String username);
}
