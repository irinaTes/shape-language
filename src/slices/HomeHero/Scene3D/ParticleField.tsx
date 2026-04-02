'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

export default function ParticleField() {
  const posAttrRef = useRef<THREE.BufferAttribute>(null);
  const { pointer, camera } = useThree();

  const originPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return pos;
  }, []);

  // Live positions (mutated each frame)
  const positions = useMemo(() => new Float32Array(originPositions), [originPositions]);

  // Per-particle velocity (x, y only)
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 2), []);
  const phases     = useMemo(() => Float32Array.from({ length: PARTICLE_COUNT }, () => Math.random() * Math.PI * 2), []);

  const { sizes, opacities } = useMemo(() => {
    const sizes = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizes[i]    = 4.0 + Math.random() * 14.0;
      opacities[i] =  0.2 + Math.random() * 0.4;
    }
    return { sizes, opacities };
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);
  const unprojected = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();

    // Build a ray from camera through the cursor (works at any particle depth)
    unprojected.set(pointer.x, pointer.y, 0.5).unproject(camera);
    rayDir.copy(unprojected).sub(camera.position).normalize();

    const ox_ = camera.position.x;
    const oy_ = camera.position.y;
    const oz_ = camera.position.z;
    const rdx = rayDir.x, rdy = rayDir.y, rdz = rayDir.z;

    const REPEL_RADIUS = 2.5;
    const REPEL_STRENGTH = 0.7;
    const SPRING = 0.04;
    const DAMPING = 0.82;

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

      // Vector from ray origin to particle
      const tpx = cx - ox_, tpy = cy - oy_, tpz = cz - oz_;
      // Project onto ray direction
      const t = tpx * rdx + tpy * rdy + tpz * rdz;
      // Closest point on ray to particle
      const cpx = ox_ + t * rdx;
      const cpy = oy_ + t * rdy;
      // Repel direction (from closest point on ray to particle, XY only)
      const dx = cx - cpx;
      const dy = cy - cpy;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < REPEL_RADIUS && d > 0.001) {
        const force = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH;
        velocities[i2]     += (dx / d) * force;
        velocities[i2 + 1] += (dy / d) * force;
      }

      // Spring back to origin
      velocities[i2]     += (ox - cx) * SPRING;
      velocities[i2 + 1] += (oy - cy) * SPRING;

      // Damping
      velocities[i2]     *= DAMPING;
      velocities[i2 + 1] *= DAMPING;

      // Apply
      positions[i3]     += velocities[i2];
      positions[i3 + 1] += velocities[i2 + 1];
    }

    if (posAttrRef.current) {
      posAttrRef.current.needsUpdate = true;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          args={[positions, 3]}
        />
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
