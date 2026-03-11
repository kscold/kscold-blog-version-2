package com.kscold.blog.vault.domain.service;

import com.kscold.blog.util.SlugUtils;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 마크다운 컨텐츠에서 [[백링크]]를 파싱하여 참조 대상 노트 ID 목록을 추출하는 도메인 서비스
 * 순수 Java 객체 — Spring 빈 등록 금지
 */
@RequiredArgsConstructor
public class BacklinkParsingService {

    private final VaultNoteRepository vaultNoteRepository;

    private static final Pattern BACKLINK_PATTERN = Pattern.compile("\\[\\[([^\\]]+)\\]\\]");

    /**
     * 마크다운 내 [[백링크]] 파싱 -> 참조 대상 노트 ID 목록 추출
     * [[제목]] 형태에서 제목을 슬러그로 변환 후 노트 ID 조회
     */
    public List<String> parseBacklinks(String content) {
        if (content == null) {
            return new ArrayList<>();
        }

        List<String> links = new ArrayList<>();
        Matcher matcher = BACKLINK_PATTERN.matcher(content);

        while (matcher.find()) {
            String linkTitle = matcher.group(1).trim();
            String slug = SlugUtils.generate(linkTitle);
            vaultNoteRepository.findBySlug(slug)
                    .ifPresent(note -> links.add(note.getId()));
        }

        return links;
    }
}
