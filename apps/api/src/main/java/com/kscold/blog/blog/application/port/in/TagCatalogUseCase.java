package com.kscold.blog.blog.application.port.in;

import com.kscold.blog.blog.domain.model.TagUsage;
import java.util.List;

/**
 * 글과 피드에 흩어진 태그를 하나의 목록으로 모아 다루는 유스케이스.
 *
 * <p>태그 등록·수정 자체는 {@link TagUseCase} 가 맡고, 여기서는 두 곳의 사용량을 합치거나 태그를 정리하는 일만 한다. 이렇게 나눠야 피드가 태그를
 * 등록하면서 생기는 순환 참조를 피할 수 있다.
 */
public interface TagCatalogUseCase {

    /** 글·피드 사용량을 합친 태그 목록. 많이 쓰인 순으로 돌려준다. */
    List<TagUsage> getIndex();

    /**
     * 아직 등록되지 않은 피드 태그를 tags 컬렉션에 채우고, 분류가 비어 있는 태그는 글이 가장 많이 속한 카테고리로 묶는다.
     *
     * @return 새로 등록했거나 카테고리를 채운 태그 수
     */
    int reindex();

    /**
     * 태그 둘을 하나로 합친다. 글과 피드의 참조를 모두 옮긴 뒤 넘긴 쪽 태그 문서를 지운다.
     *
     * @return 옮겨진 글·피드 수
     */
    long merge(String sourceTagId, String targetTagId);
}
