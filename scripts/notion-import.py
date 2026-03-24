#!/usr/bin/env python3
"""Notion → kscold.com 블로그 import 스크립트
- Notion 페이지 블록 → Markdown 변환
- 이미지 → MinIO(S3) 업로드
- 블로그 REST API로 포스트 생성
"""

import json, os, re, sys, time, uuid, urllib.parse
from datetime import datetime
from pathlib import Path

import boto3
import requests
from botocore.config import Config as BotoConfig

# ─── 설정 ───────────────────────────────────────────────
NOTION_TOKEN = os.environ["NOTION_TOKEN"]  # 환경변수 필수
NOTION_PAGE_ID = os.environ.get("NOTION_PAGE_ID", "2446a466646a80cea2a7e3b6d4eb0212")
NOTION_API = "https://api.notion.com/v1"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
}

BLOG_API = os.environ.get("BLOG_API", "http://localhost:8080/api")
BLOG_TOKEN = os.environ.get("BLOG_TOKEN", "")  # JWT access token

MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS = os.environ.get("MINIO_ACCESS", "minioadmin")
MINIO_SECRET = os.environ.get("MINIO_SECRET", "minioadmin")
MINIO_BUCKET = "blog"
MINIO_PUBLIC_URL = "https://bucket.kscold.com"

# ─── MinIO S3 Client ────────────────────────────────────
s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS,
    aws_secret_access_key=MINIO_SECRET,
    region_name="us-east-1",
    config=BotoConfig(signature_version="s3v4"),
)

# ─── Notion API helpers ─────────────────────────────────
def notion_get(path, params=None):
    r = requests.get(f"{NOTION_API}{path}", headers=NOTION_HEADERS, params=params)
    r.raise_for_status()
    return r.json()

def notion_post(path, body):
    r = requests.post(f"{NOTION_API}{path}", headers=NOTION_HEADERS, json=body)
    r.raise_for_status()
    return r.json()

def get_all_blocks(block_id):
    """재귀적으로 모든 블록 가져오기"""
    blocks = []
    cursor = None
    while True:
        params = {"page_size": 100}
        if cursor:
            params["start_cursor"] = cursor
        data = notion_get(f"/blocks/{block_id}/children", params)
        for b in data["results"]:
            blocks.append(b)
            if b.get("has_children") and b["type"] not in ("child_page", "child_database"):
                b["_children"] = get_all_blocks(b["id"])
        if not data.get("has_more"):
            break
        cursor = data["next_cursor"]
    return blocks

# ─── 이미지 처리 ────────────────────────────────────────
uploaded_images = {}  # url → minio_url 캐시

