'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'react-use';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { GraphData, GraphNode } from '@/types/api';

// This is required because react-force-graph-2d doesn't support SSR well
// It must be dynamically imported by the parent with ssr: false

interface VaultGraphViewProps {
  graphData: GraphData;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
}

export function VaultGraphView({ graphData, activeNodeSlug, onNodeClick }: VaultGraphViewProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  // Parse strings into objects if needed by force-graph
  const gData = useMemo(() => {
    return {
      nodes: graphData.nodes.map(n => ({ ...n, val: n.size * 2 })),
      links: graphData.links.map(l => ({ ...l })),
    };
  }, [graphData]);

  // Center on active node on mount or change
  useEffect(() => {
    if (activeNodeSlug && fgRef.current && gData.nodes.length > 0) {
      const activeNode = gData.nodes.find(n => n.slug === activeNodeSlug) as unknown as NodeObject;
      if (activeNode && activeNode.x && activeNode.y) {
        fgRef.current.centerAt(activeNode.x, activeNode.y, 1000);
        fgRef.current.zoom(1.5, 1000);
      }
    }
  }, [activeNodeSlug, gData]);

  const handleNodeClick = (node: NodeObject) => {
    const gn = node as unknown as GraphNode;
    if (onNodeClick) {
      onNodeClick(gn.slug);
    } else {
      router.push(`/vault/${gn.slug}`);
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
        nodeLabel="name"
        nodeColor={(node: any) => {
          const isActive = activeNodeSlug === node.slug;
          const isHover = hoverNode?.id === node.id;
          return isActive ? '#64C8FF' : isHover ? '#ffffff' : '#475569'; // accent-light, white, surface-600
        }}
        nodeRelSize={4}
        linkWidth={link =>
          hoverNode && (link.source === hoverNode.id || link.target === hoverNode.id) ? 2 : 1
        }
        linkColor={link =>
          hoverNode && (link.source === hoverNode.id || link.target === hoverNode.id)
            ? 'rgba(100, 200, 255, 0.4)'
            : 'rgba(255, 255, 255, 0.05)'
        }
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={link => {
          // Accelerate particles when interacting for neuron firing effect
          return hoverNode && (link.source === hoverNode.id || link.target === hoverNode.id)
            ? 2.5
            : 1;
        }}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => 'rgba(100, 200, 255, 0.8)'}
        onNodeHover={node => setHoverNode((node as GraphNode) || null)}
        onNodeClick={handleNodeClick}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={100}
        // Custom Node Rendering for Glow Effect
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          const isActive = activeNodeSlug === node.slug;
          const isHover = hoverNode?.id === node.id;

          const radius = Math.sqrt(node.val || 1) * 2;

          // Outer Glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + (isActive || isHover ? 4 : 2), 0, 2 * Math.PI, false);
          ctx.fillStyle = isActive
            ? 'rgba(100, 200, 255, 0.2)'
            : isHover
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(71, 85, 105, 0.1)';
          ctx.fill();

          // Inner Core
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = isActive ? '#64C8FF' : isHover ? '#ffffff' : '#94a3b8'; // accent-light, white, surface-400

          // SF Shadow Glow
          ctx.shadowBlur = isActive || isHover ? 15 : 5;
          ctx.shadowColor = isActive ? '#64C8FF' : '#ffffff';
          ctx.fill();

          // Reset shadow for text
          ctx.shadowBlur = 0;

          // Label
          if (globalScale > 1.2 || isActive || isHover) {
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle =
              isActive || isHover ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(label, node.x, node.y + radius + fontSize);
          }
        }}
        backgroundColor="transparent"
      />
    </div>
  );
}
