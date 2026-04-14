'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

const PARTICLE_COUNT = 8000;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aOpacity;

  varying float vOpacity;

  void main() {
    vOpacity = aOpacity;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying float vOpacity;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    float pulse = 1.0 + sin(uTime * 1.5) * 0.3;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vOpacity * pulse);
  }
`;

interface ParticlesProps {
  pointerNDC: React.MutableRefObject<{ x: number; y: number }>;
}

function Particles({ pointerNDC }: ParticlesProps) {
  const posAttrRef = useRef<THREE.BufferAttribute>(null);
  const { camera } = useThree();

  const originPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return pos;
  }, []);

  const positions  = useMemo(() => new Float32Array(originPositions), [originPositions]);
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 2), []);
  const phases     = useMemo(() => Float32Array.from({ length: PARTICLE_COUNT }, () => Math.random() * Math.PI * 2), []);

  const { sizes, opacities } = useMemo(() => {
    const sizes    = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizes[i]     = 4.0 + Math.random() * 14.0;
      opacities[i] = 0.2 + Math.random() * 0.4;
    }
    return { sizes, opacities };
  }, []);

  const uniforms    = useMemo(() => ({ uTime: { value: 0 } }), []);
  const rayDir      = useMemo(() => new THREE.Vector3(), []);
  const unprojected = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();

    unprojected.set(pointerNDC.current.x, pointerNDC.current.y, 0.5).unproject(camera);
    rayDir.copy(unprojected).sub(camera.position).normalize();

    const ox_ = camera.position.x;
    const oy_ = camera.position.y;
    const oz_ = camera.position.z;
    const rdx = rayDir.x, rdy = rayDir.y, rdz = rayDir.z;

    const REPEL_RADIUS   = 2.5;
    const REPEL_STRENGTH = 0.7;
    const SPRING         = 0.04;
    const DAMPING        = 0.82;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      const cx = positions[i3];
      const cy = positions[i3 + 1];
      const cz = positions[i3 + 2];
      const time = uniforms.uTime.value;
      const drift = 0.08;
      const ox = originPositions[i3]     + Math.sin(time * 0.3 + phases[i]) * drift;
      const oy = originPositions[i3 + 1] + Math.cos(time * 0.3 + phases[i] + 1.0) * drift;

      const tpx = cx - ox_, tpy = cy - oy_, tpz = cz - oz_;
      const t   = tpx * rdx + tpy * rdy + tpz * rdz;
      const cpx = ox_ + t * rdx;
      const cpy = oy_ + t * rdy;

      const dx = cx - cpx;
      const dy = cy - cpy;
      const d  = Math.sqrt(dx * dx + dy * dy);

      if (d < REPEL_RADIUS && d > 0.001) {
        const force = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH;
        velocities[i2]     += (dx / d) * force;
        velocities[i2 + 1] += (dy / d) * force;
      }

      velocities[i2]     += (ox - cx) * SPRING;
      velocities[i2 + 1] += (oy - cy) * SPRING;
      velocities[i2]     *= DAMPING;
      velocities[i2 + 1] *= DAMPING;

      positions[i3]     += velocities[i2];
      positions[i3 + 1] += velocities[i2 + 1];
    }

    if (posAttrRef.current) posAttrRef.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={posAttrRef} attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aOpacity" args={[opacities, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ParticleBackgroundInner() {
  const pointerNDC = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerNDC.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      pointerNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1]}
        gl={{ antialias: false }}
        style={{ background: '#080808' }}
      >
          <color attach="background" args={['#080808']} />
        <Particles pointerNDC={pointerNDC} />
      </Canvas>
    </div>
  );
}

// Disable SSR — Canvas requires browser APIs
export default dynamic(() => Promise.resolve(ParticleBackgroundInner), { ssr: false });
