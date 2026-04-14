'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MovingLights() {
  const l1 = useRef<THREE.PointLight>(null);
  const l2 = useRef<THREE.PointLight>(null);
  const l3 = useRef<THREE.PointLight>(null);
  const l4 = useRef<THREE.PointLight>(null);
  const l5 = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Cyan — slow horizontal orbit
    if (l1.current) {
      l1.current.position.x = Math.sin(t * 0.12) * 5;
      l1.current.position.y = Math.cos(t * 0.09) * 2;
      l1.current.position.z = 4 + Math.sin(t * 0.07) * 2;
    }

    // Magenta — opposite orbit
    if (l2.current) {
      l2.current.position.x = Math.sin(t * 0.15 + Math.PI) * 5;
      l2.current.position.y = Math.cos(t * 0.11 + 1) * 3;
      l2.current.position.z = 3 + Math.cos(t * 0.09) * 2;
    }

    // Violet — vertical figure-8
    if (l3.current) {
      l3.current.position.x = Math.sin(t * 0.1) * 3;
      l3.current.position.y = Math.sin(t * 0.18) * 5;
      l3.current.position.z = 3 + Math.cos(t * 0.08) * 1.5;
    }

    // Green — deep orbit
    if (l4.current) {
      l4.current.position.x = Math.cos(t * 0.08) * 4;
      l4.current.position.y = Math.sin(t * 0.07) * 4;
      l4.current.position.z = 2 + Math.sin(t * 0.12) * 3;
    }

    // Orange — tight spin
    if (l5.current) {
      l5.current.position.x = Math.cos(t * 0.2) * 3;
      l5.current.position.y = Math.sin(t * 0.2) * 3;
      l5.current.position.z = 5 + Math.sin(t * 0.14) * 1;
    }
  });

  return (
    <>
      <pointLight ref={l1} color="#00f5ff" intensity={25} distance={14} decay={2} />
      <pointLight ref={l2} color="#ff00cc" intensity={25} distance={14} decay={2} />
      <pointLight ref={l3} color="#cc00ff" intensity={18} distance={14} decay={2} />
      <pointLight ref={l4} color="#00ff88" intensity={15} distance={12} decay={2} />
      <pointLight ref={l5} color="#ff6600" intensity={12} distance={10} decay={2} />
    </>
  );
}
