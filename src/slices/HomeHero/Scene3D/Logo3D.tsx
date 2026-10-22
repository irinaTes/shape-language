'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import WordmarkText from './WordmarkText';

const GLB_PATH = '/assets/shape_language.glb';
const TEXTURE_PATHS = {
  normalMap: '/assets/Ice003_1K-PNG/Ice003_1K-PNG_NormalGL.png',
  roughnessMap: '/assets/Ice003_1K-PNG/Ice003_1K-PNG_Roughness.png',
};

// Start every download at module load so they run in parallel instead of
// waiting on each other (useGLTF suspends before useTexture is reached).
useGLTF.preload(GLB_PATH);
useTexture.preload(Object.values(TEXTURE_PATHS));

// Delay before the intro starts (seconds)
const INTRO_DELAY = 0.6;
// Duration of the intro animation (seconds)
const INTRO_DURATION = 2.0;

// Module-scoped: survives Logo3D remounts (e.g. hero scrolling back into view
// after frameloop pause). Reset only on full page reload.
let introHasPlayed = false;

// Cap per-frame time so a long first frame (shader compile, tab switch)
// can't skip most of the intro in a single step.
const MAX_DELTA = 1 / 30;

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
  const { scene } = useGLTF(GLB_PATH);
  const { size } = useThree();
  // Intro time, counted from the first frame the logo actually renders
  const introTimeRef = useRef(0);

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

  useFrame(({ pointer }, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, MAX_DELTA);

    let eased: number;
    let introRotX: number;
    let introRotZ: number;

    if (introHasPlayed) {
      eased = 1;
      introRotX = 0;
      introRotZ = 0;
    } else {
      introTimeRef.current += delta;
      const introProgress = Math.min(
        Math.max(introTimeRef.current - INTRO_DELAY, 0) / INTRO_DURATION,
        1,
      );
      eased = easeOutCubic(introProgress);
      introRotX = (1 - eased) * Math.PI * 1.5;
      introRotZ = (1 - eased) * Math.PI * 0.8;

      if (introProgress >= 1) introHasPlayed = true;
    }

    // Scale from 0.01 to target
    const currentScale = scale * (0.01 + eased * 0.99);
    groupRef.current.scale.setScalar(currentScale);

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

    // Frame-rate independent equivalent of lerping 5% per frame at 60fps
    const k = 1 - Math.pow(1 - 0.05, delta * 60);
    groupRef.current.rotation.x += (targetX + introRotX - groupRef.current.rotation.x) * k;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * k;
    groupRef.current.rotation.z += (introRotZ - groupRef.current.rotation.z) * k;

    displayRotationRef.current = [
      groupRef.current.rotation.x,
      groupRef.current.rotation.y,
      groupRef.current.rotation.z,
    ];
  });

  const textures = useTexture(TEXTURE_PATHS);

  useMemo(() => {
    Object.values(textures).forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
    });
  }, [textures]);

  // The GLB is meshopt-compressed with quantized positions, so the node carries
  // a scale/offset that must be kept alongside the geometry.
  const sourceMesh = useMemo(() => {
    let found: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh) {
        found = child as THREE.Mesh;
      }
    });
    return found as THREE.Mesh | null;
  }, [scene]);

  if (!sourceMesh) return null;

  return (
    <group>
      <group
        ref={groupRef}
        onPointerEnter={() => { isHoveringRef.current = true; }}
        onPointerLeave={() => { isHoveringRef.current = false; }}
      >
        <mesh
          geometry={sourceMesh.geometry}
          position={sourceMesh.position}
          quaternion={sourceMesh.quaternion}
          scale={sourceMesh.scale}
        >
          <MeshTransmissionMaterial
            background={new THREE.Color('#0a1628')}
            // color="#c8e8ff"
            normalMap={textures.normalMap}
            normalScale={[1.2, 1.2]}
            roughnessMap={textures.roughnessMap}
            attenuationColor="#7ec8e3"
            attenuationDistance={3}
            envMapIntensity={2.5}
            samples={2}
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
