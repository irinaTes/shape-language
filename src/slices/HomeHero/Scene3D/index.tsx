'use client';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import Logo3D from './Logo3D';
import OrbitWidget from './OrbitWidget';
import MovingLights from './MovingLights';
import { useLoadingContext } from '@/components/PageWithLoading';
// import GlowCard from '@/slices/WorkListing/GlowCard';

function SceneReadyReporter({ onReady }: { onReady: () => void }) {
  const { progress } = useProgress();
  const reported = useRef(false);

  useEffect(() => {
    if (progress === 100 && !reported.current) {
      reported.current = true;
      onReady();
    }
  }, [progress, onReady]);

  return null;
}

type ViewportMode = 'tablet' | 'desktop';

interface Scene3DProps {
  viewportMode: ViewportMode;
}

export default function Scene3D({ viewportMode }: Scene3DProps) {
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const displayRotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const isDraggingRef = useRef(false);
  const loadingContext = useLoadingContext();

  const handleReady = () => {
    loadingContext?.scene3DReady();
  };

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneReadyReporter onReady={handleReady} />
          <Environment preset="city" background={false} />
          <ambientLight intensity={0.4} color="#1a0040" />
          <directionalLight position={[-5, 7, 3]} intensity={10} color="#00f5ff" />
          <directionalLight position={[6, 2, -2]} intensity={8} color="#ff00cc" />
          <directionalLight position={[-1, -2, -7]} intensity={6} color="#9b30ff" />
          <directionalLight position={[0, -7, 4]} intensity={4} color="#00ffaa" />
          <directionalLight position={[4, -4, 5]} intensity={3} color="#ff6600" />
          <directionalLight position={[5, 8, 2]} intensity={5} color="#3366ff" />
          <MovingLights />
          <Logo3D
            rotationRef={rotationRef}
            displayRotationRef={displayRotationRef}
            isDraggingRef={isDraggingRef}
            textMode={viewportMode === 'desktop' ? 'inside-logo' : 'tablet'}
          />
        </Suspense>
      </Canvas>
      <OrbitWidget
        rotationRef={rotationRef}
        displayRotationRef={displayRotationRef}
        isDraggingRef={isDraggingRef}
      />

      {/* View Reel CTA — centred below the 3D logo */}
      {/* <div className="hidden md:block absolute bottom-[8%] left-1/2 -translate-x-1/2 pointer-events-auto">
        <GlowCard className="rounded-full">
          <a
            href="#reel"
            className="flex items-center justify-between gap-34 px-8 py-3 border border-[#1C2029] rounded-full text-[#E6EAF2] no-underline text-[11px] uppercase tracking-[0.18em] transition-all duration-300 min-w-[220px] hover:border-[#00f5ff]/40 hover:shadow-[0_0_18px_2px_rgba(0,245,255,0.15)]"
            style={{ fontFamily: 'var(--font-space-mono)', boxShadow: '0 0 12px 1px rgba(0,245,255,0.08)' }}
          >
            <span>View Reel</span>
            <span className="w-5 h-5 rounded-full border border-[#1C2029] grid place-items-center">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1" />
              </svg>
            </span>
          </a>
        </GlowCard>
      </div> */}
    </div>
  );
}
