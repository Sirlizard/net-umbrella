import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type Node = { id: string; name: string; count: number };
type Edge = { source: string; target: string; count: number };

const defaultWidth = 520;
const defaultHeight = 360;

function toEdges(edgesObj: Record<string, number>): Edge[] {
  return Object.entries(edgesObj).map(([k, count]) => {
    const [a, b] = k.split('|');
    return { source: a, target: b, count };
  });
}

export const ConnectionGraph: React.FC<{
  nodes: Node[];
  edges: Record<string, number>;
  width?: number;
  height?: number;
  onNodeClick?: (id: string) => void;
  onNodeHover?: (id: string | null, coords?: { x: number; y: number }) => void;
  onEdgeClick?: (source: string, target: string) => void;
}> = ({ nodes, edges: edgesObj, width = defaultWidth, height = defaultHeight, onNodeClick, onNodeHover, onEdgeClick }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
  const svg = d3.select(svgRef.current);
  const css = getComputedStyle(document.documentElement);
  const varBlue = (css.getPropertyValue('--blue') || '#28428c').trim();
  const varBlueDark = (css.getPropertyValue('--blue-dark') || '#1e3366').trim();
  const varPink = (css.getPropertyValue('--pink') || '#f472b6').trim();
  const varText = (css.getPropertyValue('--text') || '#111827').trim();
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const linkData = toEdges(edgesObj);
    const nodeData = nodes.map((n) => ({ ...n }));

    const link = linkGroup
      .selectAll('line')
      .data(linkData)
      .enter()
      .append('line')
      .attr('stroke', varBlue)
      .attr('stroke-opacity', (d: any) => Math.min(0.95, 0.15 + d.count * 0.12))
      .attr('stroke-width', (d: any) => Math.min(10, 1 + d.count));

    const node = nodeGroup
      .selectAll('g')
      .data(nodeData)
      .enter()
      .append('g')
      .attr('cursor', 'pointer');

    node
      .append('circle')
      .attr('r', (d: any) => 6 + Math.min(28, d.count * 6))
      .attr('fill', varPink)
      .attr('stroke', varBlueDark)
      .attr('stroke-width', 2);

    node
      .append('text')
      .attr('x', (_d: any) => 12)
      .attr('y', 4)
      .attr('font-size', 12)
      .attr('fill', varText)
      .text((d: any) => d.name);

    // Interactions: hover and click
    node.on('click', (event: any, d: any) => {
      event.stopPropagation();
      onNodeClick && onNodeClick(d.id);
    });

    node.on('mouseover', (event: any, d: any) => {
      onNodeHover && onNodeHover(d.id, { x: event.clientX, y: event.clientY });
    });

    node.on('mouseout', () => {
      onNodeHover && onNodeHover(null);
    });

    const simulation = d3
      .forceSimulation(nodeData as any)
      .force('link', d3.forceLink(linkData as any).id((d: any) => d.id).distance(60).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => 10 + Math.min(28, d.count * 6)));

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

  // drag
    const drag = d3
      .drag()
      .on('start', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // link interactions
    link.on('click', (event: any, d: any) => {
      // d.source/d.target may be node objects after simulation links are bound
      const s = (d.source && d.source.id) || d.source;
      const t = (d.target && d.target.id) || d.target;
      onEdgeClick && onEdgeClick(s, t);
      event.stopPropagation();
    });

    link.on('mouseover', (event: any, d: any) => {
      // show hover for edge as well
      const s = (d.source && d.source.id) || d.source;
      const t = (d.target && d.target.id) || d.target;
      onNodeHover && onNodeHover(`${s}|${t}`, { x: event.clientX, y: event.clientY });
    });

    link.on('mouseout', () => {
      onNodeHover && onNodeHover(null);
    });

    // zoom/pan
    svg.call(
      d3.zoom().scaleExtent([0.2, 4]).on('zoom', (event: any) => {
        g.attr('transform', event.transform as any);
      }) as any
    );

    return () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }, [nodes, edgesObj, width, height]);

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto rounded"
        style={{ backgroundColor: 'var(--card)' }}
      />
      <div className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
        Drag nodes to rearrange. Scroll to zoom. Node size = times tagged; line thickness = shared events.
      </div>
    </div>
  );
};

export default ConnectionGraph;
