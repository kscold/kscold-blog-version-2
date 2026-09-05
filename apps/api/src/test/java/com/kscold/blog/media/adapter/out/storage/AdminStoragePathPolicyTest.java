package com.kscold.blog.media.adapter.out.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.InvalidRequestException;
import org.junit.jupiter.api.Test;

class AdminStoragePathPolicyTest {

    @Test
    void 폴더_경로는_구분자와_현재_경로를_정규화한다() {
        assertThat(AdminStoragePathPolicy.normalizePrefix(" /images//2026/./ "))
                .isEqualTo("images/2026/");
        assertThat(AdminStoragePathPolicy.normalizePrefix("images\\posts"))
                .isEqualTo("images/posts/");
        assertThat(AdminStoragePathPolicy.normalizePrefix(null)).isEmpty();
    }

    @Test
    void 상위_경로_이동과_빈_객체_키는_거부한다() {
        assertThatThrownBy(() -> AdminStoragePathPolicy.normalizePrefix("images/../private"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("잘못된 경로");
        assertThatThrownBy(() -> AdminStoragePathPolicy.normalizeObjectKey(" / "))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("파일 경로");
    }

    @Test
    void 업로드_파일명은_클라이언트_경로를_제거한다() {
        assertThat(AdminStoragePathPolicy.extractFileName("C:\\fakepath\\avatar.PNG"))
                .isEqualTo("avatar.PNG");
        assertThatThrownBy(() -> AdminStoragePathPolicy.extractFileName(null))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("파일 이름");
    }

    @Test
    void 부모_경로와_마지막_파일명을_계산한다() {
        assertThat(AdminStoragePathPolicy.buildParentPrefix("images/posts/")).isEqualTo("images/");
        assertThat(AdminStoragePathPolicy.buildParentPrefix("images/")).isEmpty();
        assertThat(AdminStoragePathPolicy.buildParentPrefix("")).isNull();
        assertThat(AdminStoragePathPolicy.extractLeafName("images/posts/cover.webp"))
                .isEqualTo("cover.webp");
    }
}
