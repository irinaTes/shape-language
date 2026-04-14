'use client';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import Logo3D from './Logo3D';
import OrbitWidget from './OrbitWidget';
import MovingLights from './MovingLights';
import { useLoadingContext } from '@/components/PageWithLoading';

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

export default function Scene3D() {
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const displayRotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const isDraggingRef = useRef(false);
  const loadingContext = useLoadingContext();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!hasRegistered.current && loadingContext) {
      loadingContext.register3DScene();
      hasRegistered.current = true;
    }
  }, [loadingContext]);

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
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneReadyReporter onReady={handleReady} />
          <Environment preset="city" background={false} />
          <ambientLight intensity={0.4} color="#1a0040" />
          {/* Directional — cyan key */}
          <directionalLight position={[-5, 7, 3]} intensity={10} color="#00f5ff" />
          {/* Directional — magenta fill */}
          <directionalLight position={[6, 2, -2]} intensity={8} color="#ff00cc" />
          {/* Directional — purple rim */}
          <directionalLight position={[-1, -2, -7]} intensity={6} color="#9b30ff" />
          {/* Directional — teal ground bounce */}
          <directionalLight position={[0, -7, 4]} intensity={4} color="#00ffaa" />
          {/* Directional — orange warm accent */}
          <directionalLight position={[4, -4, 5]} intensity={3} color="#ff6600" />
          {/* Directional — electric blue top */}
          <directionalLight position={[5, 8, 2]} intensity={5} color="#3366ff" />
          <MovingLights />
          <Logo3D rotationRef={rotationRef} displayRotationRef={displayRotationRef} isDraggingRef={isDraggingRef} />
        </Suspense>
      </Canvas>
      <OrbitWidget rotationRef={rotationRef} displayRotationRef={displayRotationRef} isDraggingRef={isDraggingRef} />
    </div>
  );
}
