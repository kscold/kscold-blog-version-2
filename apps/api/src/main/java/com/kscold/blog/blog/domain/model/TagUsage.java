package com.kscold.blog.blog.domain.model;

/**
 * 태그 하나가 글과 피드에서 각각 몇 번 쓰였는지 합쳐서 보여주는 읽기 모델.
 *
 * <p>글 태그는 tags 컬렉션에 문서로 등록되지만 피드 태그는 문자열로만 남아, 예전에는 화면마다 두 곳을 따로 불러 합쳐야 했다. 이 모델이 그 합산 결과를 대신 들고
 * 다닌다.
 *
 * @param id 태그 문서 아이디. 아직 등록되지 않은 피드 전용 태그는 null 일 수 있다.
 * @param categoryId 이 태그를 묶은 블로그 카테고리. 분류 전이면 null.
 */
public record TagUsage(
        String id,
        String name,
        String slug,
        String categoryId,
        String categoryName,
        long postCount,
        long feedCount) {

    public long totalCount() {
        return postCount + feedCount;
    }

    /** 아직 tags 컬렉션에 없는 태그인지. 재색인이 필요한 대상이다. */
    public boolean isUnregistered() {
        return id == null;
    }
}
