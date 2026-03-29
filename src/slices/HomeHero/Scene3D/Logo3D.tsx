'use client';
import { useRef, useMemo } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useTexture } from '@react-three/drei';

interface Logo3DProps {
  rotationRef: React.MutableRefObject<[number, number, number]>;
  isDraggingRef: React.MutableRefObject<boolean>;
}

export default function Logo3D({ rotationRef, isDraggingRef }: Logo3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const data = useLoader(SVGLoader, '/assets/logo.svg');
  const { pointer } = useThree();

  const geometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    data.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 40,
          bevelEnabled: true,
          bevelThickness: 4,
          bevelSize: 3,
          bevelSegments: 12,
        });
        geometries.push(geo);
      });
    });

    if (geometries.length === 0) return new THREE.BufferGeometry();

    const merged = BufferGeometryUtils.mergeGeometries(geometries);
    merged.computeBoundingBox();
    const box = merged.boundingBox!;
    const center = new THREE.Vector3();
    box.getCenter(center);
    merged.translate(-center.x, -center.y, -center.z);

    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 10 / Math.max(size.x, size.y);
    merged.scale(scale, scale, scale);

    // Melting drips — displace vertices downward near the bottom
    merged.computeBoundingBox();
    const meltBox = merged.boundingBox!;
    const meltSize = new THREE.Vector3();
    meltBox.getSize(meltSize);
    const posAttr = merged.attributes.position;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      // Normalize Y position (0 = bottom, 1 = top)
      const ny = (y - meltBox.min.y) / meltSize.y;

      // Only affect bottom 30% of the mesh
      if (ny < 0.3) {
        const meltFactor = 1.0 - ny / 0.3; // 1 at bottom, 0 at 30%
        // Drip displacement: pull down + slight outward bulge
        const seed = Math.sin(x * 3.7) * Math.cos(z * 2.3);
        const drip = meltFactor * meltFactor * (0.8 + seed * 0.4);
        posAttr.setY(i, y - drip * meltSize.y * 0.15);
        // Slight outward spread at the bottom
        posAttr.setX(i, x + meltFactor * seed * meltSize.x * 0.02);
      }

      // Frosting: add subtle noise displacement on all vertices for surface irregularity
      const noise = Math.sin(x * 11.3) * Math.cos(y * 7.7) * Math.sin(z * 9.1);
      posAttr.setX(i, posAttr.getX(i) + noise * meltSize.x * 0.003);
      posAttr.setY(i, posAttr.getY(i) + noise * meltSize.y * 0.003);
      posAttr.setZ(i, posAttr.getZ(i) + noise * meltSize.z * 0.003);
    }

    posAttr.needsUpdate = true;
    merged.computeVertexNormals();

    // Recompute UVs using box projection so textures map correctly
    merged.computeBoundingBox();
    const uvBox = merged.boundingBox!;
    const uvSize = new THREE.Vector3();
    uvBox.getSize(uvSize);
    const uvs = new Float32Array(posAttr.count * 2);
    for (let i = 0; i < posAttr.count; i++) {
      uvs[i * 2] = (posAttr.getX(i) - uvBox.min.x) / uvSize.x;
      uvs[i * 2 + 1] = (posAttr.getY(i) - uvBox.min.y) / uvSize.y;
    }
    merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    return merged;
  }, [data]);

  useFrame(() => {
    if (!groupRef.current) return;

    let targetX: number, targetY: number;

    if (isDraggingRef.current) {
      // Orbit widget is active — use its rotation
      targetX = rotationRef.current[0];
      targetY = rotationRef.current[1];
    } else {
      // Default: follow mouse cursor
      targetX = pointer.y * 0.4;
      targetY = pointer.x * 0.4;
    }

    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
  });

  const textures = useTexture({
    normalMap: '/assets/Ice003_1K-PNG/Ice003_1K-PNG_NormalGL.png',
    roughnessMap: '/assets/Ice003_1K-PNG/Ice003_1K-PNG_Roughness.png',
  });

  console.log('Loaded textures:', {
    normalMap: `${textures.normalMap.image?.width}x${textures.normalMap.image?.height}`,
    roughnessMap: `${textures.roughnessMap.image?.width}x${textures.roughnessMap.image?.height}`,
  });

  Object.values(textures).forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
  });

  return (
    <group ref={groupRef} scale={[1, -1, 1]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#c0ddf0"
          metalness={0}
          roughness={0.6}
          roughnessMap={textures.roughnessMap}
          normalMap={textures.normalMap}
          normalScale={new THREE.Vector2(3.0, 3.0)}
          transmission={1.0}
          thickness={0.2}
          ior={1.31}
          attenuationColor="#80b8e0"
          attenuationDistance={3.0}
          envMapIntensity={0.8}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
