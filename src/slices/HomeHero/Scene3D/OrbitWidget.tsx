'use client';
import { useRef, useCallback, useEffect } from 'react';

interface OrbitWidgetProps {
  rotationRef: React.MutableRefObject<[number, number, number]>;
  displayRotationRef: React.MutableRefObject<[number, number, number]>;
  isDraggingRef: React.MutableRefObject<boolean>;
}

export default function OrbitWidget({ rotationRef, displayRotationRef, isDraggingRef }: OrbitWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const springBack = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = (e.clientX - lastPos.current.x) * 0.01;
    const dy = (e.clientY - lastPos.current.y) * 0.01;
    lastPos.current = { x: e.clientX, y: e.clientY };
    rotationRef.current = [
      rotationRef.current[0] + dy,
      rotationRef.current[1] + dx,
      rotationRef.current[2],
    ];
  }, [rotationRef]);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    // Spring back to [0,0,0]
    const animate = () => {
      const [x, y, z] = rotationRef.current;
      if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001 && Math.abs(z) < 0.001) {
        rotationRef.current = [0, 0, 0];
        springBack.current = null;
        return;
      }
      rotationRef.current = [x * 0.92, y * 0.92, z * 0.92];
      springBack.current = requestAnimationFrame(animate);
    };
    if (springBack.current) cancelAnimationFrame(springBack.current);
    springBack.current = requestAnimationFrame(animate);
  }, [rotationRef, isDraggingRef]);

  useEffect(() => {
    const axisData = [
      { id: 'x', x3: [1, 0, 0] },
      { id: 'y', x3: [0, 1, 0] },
      { id: 'z', x3: [0, 0, 1] },
    ];
    const R = 36;

    const sync = () => {
      const [rx, ry] = rotationRef.current;
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);

      // Update values text from display rotation (follows hover)
      if (valuesRef.current) {
        const [dx, dy, dz] = displayRotationRef.current;
        const spans = valuesRef.current.querySelectorAll('span');
        spans[0].textContent = dx.toFixed(2);
        spans[1].textContent = dy.toFixed(2);
        spans[2].textContent = dz.toFixed(2);
      }

      if (svgRef.current) {
        for (const { id, x3 } of axisData) {
          const ry1 = x3[0] * cosY + x3[2] * sinY;
          const ry2 = x3[1];
          const ry3 = -x3[0] * sinY + x3[2] * cosY;
          const px = ry1 * R;
          const py = -(ry2 * cosX - ry3 * sinX) * R;
          const pz = ry2 * sinX + ry3 * cosX;
          const opacity = 0.4 + 0.6 * ((pz + 1) / 2);

          const g = svgRef.current.getElementById(`axis-${id}`);
          if (!g) continue;
          g.setAttribute('opacity', String(opacity));
          const line = g.querySelector('line')!;
          line.setAttribute('x2', String(px));
          line.setAttribute('y2', String(py));
          const circles = g.querySelectorAll('circle');
          circles[0].setAttribute('cx', String(px * 1.17));
          circles[0].setAttribute('cy', String(py * 1.17));
          circles[1].setAttribute('cx', String(-px * 1.17));
          circles[1].setAttribute('cy', String(-py * 1.17));
          const texts = g.querySelectorAll('text');
          texts[0].setAttribute('x', String(px * 1.17));
          texts[0].setAttribute('y', String(py * 1.17 + 3.5));
          texts[1].setAttribute('x', String(-px * 1.17));
          texts[1].setAttribute('y', String(-py * 1.17 + 3));
        }
      }

      syncRef.current = requestAnimationFrame(sync);
    };
    syncRef.current = requestAnimationFrame(sync);
    return () => {
      if (springBack.current) cancelAnimationFrame(springBack.current);
      if (syncRef.current) cancelAnimationFrame(syncRef.current);
    };
  }, []);

  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-center gap-3 z-10 select-none pointer-events-none">
      {/* Rotation values */}
      <div ref={valuesRef} className="flex items-center gap-3 text-[11px] font-mono text-white/50 tracking-wider">
        <div className="w-3 h-3 rounded-full bg-white/20" />
        <span>0.00</span>
        <span>0.00</span>
        <span>0.00</span>
      </div>

      {/* Orbit ring */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative w-28 h-28 cursor-grab active:cursor-grabbing pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <svg ref={svgRef} width="112" height="112" viewBox="-56 -56 112 112">
          <circle cx="0" cy="0" r="50" fill="none" stroke="white" strokeWidth="1" opacity="0.15" />
          <circle cx="0" cy="0" r="36" fill="none" stroke="white" strokeWidth="1" opacity="0.25" />

          <g id="axis-x">
            <line x1="0" y1="0" x2="36" y2="0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <circle cx="42" cy="0" r="8" fill="#ef4444" />
            <circle cx="-42" cy="0" r="6" fill="white" fillOpacity="0.1" />
            <text x="42" y="3.5" fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">X</text>
            <text x="-42" y="3" fill="white" fillOpacity="0.3" fontSize="7" fontFamily="monospace" textAnchor="middle">-X</text>
          </g>
          <g id="axis-y">
            <line x1="0" y1="0" x2="0" y2="-36" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-42" r="8" fill="#22c55e" />
            <circle cx="0" cy="42" r="6" fill="white" fillOpacity="0.1" />
            <text x="0" y="-38.5" fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Y</text>
            <text x="0" y="45" fill="white" fillOpacity="0.3" fontSize="7" fontFamily="monospace" textAnchor="middle">-Y</text>
          </g>
          <g id="axis-z">
            <line x1="0" y1="0" x2="0" y2="0" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="8" fill="#3b82f6" />
            <circle cx="0" cy="0" r="6" fill="white" fillOpacity="0.1" />
            <text x="0" y="3.5" fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Z</text>
            <text x="0" y="3" fill="white" fillOpacity="0.3" fontSize="7" fontFamily="monospace" textAnchor="middle">-Z</text>
          </g>

          <circle cx="0" cy="0" r="3" fill="white" opacity="0.4" />
        </svg>
      </div>

    </div>
  );
}
