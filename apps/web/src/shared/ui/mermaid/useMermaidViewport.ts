'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/** 확대 화면은 브라우저의 스크롤을 써서 터치·휠·키보드로 모두 이동할 수 있게 한다. */
export function useMermaidViewport(svg: string) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number | 'fit'>(1);
  const size = useMemo(() => {
    const values = /viewBox="([^"]+)"/.exec(svg)?.[1].trim().split(/[\s,]+/).map(Number);
    return { width: values?.[2] || 1, height: values?.[3] || 1 };
  }, [svg]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = () => {
      const style = getComputedStyle(element);
      setViewport({
        width: Math.max(1, element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)),
        height: Math.max(1, element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)),
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitScale = Math.min(1, viewport.width / size.width, viewport.height / size.height) || 1;
  const scale = zoom === 'fit' ? fitScale : zoom;
  const minScale = Math.min(0.25, fitScale);
  const changeZoom = (factor: number) => setZoom(Math.min(3, Math.max(minScale, scale * factor)));
  const reset = (value: number | 'fit') => {
    setZoom(value);
    viewportRef.current?.scrollTo({ top: 0, left: 0 });
  };

  return { viewportRef, width: size.width * scale, scale, minScale, changeZoom, reset };
}