def upload_image_to_minio(image_url):
    if image_url in uploaded_images:
        return uploaded_images[image_url]
    try:
        r = requests.get(image_url, timeout=30)
        r.raise_for_status()
        content_type = r.headers.get("Content-Type", "image/png")
        ext_map = {"image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "image/svg+xml": "svg"}
        ext = ext_map.get(content_type, "png")
        key = f"notion/{uuid.uuid4()}.{ext}"
        s3.put_object(
            Bucket=MINIO_BUCKET,
            Key=key,
            Body=r.content,
            ContentType=content_type,
        )
        public_url = f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{key}"
        uploaded_images[image_url] = public_url
        print(f"  📷 {key}")
        return public_url
    except Exception as e:
        print(f"  ⚠️ 이미지 업로드 실패: {e}")
        return image_url

def get_image_url(block):
    img = block.get("image", {})
    if img.get("type") == "file":
        return img["file"]["url"]
    elif img.get("type") == "external":
        return img["external"]["url"]
    return ""

# ─── 블록 → 마크다운 변환 ───────────────────────────────
def rich_text_to_md(rich_texts):
    parts = []
    for t in rich_texts:
        text = t.get("plain_text", "")
        ann = t.get("annotations", {})
        href = t.get("href")
        if ann.get("code"):
            text = f"`{text}`"
        if ann.get("bold"):
            text = f"**{text}**"
        if ann.get("italic"):
            text = f"*{text}*"
        if ann.get("strikethrough"):
            text = f"~~{text}~~"
        if ann.get("underline"):
            text = f"<u>{text}</u>"
        if href:
            text = f"[{text}]({href})"
        parts.append(text)
    return "".join(parts)

def blocks_to_markdown(blocks, indent=0):
    lines = []
    prefix = "  " * indent
    numbered_idx = 0
    prev_was_image = False

    for b in blocks:
        btype = b["type"]
        data = b.get(btype, {})
        rich = data.get("rich_text", [])
        text = rich_text_to_md(rich)
        children = b.get("_children", [])

        if btype == "paragraph":
            # 이미지 바로 뒤 파일명 캡션 (IMG_*.HEIC 등) 제거
            import re as _re
            if prev_was_image and _re.match(r'^IMG_\d+\.\w+$', text.strip()):
                prev_was_image = False
                continue
            lines.append(f"{prefix}{text}")
            lines.append("")
        elif btype.startswith("heading_"):
            level = int(btype[-1])
            lines.append(f"{'#' * level} {text}")
            lines.append("")
        elif btype == "bulleted_list_item":
            lines.append(f"{prefix}- {text}")
            if children:
                lines.extend(blocks_to_markdown(children, indent + 1).splitlines())
        elif btype == "numbered_list_item":
            numbered_idx += 1
            lines.append(f"{prefix}{numbered_idx}. {text}")
            if children:
                lines.extend(blocks_to_markdown(children, indent + 1).splitlines())
        elif btype == "to_do":
            checked = "x" if data.get("checked") else " "
            lines.append(f"{prefix}- [{checked}] {text}")
        elif btype == "toggle":
            lines.append(f"{prefix}<details>")
            lines.append(f"{prefix}<summary>{text}</summary>")
            lines.append("")
            if children:
                lines.append(blocks_to_markdown(children, indent))
            lines.append(f"{prefix}</details>")
            lines.append("")
        elif btype == "code":
            lang = data.get("language", "")
            code_text = "".join(t["plain_text"] for t in rich)
            lines.append(f"{prefix}```{lang}")
            lines.append(code_text)
            lines.append(f"{prefix}```")
            lines.append("")
        elif btype == "quote":
            for line in text.split("\n"):
                lines.append(f"{prefix}> {line}")
            lines.append("")
        elif btype == "callout":
            icon = ""
            icon_data = data.get("icon")
            if icon_data:
                if icon_data.get("type") == "emoji":
                    icon = icon_data["emoji"] + " "
            lines.append(f"{prefix}> {icon}{text}")
            lines.append("")
        elif btype == "divider":
            lines.append(f"{prefix}---")
            lines.append("")
        elif btype == "image":
            img_url = get_image_url(b)
            if img_url:
                minio_url = upload_image_to_minio(img_url)
                caption = rich_text_to_md(data.get("caption", []))
                lines.append(f"{prefix}![{caption}]({minio_url})")
                lines.append("")
            prev_was_image = True
            continue
        elif btype == "bookmark":
            url = data.get("url", "")
            caption = rich_text_to_md(data.get("caption", []))
            lines.append(f"{prefix}[{caption or url}]({url})")
            lines.append("")
        elif btype == "embed":
            url = data.get("url", "")
            lines.append(f"{prefix}[{url}]({url})")
            lines.append("")
        elif btype == "video":
            video = data
            if video.get("type") == "external":
                url = video["external"]["url"]
                lines.append(f"{prefix}[Video]({url})")
                lines.append("")
        elif btype == "table":
            if children:
                lines.extend(table_to_markdown(children))
                lines.append("")
        elif btype == "column_list":
            if children:
                for col in children:
                    col_children = col.get("_children", [])
                    if col_children:
                        lines.append(blocks_to_markdown(col_children, indent))
        elif btype == "synced_block":
            if children:
                lines.append(blocks_to_markdown(children, indent))
        else:
            if text:
                lines.append(f"{prefix}{text}")
                lines.append("")

        # 이미지 뒤 캡션 스킵용 플래그 리셋
        if btype != "image":
            prev_was_image = False

        # 번호 리스트가 끝나면 리셋
        if btype != "numbered_list_item":
            numbered_idx = 0

    return "\n".join(lines)

def table_to_markdown(rows):
    lines = []
    for i, row in enumerate(rows):
        cells = row.get("table_row", {}).get("cells", [])
        cell_texts = [rich_text_to_md(cell) for cell in cells]
        lines.append("| " + " | ".join(cell_texts) + " |")
        if i == 0:
            lines.append("| " + " | ".join(["---"] * len(cell_texts)) + " |")
    return lines

# ─── 블로그 API ──────────────────────────────────────────
def blog_headers():
    return {
        "Authorization": f"Bearer {BLOG_TOKEN}",
        "Content-Type": "application/json",
    }

def ensure_category(name, slug):
    """카테고리 없으면 생성, 있으면 ID 반환"""
    r = requests.get(f"{BLOG_API}/categories", headers=blog_headers())
    cats = r.json().get("data", [])
    for c in cats:
        if c["slug"] == slug:
            return c["id"]
    # 생성
    r = requests.post(f"{BLOG_API}/categories", headers=blog_headers(),
                      json={"name": name, "slug": slug})
    if r.status_code in (200, 201):
        return r.json()["data"]["id"]
    print(f"  ⚠️ 카테고리 생성 실패: {r.text}")
    return None

def ensure_tag(name):
    """태그 없으면 생성"""
    r = requests.get(f"{BLOG_API}/tags", headers=blog_headers())
    tags = r.json().get("data", [])
    for t in tags:
        if t["name"] == name:
            return t["id"]
    r = requests.post(f"{BLOG_API}/tags", headers=blog_headers(),
                      json={"name": name})
    if r.status_code in (200, 201):
        return r.json()["data"]["id"]
    return None

def create_post(title, content, category_id, tag_ids=None, cover_image=None):
    slug = slugify(title)
    excerpt = content[:200].replace("\n", " ").strip()
    body = {
        "title": title,
        "slug": slug,
        "content": content,
        "excerpt": excerpt,
        "categoryId": category_id,
        "tagIds": tag_ids or [],
        "status": "PUBLISHED",
        "featured": False,
        "source": "MARKDOWN_IMPORT",
        "originalFilename": f"notion-{slug}.md",
    }
    if cover_image:
        body["coverImage"] = cover_image
    r = requests.post(f"{BLOG_API}/posts", headers=blog_headers(), json=body)
    if r.status_code in (200, 201):
        post_id = r.json()["data"]["id"]
        print(f"  ✅ 포스트 생성: {title} (id={post_id})")
        return post_id
    else:
        print(f"  ❌ 포스트 생성 실패: {r.status_code} {r.text[:200]}")
        return None

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[가-힣]+', lambda m: urllib.parse.quote(m.group()), text)
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text[:80] or f"post-{int(time.time())}"

# ─── Source enum 추가 필요 체크 ──────────────────────────
def check_notion_source_enum():
    """Post.Source에 NOTION_IMPORT가 없으면 MARKDOWN_IMPORT 사용"""
    pass

# ─── 메인 실행 ──────────────────────────────────────────
def main():
    if not BLOG_TOKEN:
        print("❌ BLOG_TOKEN 환경변수 필요 (JWT access token)")
        print("   브라우저 localStorage에서 accessToken 복사 후:")
        print("   BLOG_TOKEN=eyJ... python3 scripts/notion-import.py")
        sys.exit(1)

    print(f"📖 Notion 페이지 로드: {NOTION_PAGE_ID}")
    blocks = get_all_blocks(NOTION_PAGE_ID)

    # 하위 페이지 수집
    pages = [(b["id"], b["child_page"]["title"]) for b in blocks if b["type"] == "child_page"]
    print(f"📄 발견된 글: {len(pages)}개\n")

    # 카테고리 생성 (Notion에서 온 글 → "개발일지" 카테고리)
    cat_id = ensure_category("개발 이야기", "dev-story")
    if not cat_id:
        print("❌ 카테고리 생성 실패")
        sys.exit(1)

    success, fail = 0, 0
    for page_id, title in pages:
        print(f"\n{'='*60}")
        print(f"📝 {title}")
        print(f"{'='*60}")

        try:
            # 페이지 메타데이터
            page_meta = notion_get(f"/pages/{page_id}")
            props = page_meta.get("properties", {})

            # 태그 수집
            tag_ids = []
            tags_prop = props.get("태그", {})
            if tags_prop.get("type") == "multi_select":
                for tag in tags_prop["multi_select"]:
                    tid = ensure_tag(tag["name"])
                    if tid:
                        tag_ids.append(tid)

            # 커버 이미지
            cover = page_meta.get("cover")
            cover_url = None
            if cover:
                if cover.get("type") == "file":
                    cover_url = upload_image_to_minio(cover["file"]["url"])
                elif cover.get("type") == "external":
                    cover_url = upload_image_to_minio(cover["external"]["url"])

            # 블록 → 마크다운
            page_blocks = get_all_blocks(page_id)
            markdown = blocks_to_markdown(page_blocks)

            if not markdown.strip():
                print("  ⏭️ 빈 페이지, 스킵")
                continue

            # 포스트 생성
            post_id = create_post(title, markdown, cat_id, tag_ids, cover_url)
            if post_id:
                success += 1
            else:
                fail += 1

            # Notion API rate limit 존중
            time.sleep(0.5)

        except Exception as e:
            print(f"  ❌ 에러: {e}")
            fail += 1

    print(f"\n{'='*60}")
    print(f"🎉 완료! 성공: {success} / 실패: {fail} / 총: {len(pages)}")

if __name__ == "__main__":
    main()
