'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import WordmarkText from './WordmarkText';

// Delay before the intro starts (seconds)
const INTRO_DELAY = 0.6;
// Duration of the intro animation (seconds)
const INTRO_DURATION = 2.0;

// Ease out cubic
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface Logo3DProps {
  rotationRef: React.MutableRefObject<[number, number, number]>;
  displayRotationRef: React.MutableRefObject<[number, number, number]>;
  isDraggingRef: React.MutableRefObject<boolean>;
  textMode?: 'inside-logo' | 'tablet';
}

export default function Logo3D({ rotationRef, displayRotationRef, isDraggingRef, textMode = 'inside-logo' }: Logo3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHoveringRef = useRef(false);
  const { scene } = useGLTF('/assets/shape_language.glb');
  const { size } = useThree();
  const startTimeRef = useRef<number | null>(null);

  const scale = useMemo(() => {
    if (size.width < 640)  return 22;
    if (size.width < 1024) return 30;
    if (size.width < 1280) return 34;
    if (size.width < 1600) return 38;
    if (size.width < 2048) return 44;
    return 50;
  }, [size.width]);

  const materialProps = {
    thickness: 0.05,
    roughness: 0.2,
    transmission: 1,
    ior: 1.2,
    chromaticAberration: 0.07,
    backside: true,
  };

  useFrame(({ pointer, clock }) => {
    if (!groupRef.current) return;

    const elapsed = clock.getElapsedTime();

    // Record when animation starts (after delay)
    if (startTimeRef.current === null && elapsed >= INTRO_DELAY) {
      startTimeRef.current = elapsed;
    }

    // Intro animation
    const introProgress = startTimeRef.current === null
      ? 0
      : Math.min((elapsed - startTimeRef.current) / INTRO_DURATION, 1);
    const eased = easeOutCubic(introProgress);

    // Scale from 0.01 to target
    const currentScale = scale * (0.01 + eased * 0.99);
    groupRef.current.scale.setScalar(currentScale);

    // Spin on X and Z during intro, settling to 0
    const introRotX = (1 - eased) * Math.PI * 1.5;
    const introRotZ = (1 - eased) * Math.PI * 0.8;

    // Normal pointer/drag rotation after intro
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

    groupRef.current.rotation.x += (targetX + introRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.z += (introRotZ - groupRef.current.rotation.z) * 0.05;

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

  const geometry = useMemo(() => {
    let found: THREE.BufferGeometry | null = null;
    scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh) {
        found = (child as THREE.Mesh).geometry;
      }
    });
    return found;
  }, [scene]);

  if (!geometry) return null;

  return (
    <group>
      <group
        ref={groupRef}
        onPointerEnter={() => { isHoveringRef.current = true; }}
        onPointerLeave={() => { isHoveringRef.current = false; }}
      >
        <mesh geometry={geometry}>
          <MeshTransmissionMaterial
            background={new THREE.Color('#0a1628')}
            // color="#c8e8ff"
            normalMap={textures.normalMap}
            normalScale={[1.2, 1.2]}
            roughnessMap={textures.roughnessMap}
            attenuationColor="#7ec8e3"
            attenuationDistance={3}
            envMapIntensity={2.5}
            samples={4}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.3}
            {...materialProps}
          />
        </mesh>
      </group>
      <WordmarkText mode={textMode} />
    </group>
  );
}

useGLTF.preload('/assets/shape_language.glb');
