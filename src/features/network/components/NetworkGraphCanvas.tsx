import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { NetworkNode, NetworkEdge } from '../../../services/api/network.api';

interface GraphNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  borderColor: string;
}

interface NetworkGraphCanvasProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  height?: string | number;
}

export const NetworkGraphCanvas: React.FC<NetworkGraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  height = '560px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan and zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hoveredNodeIdRef = useRef<string | null>(null);
  hoveredNodeIdRef.current = hoveredNodeId;

  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<'pan' | 'node' | null>(null);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedSignificantlyRef = useRef(false);

  // Filter or limit nodes to prevent lag if thousands of nodes
  const displayNodes = useMemo(() => {
    if (nodes.length <= 150) return nodes;

    // Prioritize: founder, selected, researched, companies, and top connected
    const priority = new Set<string>();
    priority.add('bhanu-root');
    if (selectedNodeId) {
      priority.add(selectedNodeId);
      if (selectedNodeId !== 'bhanu-root') {
        edges.forEach(e => {
          if (e.source === selectedNodeId) priority.add(e.target);
          if (e.target === selectedNodeId) priority.add(e.source);
        });
      }
    }

    // Add researched nodes
    nodes.filter(n => n.hasResearch).slice(0, 40).forEach(n => priority.add(n.id));

    // Fill up to 120 nodes
    const result: NetworkNode[] = [];
    nodes.forEach(n => {
      if (priority.has(n.id) || result.length < 120) {
        result.push(n);
      }
    });
    return result;
  }, [nodes, edges, selectedNodeId]);

  const displayNodeIds = useMemo(() => new Set(displayNodes.map(n => n.id)), [displayNodes]);

  const displayEdges = useMemo(() => {
    return edges.filter(e => displayNodeIds.has(e.source) && displayNodeIds.has(e.target));
  }, [edges, displayNodeIds]);

  // Internal mutable simulation nodes
  const simNodesRef = useRef<Map<string, GraphNode>>(new Map());

  // Initialize node layout and physics properties
  useEffect(() => {
    const existingMap = simNodesRef.current;
    const newMap = new Map<string, GraphNode>();

    const total = displayNodes.length;
    const ringRadius = Math.max(180, Math.min(360, total * 4));

    displayNodes.forEach((node, i) => {
      const isFounder = node.id === 'bhanu-root';
      const isCompany = node.type === 'COMPANY';
      const isResearched = node.hasResearch;

      let radius = 16;
      let color = '#3B82F6';
      let borderColor = '#1D4ED8';

      if (isFounder) {
        radius = 28;
        color = '#6366F1';
        borderColor = '#4338CA';
      } else if (isCompany) {
        radius = 20;
        color = '#0284C7';
        borderColor = '#0369A1';
      } else if (isResearched) {
        radius = 18;
        color = '#2563EB';
        borderColor = '#1E40AF';
      } else {
        radius = 14;
        color = '#64748B';
        borderColor = '#475569';
      }

      // Keep existing position or arrange in circular/radial cluster
      const existing = existingMap.get(node.id);
      let x = existing ? existing.x : 0;
      let y = existing ? existing.y : 0;

      if (!existing) {
        if (isFounder) {
          x = 0;
          y = 0;
        } else {
          const angle = (i / (total || 1)) * 2 * Math.PI;
          const dist = isCompany ? ringRadius * 0.65 : ringRadius * (0.85 + (i % 3) * 0.15);
          x = Math.cos(angle) * dist + (Math.random() - 0.5) * 40;
          y = Math.sin(angle) * dist + (Math.random() - 0.5) * 40;
        }
      }

      newMap.set(node.id, {
        ...node,
        x,
        y,
        vx: 0,
        vy: 0,
        radius,
        color,
        borderColor
      });
    });

    simNodesRef.current = newMap;
  }, [displayNodes]);

  // Center view on initial mount or when selectedNode changes
  const centerView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    let targetX = 0;
    let targetY = 0;

    if (selectedNodeId) {
      const target = simNodesRef.current.get(selectedNodeId);
      if (target) {
        targetX = target.x;
        targetY = target.y;
      }
    }

    setTransform({
      x: clientWidth / 2 - targetX,
      y: clientHeight / 2 - targetY,
      scale: 1
    });
  }, [selectedNodeId]);

  useEffect(() => {
    centerView();
  }, [centerView]);

  // Run simulation & Render Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let iteration = 0;

    const tick = () => {
      iteration++;
      const simNodes = simNodesRef.current;
      const nodesArray = Array.from(simNodes.values());

      // Lightweight force-directed simulation step (calms down after ~200 ticks)
      if (iteration < 250) {
        const k = 0.05; // Spring constant
        const repulse = 1800; // Repulsion constant
        const damping = 0.85;

        // 1. Repulsion between node pairs
        for (let i = 0; i < nodesArray.length; i++) {
          const n1 = nodesArray[i];
          for (let j = i + 1; j < nodesArray.length; j++) {
            const n2 = nodesArray[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy || 1;
            const dist = Math.sqrt(distSq);

            if (dist < 350) {
              const force = repulse / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.id !== 'bhanu-root') {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2.id !== 'bhanu-root') {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. Attraction along edges
        displayEdges.forEach(edge => {
          const source = simNodes.get(edge.source);
          const target = simNodes.get(edge.target);
          if (!source || !target) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 120;
          const force = (dist - idealDist) * k;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (source.id !== 'bhanu-root') {
            source.vx += fx;
            source.vy += fy;
          }
          if (target.id !== 'bhanu-root') {
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Centering force towards (0,0)
        nodesArray.forEach(node => {
          if (node.id === 'bhanu-root') {
            node.x = 0;
            node.y = 0;
            return;
          }
          node.vx -= node.x * 0.008;
          node.vy -= node.y * 0.008;

          node.x += node.vx;
          node.y += node.vy;
          node.vx *= damping;
          node.vy *= damping;
        });
      }

      // ==========================================
      // RENDERING CANVAS
      // ==========================================
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render subtle background dot grid
      const { x: tx, y: ty, scale } = transformRef.current;
      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Apply zoom & pan transform
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      // Draw Edges
      const hoveredId = hoveredNodeIdRef.current;
      displayEdges.forEach(edge => {
        const source = simNodes.get(edge.source);
        const target = simNodes.get(edge.target);
        if (!source || !target) return;

        const isHighlighted =
          selectedNodeId === edge.source ||
          selectedNodeId === edge.target ||
          hoveredId === edge.source ||
          hoveredId === edge.target;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isHighlighted) {
          ctx.strokeStyle = '#6366F1';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();

        // If highlighted, draw small relationship label
        if (isHighlighted && edge.label && scale > 0.7) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textWidth = ctx.measureText(edge.label).width;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);

          ctx.fillStyle = '#4F46E5';
          ctx.fillText(edge.label, midX, midY);
        }
      });

      // Draw Nodes
      nodesArray.forEach(node => {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredId === node.id;
        const isFounder = node.id === 'bhanu-root';
        const isCompany = node.type === 'COMPANY';

        ctx.save();
        ctx.translate(node.x, node.y);

        // Highlight ring if selected or hovered
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, node.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(59, 130, 246, 0.15)';
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        if (isCompany) {
          // Rounded Rect for Company
          const s = node.radius * 1.8;
          ctx.roundRect(-s / 2, -s / 2, s, s, 6);
        } else {
          // Circle for Person
          ctx.arc(0, 0, node.radius, 0, 2 * Math.PI);
        }

        ctx.fillStyle = isSelected ? '#1E40AF' : node.color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#3B82F6' : node.borderColor;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Node Icon or Initials inside
        ctx.font = `${Math.round(node.radius * 0.9)}px sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isFounder) {
          ctx.fillText('👑', 0, 0);
        } else if (isCompany) {
          ctx.fillText('🏢', 0, 0);
        } else if (node.hasResearch) {
          ctx.fillText('✓', 0, 0);
        } else {
          const initials = node.label.slice(0, 1).toUpperCase();
          ctx.fillText(initials, 0, 1);
        }

        // Node Label underneath
        if (scale > 0.5 || isSelected || isHovered || isFounder) {
          const labelY = node.radius + 12;
          ctx.font = isSelected || isFounder ? 'bold 11px sans-serif' : '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const text = node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label;
          const textMetrics = ctx.measureText(text);

          const hasSub = Boolean(node.company && !isFounder && !isCompany);
          const subText = hasSub && node.company ? (node.company.length > 18 ? node.company.slice(0, 16) + '…' : node.company) : '';
          
          let maxWidth = textMetrics.width;
          if (hasSub) {
            ctx.font = '9px sans-serif';
            const subMetrics = ctx.measureText(subText);
            if (subMetrics.width > maxWidth) maxWidth = subMetrics.width;
          }

          // White badge background for text readability
          const badgeHeight = hasSub ? 26 : 14;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.fillRect(
            -maxWidth / 2 - 4,
            labelY - 2,
            maxWidth + 8,
            badgeHeight
          );

          ctx.font = isSelected || isFounder ? 'bold 11px sans-serif' : '10px sans-serif';
          ctx.fillStyle = isSelected ? '#1E40AF' : '#1E293B';
          ctx.fillText(text, 0, labelY);

          if (hasSub) {
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText(subText, 0, labelY + 12);
          }
        }

        ctx.restore();
      });

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [displayEdges, selectedNodeId]);

  // Coordinate conversion helpers
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { x: tx, y: ty, scale } = transformRef.current;
    const clientX = screenX - rect.left;
    const clientY = screenY - rect.top;
    return {
      x: (clientX - tx) / scale,
      y: (clientY - ty) / scale
    };
  }, []);

  const getNodeAtPosition = useCallback((worldX: number, worldY: number) => {
    const nodesArray = Array.from(simNodesRef.current.values());
    // Iterate reverse so topmost drawn node is picked
    for (let i = nodesArray.length - 1; i >= 0; i--) {
      const node = nodesArray[i];
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      const hitRadius = node.radius + 6;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return node;
      }
    }
    return null;
  }, []);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    hasMovedSignificantlyRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };

    const world = screenToWorld(e.clientX, e.clientY);
    const hitNode = getNodeAtPosition(world.x, world.y);

    if (hitNode) {
      dragModeRef.current = 'node';
      draggedNodeRef.current = hitNode;
    } else {
      dragModeRef.current = 'pan';
      draggedNodeRef.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedSignificantlyRef.current = true;
      }

      if (dragModeRef.current === 'pan') {
        setTransform(prev => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy
        }));
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      } else if (dragModeRef.current === 'node' && draggedNodeRef.current) {
        draggedNodeRef.current.x = world.x;
        draggedNodeRef.current.y = world.y;
        draggedNodeRef.current.vx = 0;
        draggedNodeRef.current.vy = 0;
      }
    } else {
      // Hover check
      const hitNode = getNodeAtPosition(world.x, world.y);
      setHoveredNodeId(hitNode ? hitNode.id : null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current && !hasMovedSignificantlyRef.current) {
      const world = screenToWorld(e.clientX, e.clientY);
      const hitNode = getNodeAtPosition(world.x, world.y);
      if (hitNode) {
        onSelectNode(hitNode.id);
      }
    }

    isDraggingRef.current = false;
    dragModeRef.current = null;
    draggedNodeRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => {
      const nextScale = Math.max(0.25, Math.min(3.5, prev.scale * zoomFactor));
      const nextX = mouseX - (mouseX - prev.x) * (nextScale / prev.scale);
      const nextY = mouseY - (mouseY - prev.y) * (nextScale / prev.scale);
      return { x: nextX, y: nextY, scale: nextScale };
    });
  };

  const zoomIn = () => {
    setTransform(prev => {
      const nextScale = Math.min(3.5, prev.scale * 1.25);
      return { ...prev, scale: nextScale };
    });
  };

  const zoomOut = () => {
    setTransform(prev => {
      const nextScale = Math.max(0.25, prev.scale * 0.8);
      return { ...prev, scale: nextScale };
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        background: '#F8FAFC',
        cursor: hoveredNodeId ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'grab'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Interactive Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 5
      }}>
        <button
          type="button"
          onClick={zoomIn}
          title="Zoom In"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#fff',
            border: '1px solid #CBD5E1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '16px',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom Out"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#fff',
            border: '1px solid #CBD5E1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '16px',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={centerView}
          title="Center / Reset View"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#fff',
            border: '1px solid #CBD5E1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ⟲
        </button>
      </div>

      {/* Legend & Stats Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(4px)',
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid #E2E8F0',
        fontSize: '11px',
        color: '#475569',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />
          <span>Founder (Bhanu)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
          <span>Researched</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0284C7' }} />
          <span>Company</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748B' }} />
          <span>Connection</span>
        </div>
        <span style={{ borderLeft: '1px solid #CBD5E1', paddingLeft: '6px', color: '#94A3B8' }}>
          {displayNodes.length} nodes · Drag canvas to pan · Scroll to zoom
        </span>
      </div>
    </div>
  );
};
