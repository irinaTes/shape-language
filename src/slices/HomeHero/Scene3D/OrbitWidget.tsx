'use client';
import { useRef, useCallback, useEffect, useState } from 'react';

interface OrbitWidgetProps {
  rotationRef: React.MutableRefObject<[number, number, number]>;
  isDraggingRef: React.MutableRefObject<boolean>;
}

export default function OrbitWidget({ rotationRef, isDraggingRef }: OrbitWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const springBack = useRef<number | null>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
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
  }, [rotationRef]);

  useEffect(() => {
    const sync = () => {
      setRotation([...rotationRef.current]);
      syncRef.current = requestAnimationFrame(sync);
    };
    syncRef.current = requestAnimationFrame(sync);
    return () => {
      if (springBack.current) cancelAnimationFrame(springBack.current);
      if (syncRef.current) cancelAnimationFrame(syncRef.current);
    };
  }, []);

  // Project 3D axes to 2D based on current rotation
  const [rx, ry] = rotation;
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const r = 36;

  // 3D to 2D projection of each axis unit vector
  const axes = [
    { label: 'X', color: '#ef4444', x3: [1, 0, 0] as const },
    { label: 'Y', color: '#22c55e', x3: [0, 1, 0] as const },
    { label: 'Z', color: '#3b82f6', x3: [0, 0, 1] as const },
  ].map(({ label, color, x3 }) => {
    // Apply Y rotation then X rotation
    const ry1 = x3[0] * cosY + x3[2] * sinY;
    const ry2 = x3[1];
    const ry3 = -x3[0] * sinY + x3[2] * cosY;
    const px = ry1;
    const py = ry2 * cosX - ry3 * sinX;
    const pz = ry2 * sinX + ry3 * cosX;
    return { label, color, x: px * r, y: -py * r, z: pz };
  });

  // Sort by z so further axes render first (painter's algorithm)
  const sorted = [...axes].sort((a, b) => a.z - b.z);

  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-center gap-3 z-10 select-none">
      {/* Rotation values */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-white/50 tracking-wider">
        <div className="w-3 h-3 rounded-full bg-white/20" />
        <span>{rotation[0].toFixed(2)}</span>
        <span>{rotation[1].toFixed(2)}</span>
        <span>{rotation[2].toFixed(2)}</span>
      </div>

      {/* Orbit ring */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative w-28 h-28 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <svg width="112" height="112" viewBox="-56 -56 112 112">
          {/* Outer ring */}
          <circle cx="0" cy="0" r="50" fill="none" stroke="white" strokeWidth="1" opacity="0.15" />
          {/* Inner ring */}
          <circle cx="0" cy="0" r="36" fill="none" stroke="white" strokeWidth="1" opacity="0.25" />

          {sorted.map(({ label, color, x, y, z }) => {
            const opacity = 0.4 + 0.6 * ((z + 1) / 2); // fade if pointing away
            return (
              <g key={label} opacity={opacity}>
                {/* Axis line */}
                <line x1="0" y1="0" x2={x} y2={y} stroke={color} strokeWidth="2" strokeLinecap="round" />
                {/* Axis endpoint */}
                <circle cx={x * 1.17} cy={y * 1.17} r="8" fill={color} />
                <text x={x * 1.17} y={y * 1.17 + 3.5} fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{label}</text>
                {/* Opposite side */}
                <circle cx={-x * 1.17} cy={-y * 1.17} r="6" fill="white" fillOpacity="0.1" />
                <text x={-x * 1.17} y={-y * 1.17 + 3} fill="white" fillOpacity="0.3" fontSize="7" fontFamily="monospace" textAnchor="middle">-{label}</text>
              </g>
            );
          })}

          {/* Center dot */}
          <circle cx="0" cy="0" r="3" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Reset label */}
      <button
        onClick={() => { rotationRef.current = [0, 0, 0]; }}
        className="text-[11px] font-mono text-white/40 tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
      >
        Reset Quaternion
      </button>
    </div>
  );
}
