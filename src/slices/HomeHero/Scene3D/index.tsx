'use client';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import Logo3D from './Logo3D';
import OrbitWidget from './OrbitWidget';
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
          <Environment preset="city" />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={2.5} color="#ffffff" />
          <directionalLight position={[-3, 2, -5]} color="#a8d8ff" intensity={3.0} />
          <directionalLight position={[-5, 3, 2]} color="#c8e8ff" intensity={2.0} />
          <directionalLight position={[0, -5, 3]} color="#ddeeff" intensity={1.5} />
          <Logo3D rotationRef={rotationRef} displayRotationRef={displayRotationRef} isDraggingRef={isDraggingRef} />
        </Suspense>
      </Canvas>
      <OrbitWidget rotationRef={rotationRef} displayRotationRef={displayRotationRef} isDraggingRef={isDraggingRef} />
    </div>
  );
}
