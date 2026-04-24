package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserManagementUseCase;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService implements UserManagementUseCase {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void softDelete(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
        if (user.getDeletedAt() != null) return;
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Soft deleted user {}", userId);
    }

    @Override
    @Transactional
    public void hardDelete(String userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw ResourceNotFoundException.user(userId);
        }
        userRepository.deleteById(userId);
        log.warn("Hard deleted user {}", userId);
    }
}
