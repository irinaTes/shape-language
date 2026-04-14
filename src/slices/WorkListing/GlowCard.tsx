"use client";

import { useRef, useCallback, useEffect } from "react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

const TRAIL_LENGTH = 50;   // number of points kept
const LINE_WIDTH   = 2;    // px
const FADE_SPEED   = 0.03; // opacity drained per frame when idle

export default function GlowCard({ children, className }: GlowCardProps) {
  const cardRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const trailRef   = useRef<{ x: number; y: number }[]>([]);
  const alphaRef   = useRef(0);        // master opacity, fades out on idle
  const rafRef     = useRef<number>(0);
  const activeRef  = useRef(false);    // is mouse inside?

  // Resize canvas to match card
  useEffect(() => {
    const canvas = canvasRef.current;
    const card   = cardRef.current;
    if (!canvas || !card) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = card.offsetWidth;
      canvas.height = card.offsetHeight;
    });
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trail = trailRef.current;
    if (trail.length < 2) {
      if (!activeRef.current) return;
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    // Fade out master alpha when mouse has left
    if (!activeRef.current) {
      alphaRef.current = Math.max(0, alphaRef.current - FADE_SPEED);
      if (alphaRef.current === 0) {
        rafRef.current = 0; // reset so next entry can restart the loop
        return;
      }
    }

    // Draw the trail as a single polyline with per-segment opacity
    for (let i = 1; i < trail.length; i++) {
      const t       = i / trail.length;            // 0 = oldest, 1 = newest
      const opacity = t * alphaRef.current;

      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x,     trail[i].y);

      // Glow: wide soft layer + sharp bright core
      ctx.lineWidth   = LINE_WIDTH + (1 - t) * 6;
      ctx.strokeStyle = `rgba(0,245,255,${opacity * 0.15})`;
      ctx.stroke();

      ctx.lineWidth   = LINE_WIDTH * t;
      ctx.strokeStyle = `rgba(0,245,255,${opacity * 0.9})`;
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    trailRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.shift();

    // If re-entering after a full fade, clear stale trail to avoid a jump
    if (!activeRef.current) trailRef.current = [];

    alphaRef.current = 1;
    activeRef.current = true;

    // Start loop if not already running
    if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const handleMouseLeave = useCallback(() => {
    activeRef.current = false;
    // Loop keeps running to fade out — it stops itself when alpha hits 0
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className ?? ""}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      />
      {children}
    </div>
  );
}
