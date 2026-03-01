'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'react-use';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';
import { GraphData, GraphNode } from '@/types/api';

// This is required because react-force-graph-2d doesn't support SSR well
// It must be dynamically imported by the parent with ssr: false

interface VaultGraphViewProps {
  graphData: any;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
}

export function VaultGraphView({
  graphData,
  activeNodeSlug,
  onNodeClick,
  onFolderClick,
  folderColorMap = {},
}: VaultGraphViewProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  // Parse strings into objects if needed by force-graph
  const gData = useMemo(() => {
    return {
      nodes: graphData.nodes.map((n: any) => ({
        ...n,
        val: n.val ?? (n.size ? n.size * 2 : 4),
      })),
      links: graphData.links.map((l: any) => ({ ...l })),
    };
  }, [graphData]);

  // Configure force simulation for proper spacing
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const nodeCount = gData.nodes.length;

    // Scale forces based on node count
    const chargeStrength = nodeCount > 100 ? -300 : nodeCount > 30 ? -200 : -120;
    const linkDist = nodeCount > 100 ? 120 : nodeCount > 30 ? 100 : 80;

    // Strong repulsion so nodes push away from each other
    fg.d3Force('charge')?.strength(chargeStrength).distanceMax(500);

    // Linked nodes maintain a minimum distance
    fg.d3Force('link')?.distance(linkDist);

    // Collision force prevents overlapping
    fg.d3Force('collision', forceCollide()
      .radius((node: any) => {
        const r = node.isFolder
          ? Math.sqrt(node.val || 10) * 3
          : Math.sqrt(node.val || 1) * 2;
        return r + 15; // padding around each node
      })
      .strength(0.9)
      .iterations(3)
    );

    // Weaken center pull so the graph can spread out
    fg.d3Force('center')?.strength(0.03);

    // Reheat simulation
    fg.d3ReheatSimulation();
  }, [gData]);

  // Center on active node on mount or change
  useEffect(() => {
    if (activeNodeSlug && fgRef.current && gData.nodes.length > 0) {
      const activeNode = gData.nodes.find(
        (n: any) => n.slug === activeNodeSlug
      ) as unknown as NodeObject;
      if (activeNode && activeNode.x && activeNode.y) {
        fgRef.current.centerAt(activeNode.x, activeNode.y, 1000);
        fgRef.current.zoom(1.5, 1000);
      }
    }
  }, [activeNodeSlug, gData]);

  const handleNodeClick = (node: NodeObject) => {
    const gn = node as any;
    if (gn.isFolder && onFolderClick) {
      onFolderClick(gn.id);
    } else if (gn.slug) {
      if (onNodeClick) {
        onNodeClick(gn.slug);
      } else {
        router.push(`/vault/${gn.slug}`);
      }
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[32px] border border-white/5 bg-[#020617] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
      {/* Sci-Fi Decorative Corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent-light/30 rounded-tl-[32px] opacity-50 z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-accent-light/30 rounded-tr-[32px] opacity-50 z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent-light/30 rounded-bl-[32px] opacity-50 z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent-light/30 rounded-br-[32px] opacity-50 z-10 pointer-events-none" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20 z-0" />

      <ForceGraph2D
        ref={fgRef}
        graphData={gData}
        width={width > 0 ? width : 800} // Fallback if useWindowSize is not ready
        height={height > 0 ? height : 600}
        nodeLabel={() => ''}
        nodeColor={(node: any) => {
          return folderColorMap[node.folderId] || '#64C8FF';
        }}
        nodeRelSize={4}
        linkWidth={(link: any) => {
          const isLinked = hoverNode && (
            (typeof link.source === 'object' ? link.source.id : link.source) === hoverNode.id ||
            (typeof link.target === 'object' ? link.target.id : link.target) === hoverNode.id
          );
          return isLinked ? 2.5 : 0.8;
        }}
        linkColor={(link: any) => {
          const isLinked = hoverNode && (
            (typeof link.source === 'object' ? link.source.id : link.source) === hoverNode.id ||
            (typeof link.target === 'object' ? link.target.id : link.target) === hoverNode.id
          );
          return isLinked ? 'rgba(100, 200, 255, 0.5)' : 'rgba(255, 255, 255, 0.04)';
        }}
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={(link: any) => {
          const isLinked = hoverNode && (
            (typeof link.source === 'object' ? link.source.id : link.source) === hoverNode.id ||
            (typeof link.target === 'object' ? link.target.id : link.target) === hoverNode.id
          );
          return isLinked ? 3 : 1.2;
        }}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={(link: any) => {
          const sourceNode = typeof link.source === 'object' ? link.source : null;
          const folderId = sourceNode?.folderId || gData.nodes.find((n: any) => n.id === (typeof link.source === 'string' ? link.source : link.source?.id))?.folderId;
          return folderColorMap[folderId || ''] || '#64C8FF';
        }}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link: any, ctx) => {
          // Draw gradient glow on active links only
          if (!hoverNode) return;
          const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
          if (srcId !== hoverNode.id && tgtId !== hoverNode.id) return;
          const src = link.source;
          const tgt = link.target;
          if (typeof src !== 'object' || typeof tgt !== 'object') return;
          if (src.x == null || src.y == null || tgt.x == null || tgt.y == null) return;
          if (!isFinite(src.x) || !isFinite(src.y) || !isFinite(tgt.x) || !isFinite(tgt.y)) return;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.12)';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.restore();
        }}
        onNodeClick={handleNodeClick}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.2}
        warmupTicks={200}
        cooldownTicks={300}
        // Premium Neuron Cell Rendering
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          // Guard: skip rendering if coordinates aren't ready (warmup phase)
          if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;

          try {
          const label = node.name;
          const isActive = activeNodeSlug === node.slug;
          const isHover = hoverNode?.id === node.id;
          const isFolder = !!node.isFolder;
          const baseColor = folderColorMap[node.folderId] || '#8b5cf6';

          const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
          };
          const { r, g, b } = hexToRgb(baseColor);
          const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

          const radius = isFolder
            ? Math.sqrt(node.val || 10) * 3.5
            : Math.sqrt(node.val || 1) * 2.5;

          const focused = isActive || isHover;
          ctx.save();

          // ── Layer 1: Ambient halo (large, very soft) ──
          const haloRadius = radius * (focused ? 4 : 2.8);
          const halo = ctx.createRadialGradient(node.x, node.y, radius * 0.5, node.x, node.y, haloRadius);
          halo.addColorStop(0, rgba(focused ? 0.18 : 0.08));
          halo.addColorStop(0.5, rgba(focused ? 0.06 : 0.02));
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();

          // ── Layer 2: Cell membrane (outer ring glow) ──
          const membraneWidth = focused ? 1.8 / globalScale : 1 / globalScale;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 1.5 / globalScale, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(focused ? 0.7 : 0.3);
          ctx.lineWidth = membraneWidth;
          ctx.stroke();

          if (isFolder) {
            // ── Folder: Double membrane soma ──
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 3.5 / globalScale, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(0.15);
            ctx.lineWidth = 0.8 / globalScale;
            ctx.stroke();
          }

          // ── Layer 3: Cell body (radial gradient fill) ──
          const bodyGrad = ctx.createRadialGradient(
            node.x - radius * 0.25, node.y - radius * 0.25, radius * 0.1,
            node.x, node.y, radius
          );
          if (isFolder) {
            bodyGrad.addColorStop(0, rgba(0.95));
            bodyGrad.addColorStop(0.4, rgba(0.7));
            bodyGrad.addColorStop(0.8, rgba(0.4));
            bodyGrad.addColorStop(1, rgba(0.15));
          } else {
            bodyGrad.addColorStop(0, focused ? rgba(0.95) : rgba(0.8));
            bodyGrad.addColorStop(0.5, focused ? rgba(0.6) : rgba(0.45));
            bodyGrad.addColorStop(1, focused ? rgba(0.2) : rgba(0.08));
          }
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = bodyGrad;
          ctx.fill();

          // ── Layer 4: Nucleus (bright inner core) ──
          const nucleusRadius = radius * (isFolder ? 0.4 : 0.35);
          const nucleusGrad = ctx.createRadialGradient(
            node.x - nucleusRadius * 0.3, node.y - nucleusRadius * 0.3, 0,
            node.x, node.y, nucleusRadius
          );
          nucleusGrad.addColorStop(0, `rgba(255, 255, 255, ${focused ? 0.9 : 0.6})`);
          nucleusGrad.addColorStop(0.6, rgba(focused ? 0.8 : 0.5));
          nucleusGrad.addColorStop(1, rgba(0.1));
          ctx.beginPath();
          ctx.arc(node.x, node.y, nucleusRadius, 0, Math.PI * 2);
          ctx.fillStyle = nucleusGrad;
          ctx.fill();

          // ── Layer 5: Specular highlight (top-left glint) ──
          const specRadius = radius * 0.2;
          const specX = node.x - radius * 0.3;
          const specY = node.y - radius * 0.3;
          const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specRadius);
          specGrad.addColorStop(0, `rgba(255, 255, 255, ${focused ? 0.7 : 0.35})`);
          specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.beginPath();
          ctx.arc(specX, specY, specRadius, 0, Math.PI * 2);
          ctx.fillStyle = specGrad;
          ctx.fill();

          // ── Folder: inner organelle ring ──
          if (isFolder) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${focused ? 0.25 : 0.12})`;
            ctx.lineWidth = 0.8 / globalScale;
            ctx.setLineDash([3 / globalScale, 3 / globalScale]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.restore();

          // ── Label ──
          const showLabel = isFolder || focused || globalScale > 0.4;
          if (showLabel) {
            // Clamp font size: readable at any zoom level
            const rawSize = isFolder ? 14 / globalScale : 12 / globalScale;
            const labelSize = Math.max(rawSize, isFolder ? 10 : 8);
            const maxLabelSize = isFolder ? 18 : 14;
            const clampedSize = Math.min(labelSize, maxLabelSize);

            ctx.font = `600 ${clampedSize}px "Inter", "SF Pro Display", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Truncate long names
            const maxChars = focused ? 30 : (isFolder ? 20 : 14);
            const displayLabel = label.length > maxChars ? label.slice(0, maxChars - 1) + '\u2026' : label;

            const textMetrics = ctx.measureText(displayLabel);
            const textW = textMetrics.width;
            const textH = clampedSize;
            const padX = 5 / globalScale;
            const padY = 3 / globalScale;
            const textY = node.y + radius + (6 + textH * 0.5) / globalScale;
            const pillR = Math.min(padY + textH * 0.5, 6 / globalScale);

            // Background pill for readability
            const pillX = node.x - textW / 2 - padX;
            const pillY2 = textY - textH / 2 - padY;
            const pillW = textW + padX * 2;
            const pillH = textH + padY * 2;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(pillX, pillY2, pillW, pillH, pillR);
            ctx.fillStyle = focused
              ? 'rgba(0, 0, 0, 0.75)'
              : 'rgba(2, 6, 23, 0.65)';
            ctx.fill();

            if (focused) {
              ctx.strokeStyle = rgba(0.5);
              ctx.lineWidth = 1 / globalScale;
              ctx.stroke();
            }
            ctx.restore();

            // Text
            ctx.fillStyle = focused
              ? 'rgba(255, 255, 255, 0.95)'
              : isFolder
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(displayLabel, node.x, textY);
          }
          } catch { /* suppress Canvas API errors during warmup */ }
        }}
        nodePointerAreaPaint={(node: any, color, ctx, globalScale) => {
          if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;
          const r = node.isFolder
            ? Math.sqrt(node.val || 10) * 3.5
            : Math.sqrt(node.val || 1) * 2.5;
          const hitR = r + 12 / globalScale;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, hitR, 0, Math.PI * 2);
          ctx.fill();
        }}
        onNodeHover={(node) => {
          setHoverNode((node as GraphNode) || null);
          const el = document.querySelector('canvas');
          if (el) el.style.cursor = node ? 'pointer' : 'default';
        }}
        backgroundColor="transparent"
      />
    </div>
  );
}
