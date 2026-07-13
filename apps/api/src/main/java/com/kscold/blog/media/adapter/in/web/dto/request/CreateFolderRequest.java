package com.kscold.blog.media.adapter.in.web.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CreateFolderRequest {

    private String prefix;
    private String folderName;
}
