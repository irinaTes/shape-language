'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useEnvironment } from '@react-three/drei';
import * as THREE from 'three';
import Logo3D from './Logo3D';
import OrbitWidget from './OrbitWidget';
import MovingLights from './MovingLights';
import { useLoadingContext } from '@/components/PageWithLoading';

// Self-hosted copy of drei's "city" preset (was fetched from raw.githack.com)
const ENV_MAP = '/assets/hdri/potsdamer_platz_1k.hdr';
useEnvironment.preload({ files: ENV_MAP });

// Mounted inside the same Suspense boundary as the scene, so it only runs once
// every asset has resolved. Compiles shaders up front, then reports ready after
// a couple of rendered frames, so the loader hides on a scene that is drawn.
function SceneReadyReporter({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  const compiledRef = useRef(false);
  const framesRef = useRef(0);
  const reportedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) compiledRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  useFrame(() => {
    if (reportedRef.current || !compiledRef.current) return;
    framesRef.current += 1;
    if (framesRef.current >= 2) {
      reportedRef.current = true;
      onReady();
    }
  });

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [tabActive, setTabActive] = useState(true);

  const handleReady = () => {
    loadingContext?.scene3DReady();
  };

  useEffect(() => {
    const onVis = () => setTabActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);

    const el = wrapperRef.current;
    if (!el) return () => document.removeEventListener('visibilitychange', onVis);

    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);

  const isActive = isVisible && tabActive;

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1]}
        performance={{ min: 0.5 }}
        frameloop={isActive ? 'always' : 'never'}
        gl={{
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneReadyReporter onReady={handleReady} />
          <Environment files={ENV_MAP} background={false} />
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
    </div>
  );
}
