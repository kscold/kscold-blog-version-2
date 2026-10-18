import { pdfjs } from 'react-pdf';

// 워커와 폰트 등 모든 런타임 자산은 외부 CDN이 아닌 같은 사이트에서 받는다(scripts/prepare-pdf-assets.cjs가 복사).
const ASSET_BASE = `/pdfjs/${pdfjs.version}`;

export const PDF_DOCUMENT_OPTIONS = {
  cMapUrl: `${ASSET_BASE}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${ASSET_BASE}/standard_fonts/`,
  wasmUrl: `${ASSET_BASE}/wasm/`,
  iccUrl: `${ASSET_BASE}/iccs/`,
  isEvalSupported: false,
  enableXfa: false,
  maxImageSize: 16_000_000,
  canvasMaxAreaInBytes: 16_000_000,
  verbosity: 0,
};

/** PDF를 그리기 전에 한 번 호출한다. 여러 화면에서 불러도 같은 워커 주소로 맞춰진다. */
export function configurePdfWorker() {
  pdfjs.GlobalWorkerOptions.workerSrc = `${ASSET_BASE}/pdf.worker.min.mjs`;
}

/** 큰 화면에서도 캔버스가 브라우저 한도(약 400만 화소)를 넘지 않도록 배율을 낮춘다. */
export function limitedPixelRatio(width: number, height: number) {
  return Math.min(
    window.devicePixelRatio || 1,
    2,
    Math.sqrt(4_000_000 / Math.max(width * height, 1))
  );
}
