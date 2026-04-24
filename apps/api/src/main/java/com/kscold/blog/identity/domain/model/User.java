package com.kscold.blog.identity.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String username;

    private String password;

    private Role role;

    private Profile profile;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /** 소프트 딜리트 타임스탬프 (null이면 활성 계정) */
    private LocalDateTime deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public enum Role {
        ADMIN, USER
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Profile {
        private String displayName;
        private String bio;
        private String avatar;
        private Map<String, String> socialLinks;
    }

    /**
     * 표시 이름 반환 (profile.displayName 우선, 없으면 username)
     */
    public String getDisplayName() {
        if (profile != null && profile.getDisplayName() != null) {
            return profile.getDisplayName();
        }
        return username;
    }
}
