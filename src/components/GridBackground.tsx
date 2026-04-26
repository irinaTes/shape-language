"use client";

export default function GridBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(0,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--cyber-cyan), transparent)",
          opacity: 0.35,
          pointerEvents: "none",
          zIndex: 1,
          animation: "scan 9s linear infinite",
          willChange: "transform",
        }}
      />
      <style>{`
        @keyframes scan {
          0%   { transform: translateY(-2vh); }
          100% { transform: translateY(102vh); }
        }
      `}</style>
    </>
  );
}
