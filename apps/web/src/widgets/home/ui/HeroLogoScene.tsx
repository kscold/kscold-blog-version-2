'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  ACESFilmicToneMapping,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  PointLight,
  Quaternion,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HERO_LOGO_SEGMENTS, HERO_LOGO_VIEWBOX } from '../lib/heroLogoShape';

/** viewBox 120 을 월드 6 단위로 옮긴다. 정적 SVG 크기에 맞출 때 기준이 된다. */
const WORLD_SIZE = 6;
const SCALE = WORLD_SIZE / HERO_LOGO_VIEWBOX;
/** 선 그대로 굵기면 금속 반사가 잘 안 보여서 조금 두껍게 만든다. */
const THICKEN = 1.55;
const MAX_PIXEL_RATIO = 1.75;

interface HeroLogoSceneProps {
  /** 입체 로고를 맞춰 올릴 자리. 정적 로고를 감싼 상자다. */
  anchorRef: RefObject<HTMLDivElement | null>;
  /** 포인터를 따라 기울지 여부. 터치 기기는 끄고 제자리에서만 흔들린다. */
  interactive: boolean;
  onReady: () => void;
  onError: () => void;
  className?: string;
}

/** 로고 선분을 둥근 관으로 바꿔 한 덩어리 형상으로 합친다. 그리기 호출이 한 번으로 끝난다. */
function buildLogoGeometry(): BufferGeometry {
  const up = new Vector3(0, 1, 0);
  const parts: BufferGeometry[] = [];
  const joints = new Map<string, { point: Vector3; radius: number }>();

  for (const segment of HERO_LOGO_SEGMENTS) {
    if (segment.role === 'crystal') continue;
    const [fromDepth, toDepth] = segment.depth ?? [0, 0];
    // SVG 는 아래가 +y 라서 뒤집는다.
    const from = new Vector3(segment.from[0] * SCALE, -segment.from[1] * SCALE, fromDepth);
    const to = new Vector3(segment.to[0] * SCALE, -segment.to[1] * SCALE, toDepth);
    const radius = (segment.width / 2) * SCALE * THICKEN;
    const direction = new Vector3().subVectors(to, from);

    const tube = new CylinderGeometry(radius, radius, direction.length(), 28, 1, true);
    tube.applyQuaternion(new Quaternion().setFromUnitVectors(up, direction.normalize()));
    tube.translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
    parts.push(tube);

    // 선이 만나는 자리마다 구를 하나만 두어 이음매를 둥글게 막는다.
    for (const point of [from, to]) {
      const key = `${point.x.toFixed(3)}:${point.y.toFixed(3)}:${point.z.toFixed(3)}`;
      const joint = joints.get(key);
      if (!joint || joint.radius < radius) joints.set(key, { point, radius });
    }
  }

  for (const { point, radius } of joints.values()) {
    const cap = new SphereGeometry(radius, 28, 18);
    cap.translate(point.x, point.y, point.z);
    parts.push(cap);
  }

  const merged = mergeGeometries(parts, false);
  parts.forEach(part => part.dispose());
  if (!merged) throw new Error('로고 형상을 합치지 못했습니다.');
  return merged;
}

/**
 * 블로그 로고를 슬레이트 크롬 질감의 입체로 그린다.
 *
 * 투과(transmission) 유리는 투명 캔버스 위에서 배경을 못 읽어 검게 뜨고 한 번 더 그려야 해서
 * 무겁다. 대신 금속 반사와 무지갯빛 코팅으로 유리처럼 빛나는 느낌을 낸다.
 */
export default function HeroLogoScene({
  anchorRef,
  interactive,
  onReady,
  onError,
  className,
}: HeroLogoSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 콜백이 바뀌어도 장면을 다시 만들지 않도록 최신 값만 잡아둔다.
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      callbacks.current.onError();
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    const camera = new PerspectiveCamera(26, 1, 0.1, 200);

    const geometry = buildLogoGeometry();
    const material = new MeshPhysicalMaterial({
      color: new Color('#64748b'),
      metalness: 1,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      iridescence: 0.38,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [220, 520],
      envMapIntensity: 1.15,
    });
    const logo = new Mesh(geometry, material);
    const pivot = new Group();
    pivot.add(logo);
    scene.add(pivot);

    // 흰 빛으로 형태를 잡고, 블로그 포인트색(스카이·시안)으로 가장자리에 반사를 얹는다.
    const key = new DirectionalLight('#ffffff', 1.4);
    key.position.set(3, 5, 6);
    const sky = new PointLight('#38bdf8', 48);
    sky.position.set(-4, 2.5, 3.5);
    const cyan = new PointLight('#22d3ee', 26);
    cyan.position.set(4.5, -2.5, 2.5);
    scene.add(key, sky, cyan);

    const base = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let scrollProgress = 0;

    const fit = () => {
      const bounds = container.getBoundingClientRect();
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor || anchor.width === 0 || bounds.width === 0 || bounds.height === 0) return;

      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;

      // 정적 로고 상자의 픽셀 크기와 입체 로고의 화면 크기를 똑같이 맞춘다.
      const pixelsPerUnit = anchor.width / WORLD_SIZE;
      const visibleHeight = bounds.height / pixelsPerUnit;
      camera.position.set(0, 0, visibleHeight / 2 / Math.tan((camera.fov * Math.PI) / 360));
      camera.updateProjectionMatrix();

      const centerX = anchor.left + anchor.width / 2 - bounds.left;
      const centerY = anchor.top + anchor.height / 2 - bounds.top;
      base.x = (centerX - bounds.width / 2) / pixelsPerUnit;
      base.y = -(centerY - bounds.height / 2) / pixelsPerUnit;
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      target.y = x * 1.3;
      target.x = y * 0.8;
      // 포인터 쪽으로 스카이 빛을 옮겨, 움직일 때 반사가 표면을 따라 흐르게 한다.
      sky.position.x = -4 + x * 9;
      sky.position.y = 2.5 - y * 6;
    };

    const onScroll = () => {
      const height = container.getBoundingClientRect().height || 1;
      scrollProgress = Math.min(Math.max(window.scrollY / height, 0), 1);
    };

    let frame = 0;
    let readyFired = false;
    let visible = true;
    const started = performance.now();

    const step = (now: number) => {
      const time = (now - started) / 1000;
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      pivot.position.set(base.x, base.y + Math.sin(time * 0.9) * 0.06, 0);
      pivot.rotation.x = current.x + Math.sin(time * 0.45) * 0.05 + scrollProgress * 0.35;
      pivot.rotation.y = current.y + Math.sin(time * 0.5) * 0.18;
      pivot.rotation.z = -scrollProgress * 0.5;
      pivot.scale.setScalar(1 - scrollProgress * 0.14);

      renderer.render(scene, camera);
      if (!readyFired) {
        readyFired = true;
        callbacks.current.onReady();
      }
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      step(now);
    };
    const start = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // 화면 밖이거나 탭이 가려지면 그리기를 멈춘다.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    });
    visibility.observe(container);
    const onVisibilityChange = () => (document.hidden ? stop() : start());

    const resize = new ResizeObserver(fit);
    resize.observe(container);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      callbacks.current.onError();
    };

    fit();
    onScroll();
    if (interactive) window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    canvas.addEventListener('webglcontextlost', onContextLost);
    start();

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      geometry.dispose();
      material.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [anchorRef, interactive]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
