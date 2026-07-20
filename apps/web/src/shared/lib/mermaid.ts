/**
 * Mermaid가 측정한 노드 박스가 실제 렌더된 텍스트보다 작아 잘리는 경우,
 * SVG를 화면 밖에 잠시 마운트해 각 노드 라벨의 실제 크기를 재고 박스를 키움.
 * (Pretendard 같은 웹폰트는 Mermaid 측정 폰트와 미세하게 달라 잘림이 생긴다)
 */
export function fitNodesToText(rawSvg: string): string {
  if (typeof document === 'undefined') return rawSvg;

  const tmp = document.createElement('div');
  tmp.className = 'mermaid-diagram';
  tmp.style.cssText = 'position:absolute; left:-99999px; top:0; visibility:hidden; width:auto;';
  tmp.innerHTML = rawSvg;
  document.body.appendChild(tmp);

  try {
    const svg = tmp.querySelector('svg');
    if (!svg) return rawSvg;

    // 텍스트 주위에 항상 확보할 최소 여백(상하/좌우 합산 px)
    const VPAD = 18;
    const HPAD = 24;

    svg.querySelectorAll<SVGGElement>('g.node').forEach(node => {
      const fo = node.querySelector('foreignObject');
      const label = fo?.firstElementChild as HTMLElement | null;
      if (!fo || !label) return;

      // 원통(path)·다이아몬드(polygon)·원(circle/ellipse) 등 곡선 모양이 있는 노드는
      // 통째로 건드리지 않는다. 이런 노드는 라벨 배경용 작은 <rect>를 내부에 갖고 있어
      // 그걸 잘못 키우면 작은 네모가 텍스트 위에 나타난다. 폰트 로드 후 Mermaid 측정이
      // 정확해지면 곡선 노드는 자체적으로 알맞게 그려짐.
      if (node.querySelector('path, polygon, ellipse, circle')) return;

      // 순수 사각형(rect) 노드만 텍스트에 맞춰 정확히 조정함.
      const rect = node.querySelector<SVGRectElement>('rect');
      if (!rect) return;

      // 실제 콘텐츠 크기 (transform/scale 영향 없는 레이아웃 픽셀)
      const needH = label.scrollHeight;
      const needW = label.scrollWidth;
      const foH = fo.height.baseVal.value;
      const foW = fo.width.baseVal.value;

      // 넘칠 때뿐 아니라, 빠듯할 때도 최소 여백을 확보하도록 목표 크기를 계산
      const dh = needH + VPAD > foH ? needH + VPAD - foH : 0;
      const dw = needW + HPAD > foW ? needW + HPAD - foW : 0;
      if (dh === 0 && dw === 0) return;

      if (dh > 0) {
        fo.setAttribute('height', String(foH + dh));
        fo.setAttribute('y', String(fo.y.baseVal.value - dh / 2));
        rect.setAttribute('height', String(rect.height.baseVal.value + dh));
        rect.setAttribute('y', String(rect.y.baseVal.value - dh / 2));
      }
      if (dw > 0) {
        fo.setAttribute('width', String(foW + dw));
        fo.setAttribute('x', String(fo.x.baseVal.value - dw / 2));
        rect.setAttribute('width', String(rect.width.baseVal.value + dw));
        rect.setAttribute('x', String(rect.x.baseVal.value - dw / 2));
      }
    });

    // 노드를 키운 만큼 SVG viewBox를 전체 콘텐츠에 맞춰 다시 잡음.
    // (안 하면 커진 노드가 기존 viewBox 밖으로 나가 잘려 보임.
    //  width:100% · height:auto CSS가 새 viewBox 비율대로 스케일을 맞춘다)
    try {
      const bbox = svg.getBBox();
      const m = 8;
      svg.setAttribute(
        'viewBox',
        `${bbox.x - m} ${bbox.y - m} ${bbox.width + m * 2} ${bbox.height + m * 2}`
      );
    } catch {
      /* getBBox 실패 시 원본 viewBox 유지 */
    }

    return tmp.innerHTML;
  } catch {
    return rawSvg;
  } finally {
    document.body.removeChild(tmp);
  }
}

/**
 * mermaid 모듈을 동적 로드하고 블로그 테마에 맞춰 초기화한 뒤 인스턴스를 돌려줌.
 */
export async function loadMermaid(theme: 'light' | 'dark') {
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: theme === 'dark' ? 'dark' : 'default',
    fontFamily:
      'Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    flowchart: {
      htmlLabels: true,
      useMaxWidth: true,
      padding: 12,
      wrappingWidth: 260,
    },
  });
  return mermaid;
}

/**
 * 폰트가 로드된 뒤 렌더해야 Mermaid가 노드 크기를 정확히 측정함.
 * (폴백 폰트로 측정하면 텍스트가 박스를 넘어 잘릴 수 있음)
 */
export async function ensureMermaidFonts() {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.load('400 16px "Pretendard Variable"');
      await document.fonts.ready;
    } catch {
      /* 폰트 로드 실패 시 그대로 진행 */
    }
  }
}

/**
 * Mermaid가 렌더한 SVG를 후처리함.
 * - Mermaid가 주입하는 max-width 제거 (SVG를 자연 크기로 렌더)
 * - 실제 텍스트 크기에 맞춰 노드 박스를 동적으로 키움 (잘림 방지)
 */
export function processMermaidSvg(rawSvg: string): string {
  // Mermaid가 주입한 max-width를 제거해 SVG가 원래 크기로 렌더되게 함
  const processed = rawSvg.replace(/max-width\s*:\s*[\d.]+px\s*;?\s*/g, '');
  return fitNodesToText(processed);
}
