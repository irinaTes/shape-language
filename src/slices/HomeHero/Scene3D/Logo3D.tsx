'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, MeshTransmissionMaterial } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

interface Logo3DProps {
  rotationRef: React.MutableRefObject<[number, number, number]>;
  displayRotationRef: React.MutableRefObject<[number, number, number]>;
  isDraggingRef: React.MutableRefObject<boolean>;
}

export default function Logo3D({ rotationRef, displayRotationRef, isDraggingRef }: Logo3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHoveringRef = useRef(false);
  const { scene } = useGLTF('/assets/shape_language.glb');

  const materialProps = useControls({
    thickness: { value: 0, min: 0, max: 3, step: 0.05 },
    roughness: { value: 0.45, min: 0, max: 1, step: 0.01 },
    transmission: { value: 1, min: 0, max: 1, step: 0.1 },
    ior: { value: 1.33, min: 0, max: 3, step: 0.1 },
    chromaticAberration: { value: 0.05, min: 0, max: 1 },
    backside: { value: true },
  });
  useFrame(({ pointer }) => {
    if (!groupRef.current) return;

    let targetX: number;
    let targetY: number;

    if (isDraggingRef.current) {
      targetX = rotationRef.current[0];
      targetY = rotationRef.current[1];
    } else if (isHoveringRef.current) {
      targetX = -pointer.y * 0.3;
      targetY = pointer.x * 0.3;
    } else {
      targetX = rotationRef.current[0];
      targetY = rotationRef.current[1];
    }

    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;

    displayRotationRef.current = [
      groupRef.current.rotation.x,
      groupRef.current.rotation.y,
      groupRef.current.rotation.z,
    ];
  });

  const textures = useTexture({
    normalMap: '/assets/Ice003_1K-PNG/Ice003_1K-PNG_NormalGL.png',
    roughnessMap: '/assets/Ice003_1K-PNG/Ice003_1K-PNG_Roughness.png',
  });

  Object.values(textures).forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
  });

  const meshes = useMemo(() => {
    const result: { geometry: THREE.BufferGeometry; uuid: string }[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        result.push({ geometry: (child as THREE.Mesh).geometry, uuid: child.uuid });
      }
    });
    return result;
  }, [scene]);

  return (
    <group
      ref={groupRef}
      scale={50}
      onPointerEnter={() => { isHoveringRef.current = true; }}
      onPointerLeave={() => { isHoveringRef.current = false; }}
    >
      {meshes.map(({ geometry, uuid }) => (
        <mesh key={uuid} geometry={geometry}>
          <MeshTransmissionMaterial
            background={new THREE.Color('#0a1628')}
            color="#c8e8ff"
            normalMap={textures.normalMap}
            normalScale={[1.2, 1.2]}
            roughnessMap={textures.roughnessMap}
            attenuationColor="#7ec8e3"
            attenuationDistance={3}
            envMapIntensity={2.5}
            samples={16}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.3}
            {...materialProps}
          />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload('/assets/shape_language.glb');
