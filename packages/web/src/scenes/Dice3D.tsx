import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Dice3DProps {
  rolling: boolean;
  values: [number, number] | null;
  onSettled?: () => void;
}

// Map face value (0, 1, 2, 3) to target rotation angles
const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  0: [0, 0, 0],
  1: [Math.PI / 2, 0, 0],
  2: [Math.PI, 0, 0],
  3: [-Math.PI / 2, 0, 0],
};

function SingleDie({
  position,
  rolling,
  value,
  seed,
}: {
  position: [number, number, number];
  rolling: boolean;
  value: number;
  seed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0));

  useEffect(() => {
    const rot = FACE_ROTATIONS[value] || [0, 0, 0];
    targetRotation.current.set(rot[0], rot[1] + (seed * 0.2), rot[2]);
  }, [value, seed]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (rolling) {
      meshRef.current.rotation.x += delta * (8 + seed);
      meshRef.current.rotation.y += delta * (6 + seed);
      meshRef.current.rotation.z += delta * (7 + seed);
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.01 + seed) * 0.25;
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.current.x, delta * 8);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.current.y, delta * 8);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.current.z, delta * 8);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], delta * 8);
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      {/* Cuboid Daayam die: elongated aspect ratio 0.4 x 0.4 x 1.4 */}
      <boxGeometry args={[0.36, 0.36, 1.25]} />
      <meshStandardMaterial
        color="#AD8A4E"
        roughness={0.28}
        metalness={0.88}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

export const Dice3D: React.FC<Dice3DProps> = ({ rolling, values, onSettled }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (rolling) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
        if (onSettled) onSettled();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rolling, onSettled]);

  const valA = values ? values[0] : 0;
  const valB = values ? values[1] : 0;

  return (
    <group position={[0, 0.4, 0]}>
      <SingleDie position={[-0.45, 0.2, 0]} rolling={animating} value={valA} seed={1} />
      <SingleDie position={[0.45, 0.2, 0]} rolling={animating} value={valB} seed={2} />
    </group>
  );
};
