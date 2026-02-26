package com.kscold.blog.dto.response;

import com.kscold.blog.model.VaultFolder;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaultFolderResponse {

    private String id;
    private String name;
    private String slug;
    private String parent;
    private Integer depth;
    private Integer order;
    private Integer noteCount;

    @Builder.Default
    private List<VaultFolderResponse> children = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VaultFolderResponse from(VaultFolder folder) {
        return VaultFolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .slug(folder.getSlug())
                .parent(folder.getParent())
                .depth(folder.getDepth())
                .order(folder.getOrder())
                .noteCount(folder.getNoteCount())
                .children(new ArrayList<>())
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .build();
    }

    public static List<VaultFolderResponse> buildTree(List<VaultFolder> allFolders) {
        Map<String, VaultFolderResponse> map = allFolders.stream()
                .collect(Collectors.toMap(VaultFolder::getId, VaultFolderResponse::from));

        List<VaultFolderResponse> roots = new ArrayList<>();

        for (VaultFolder folder : allFolders) {
            VaultFolderResponse resp = map.get(folder.getId());
            if (folder.getParent() == null) {
                roots.add(resp);
            } else {
                VaultFolderResponse parentResp = map.get(folder.getParent());
                if (parentResp != null) {
                    parentResp.getChildren().add(resp);
                } else {
                    roots.add(resp);
                }
            }
        }

        sortChildren(roots);
        return roots;
    }

    private static void sortChildren(List<VaultFolderResponse> list) {
        list.sort(Comparator.comparingInt(c -> c.getOrder() != null ? c.getOrder() : 0));
        for (VaultFolderResponse item : list) {
            if (item.getChildren() != null && !item.getChildren().isEmpty()) {
                sortChildren(item.getChildren());
            }
        }
    }
}
