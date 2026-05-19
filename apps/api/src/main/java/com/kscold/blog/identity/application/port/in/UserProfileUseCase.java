package com.kscold.blog.identity.application.port.in;

import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.UpdateProfileCommand;

import java.util.List;

public interface UserProfileUseCase {

    AuthResult.UserInfo updateMyProfile(String userId, UpdateProfileCommand command);

    AuthResult.UserInfo updateUserProfile(String targetUserId, UpdateProfileCommand command);

    List<String> getAllTechStacks();
}
