package com.kscold.blog.media.application.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class AdminStorageListing {
    private String bucket;
    private String currentPrefix;
    private String parentPrefix;
    private List<AdminStorageFolderItem> folders;
    private List<AdminStorageObjectItem> objects;
    private Integer deletedKeys;
}
