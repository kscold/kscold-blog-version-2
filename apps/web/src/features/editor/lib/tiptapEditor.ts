// 에디터 설정 퍼블릭 API — 논리 단위별 모듈을 원경로에서 그대로 재노출한다.
//  - tiptapExtensions: 확장 구성 + 마크다운 전처리/읽기
//  - tiptapCommands:   슬래시/툴바에서 호출하는 삽입·업로드 핸들러
//  - tiptapEditorProps: editorProps(붙여넣기·드롭 등) 옵션
export {
  preprocessEditorMarkdown,
  buildEditorExtensions,
  readMarkdown,
} from '@/features/editor/lib/tiptapExtensions';
export {
  promptLinkUrl,
  promptVideoUrl,
  promptVideoUpload,
  promptCodeBlockLanguage,
  promptImageUpload,
  promptImageRowUpload,
} from '@/features/editor/lib/tiptapCommands';
export { buildEditorProps } from '@/features/editor/lib/tiptapEditorProps';
