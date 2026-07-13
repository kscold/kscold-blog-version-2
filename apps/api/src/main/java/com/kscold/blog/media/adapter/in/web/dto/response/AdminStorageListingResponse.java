package com.kscold.blog.media.adapter.in.web.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kscold.blog.media.domain.model.AdminStorageFolderItem;
import com.kscold.blog.media.domain.model.AdminStorageListing;
import com.kscold.blog.media.domain.model.AdminStorageObjectItem;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStorageListingResponse {

    private String bucket;
    private String currentPrefix;
    private String parentPrefix;
    private List<FolderItem> folders;
    private List<ObjectItem> objects;
    private Integer deletedKeys;

    public static AdminStorageListingResponse from(AdminStorageListing listing) {
        return AdminStorageListingResponse.builder()
                .bucket(listing.getBucket())
                .currentPrefix(listing.getCurrentPrefix())
                .parentPrefix(listing.getParentPrefix())
                .folders(
                        listing.getFolders() == null
                                ? List.of()
                                : listing.getFolders().stream().map(FolderItem::from).toList())
                .objects(
                        listing.getObjects() == null
                                ? List.of()
                                : listing.getObjects().stream().map(ObjectItem::from).toList())
                .deletedKeys(listing.getDeletedKeys())
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FolderItem {
        private String name;
        private String key;

        public static FolderItem from(AdminStorageFolderItem item) {
            return FolderItem.builder().name(item.getName()).key(item.getKey()).build();
        }
    }

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ObjectItem {
        @Getter private String name;
        @Getter private String key;
        @Getter private long size;
        @Getter private String lastModified;
        private boolean image;
        @Getter private String publicUrl;

        @JsonProperty("isImage")
        public boolean isImage() {
            return image;
        }

        public static ObjectItem from(AdminStorageObjectItem item) {
            return ObjectItem.builder()
                    .name(item.getName())
                    .key(item.getKey())
                    .size(item.getSize())
                    .lastModified(item.getLastModified())
                    .image(item.isImage())
                    .publicUrl(item.getPublicUrl())
                    .build();
        }
    }
}
