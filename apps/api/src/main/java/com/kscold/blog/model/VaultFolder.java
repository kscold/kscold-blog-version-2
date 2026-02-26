package com.kscold.blog.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vault_folders")
public class VaultFolder {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String parent;

    @Builder.Default
    private List<String> ancestors = new ArrayList<>();

    @Builder.Default
    private Integer depth = 0;

    @Builder.Default
    private Integer order = 0;

    @Builder.Default
    private Integer noteCount = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
