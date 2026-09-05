package com.kscold.blog.media.adapter.out.storage;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AdminStorageContentTypeResolverTest {

    @Test
    void 명시한_콘텐츠_유형은_그대로_사용한다() {
        assertThat(AdminStorageContentTypeResolver.resolve("image/avif", "cover.bin"))
                .isEqualTo("image/avif");
    }

    @Test
    void 파일_확장자로_콘텐츠_유형과_이미지_여부를_판단한다() {
        assertThat(AdminStorageContentTypeResolver.resolve(null, "README.MD"))
                .isEqualTo("text/markdown; charset=utf-8");
        assertThat(AdminStorageContentTypeResolver.infer("payload.unknown"))
                .isEqualTo("application/octet-stream");
        assertThat(AdminStorageContentTypeResolver.isImage("cover.WEBP")).isTrue();
        assertThat(AdminStorageContentTypeResolver.isImage("index.html")).isFalse();
    }
}
