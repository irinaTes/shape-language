'use client';

import { useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const TRAIL_LENGTH  = 50;
const LINE_WIDTH    = 2;
const SHRINK_SPEED  = 0.4; // points removed per frame when idle

function CursorTrailInner() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const trailRef   = useRef<{ x: number; y: number }[]>([]);
  const rafRef     = useRef<number>(0);
  const activeRef  = useRef(false);
  const shrinkAcc  = useRef(0);
  const idleTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trail = trailRef.current;

    // When idle, shrink trail from the tail (index 0) towards the cursor (last index)
    if (!activeRef.current) {
      shrinkAcc.current += SHRINK_SPEED;
      const toRemove = Math.floor(shrinkAcc.current);
      shrinkAcc.current -= toRemove;
      trailRef.current = trail.slice(toRemove);

      if (trailRef.current.length === 0) {
        rafRef.current = 0;
        return;
      }
    }

    const pts = trailRef.current;
    if (pts.length < 2) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length; // 0 = tail (oldest), 1 = head (cursor)

      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
      ctx.lineTo(pts[i].x,     pts[i].y);

      // Soft glow layer
      ctx.lineWidth   = LINE_WIDTH + (1 - t) * 6;
      ctx.strokeStyle = `rgba(0,245,255,${t * 0.15})`;
      ctx.stroke();

      // Sharp bright core
      ctx.lineWidth   = LINE_WIDTH * t;
      ctx.strokeStyle = `rgba(0,245,255,${t * 0.9})`;
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!activeRef.current) {
        trailRef.current = [];
        shrinkAcc.current = 0;
      }

      trailRef.current.push({ x: e.clientX, y: e.clientY });
      if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.shift();

      activeRef.current = true;

      // Reset idle timer — retract trail 80ms after cursor stops
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        activeRef.current = false;
        if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
      }, 80);

      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    const onLeave = () => { activeRef.current = false; };
    const onScroll = () => {
      activeRef.current = false;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}

export default dynamic(() => Promise.resolve(CursorTrailInner), { ssr: false });
