#!/usr/bin/env python3
"""
옵시디언 볼트를 Vault API로 업로드하는 스크립트
- 노트 텍스트 -> MongoDB (API 경유)
- 이미지 -> 파일시스템 (/uploads/vault/)에 직접 복사
"""

import os
import re
import json
import sys
from urllib.request import Request, urlopen
from urllib.parse import quote
from urllib.error import HTTPError

API_URL = "http://localhost:8080/api"
OBSIDIAN_ROOT = "/Users/kscold/Desktop/Obsidian"
SKIP_DIRS = {".obsidian", ".git", ".claude", "image", ".DS_Store"}

def api_request(method, path, data=None, token=None):
    url = f"{API_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8")), resp.status
    except HTTPError as e:
        body = e.read().decode("utf-8")
        return json.loads(body) if body else {}, e.code

def get_token():
    result, _ = api_request("POST", "/auth/login", {
        "email": "kscold@dev.com",
        "password": "admin1234"
    })
    return result["data"]["accessToken"]

def slugify(name):
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9가-힣\s\-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug if slug else 'untitled'

def make_unique_slug(slug, existing_slugs):
    if slug not in existing_slugs:
        existing_slugs.add(slug)
        return slug
    counter = 1
    while f"{slug}-{counter}" in existing_slugs:
        counter += 1
    unique = f"{slug}-{counter}"
    existing_slugs.add(unique)
    return unique

def replace_image_paths(content, folder_key):
    content = re.sub(
        r'!\[\[([^\]]+\.(png|jpg|jpeg|gif|webp|svg))\]\]',
        lambda m: f'![{m.group(1)}](/uploads/vault/{folder_key}/{quote(m.group(1))})',
        content, flags=re.IGNORECASE
    )
    content = re.sub(
        r'!\[([^\]]*)\]\(image/([^)]+)\)',
        lambda m: f'![{m.group(1)}](/uploads/vault/{folder_key}/{quote(m.group(2))})',
        content
    )
    return content

def main():
    token = get_token()
    print(f"=== 옵시디언 볼트 업로드 시작 ===")
    print(f"소스: {OBSIDIAN_ROOT}")

    top_dirs = []
    for item in sorted(os.listdir(OBSIDIAN_ROOT)):
        path = os.path.join(OBSIDIAN_ROOT, item)
        if os.path.isdir(path) and item not in SKIP_DIRS and not item.startswith('.'):
            top_dirs.append(item)

    print(f"최상위 폴더: {top_dirs}")

    folder_map = {}
    existing_slugs = set()
    total_notes = 0
    success_notes = 0

    def process_dir(dir_path, parent_id, depth, image_folder_key):
        nonlocal total_notes, success_notes

        dir_name = os.path.basename(dir_path)
        folder_slug = make_unique_slug(slugify(dir_name), existing_slugs)

        payload = {"name": dir_name, "slug": folder_slug}
        if parent_id:
            payload["parent"] = parent_id
        result, status = api_request("POST", "/vault/folders", payload, token)
        if status not in (200, 201):
            print(f"  [WARN] 폴더 생성 실패: {dir_name} - {result}")
            return
        folder_id = result["data"]["id"]
        folder_map[dir_path] = folder_id
        print(f"{'  ' * depth}[폴더] {dir_name}")

        items = sorted(os.listdir(dir_path))

        for item in items:
            item_path = os.path.join(dir_path, item)
            if os.path.isdir(item_path) and item not in SKIP_DIRS and not item.startswith('.'):
                process_dir(item_path, folder_id, depth + 1, image_folder_key)

        md_files = [f for f in items if f.endswith('.md') and os.path.isfile(os.path.join(dir_path, f))]
        for md_file in md_files:
            total_notes += 1
            md_path = os.path.join(dir_path, md_file)
            title = md_file.replace('.md', '')
            note_slug = make_unique_slug(slugify(title), existing_slugs)

            try:
                with open(md_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                print(f"{'  ' * (depth+1)}[ERR] 읽기 실패: {md_file} - {e}")
                continue

            content = replace_image_paths(content, image_folder_key)
            tags = re.findall(r'(?:^|\s)#([a-zA-Z가-힣0-9_]+)', content)
            tags = list(set(tags))[:10]

            note_payload = {
                "title": title,
                "slug": note_slug,
                "content": content,
                "folderId": folder_id,
                "tags": tags
            }
            result, status = api_request("POST", "/vault/notes", note_payload, token)
            if status in (200, 201):
                success_notes += 1
                if success_notes % 100 == 0:
                    print(f"  ... {success_notes}개 업로드 완료")
            else:
                print(f"  [WARN] 노트 실패: {title[:30]}")

    for top_dir in top_dirs:
        dir_path = os.path.join(OBSIDIAN_ROOT, top_dir)
        image_folder_key = f"{top_dir.lower()}-image"
        process_dir(dir_path, None, 0, image_folder_key)

    print(f"\n=== 업로드 완료 ===")
    print(f"총 노트: {total_notes}")
    print(f"성공: {success_notes}")
    print(f"실패: {total_notes - success_notes}")
    print(f"폴더: {len(folder_map)}개")

if __name__ == "__main__":
    main()
