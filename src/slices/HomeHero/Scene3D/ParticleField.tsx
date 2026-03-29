'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 3000;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;

  void main() {
    vec3 pos = position;

    // Distance from particle to mouse in XY
    float dist = distance(pos.xy, uMouse);

    // Displace z based on sin wave from mouse distance
    pos.z += sin(dist * 5.0 - uTime * 2.0) * 0.8;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 3.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  void main() {
    // Soft circular dot
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.4);
  }
`;

export default function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const { pointer, camera } = useThree();

  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 40;
      pos[i3 + 1] = (Math.random() - 0.5) * 30;
      pos[i3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return pos;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  const cursorWorld = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();

    // Unproject pointer to world z=0 plane
    cursorWorld.set(pointer.x, pointer.y, 0.5).unproject(camera);
    const dir = cursorWorld.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    cursorWorld.copy(camera.position).add(dir.multiplyScalar(dist));

    uniforms.uMouse.value.set(cursorWorld.x, cursorWorld.y);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
