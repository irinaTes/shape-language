'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useEnvironment } from '@react-three/drei';
import * as THREE from 'three';
import Logo3D from './Logo3D';
import ParticleField from './ParticleField';
import OrbitWidget from './OrbitWidget';
import { useRef } from 'react';

function HdriEnvironment() {
  const envMap = useEnvironment({ files: '/env.hdr' });
  return <primitive object={envMap} attach="environment" />;
}

export default function Scene3D() {
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const displayRotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const isDraggingRef = useRef(false);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
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
          {/* <HdriEnvironment /> */}
          <color attach="background" args={['#080808']} />  ← add this

          <Environment preset="city" />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-3, 2, -5]} color="#a8d8ff" intensity={2.0} />
          <directionalLight position={[-5, 3, 2]} color="#c8e8ff" intensity={1.0} />
          <Logo3D rotationRef={rotationRef} displayRotationRef={displayRotationRef} isDraggingRef={isDraggingRef} />
        </Suspense>
        <ParticleField />
      </Canvas>
      <OrbitWidget rotationRef={rotationRef} displayRotationRef={displayRotationRef} isDraggingRef={isDraggingRef} />
    </div>
  );
}
