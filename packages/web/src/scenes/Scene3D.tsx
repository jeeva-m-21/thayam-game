import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';
import { getCellIdAtPosition, OFF_BOARD } from '@thayam/rules-engine';
import { Dice3D } from './Dice3D';
import type { PlayerColor } from '@thayam/rules-engine';

const PAWN_COLORS: Record<PlayerColor, string> = {
  red: '#B2312F',
  green: '#4B7A46',
  yellow: '#D9A22A',
  blue: '#2E4C74',
};

// 7x7 grid coordinates mapped into 3D world space (centered around origin)
const CELL_3D_POS: Record<string, [number, number, number]> = {
  o00: [-3, 0.08, -3], o01: [-2, 0.08, -3], o02: [-1, 0.08, -3], o03: [0, 0.08, -3], o04: [1, 0.08, -3], o05: [2, 0.08, -3], o06: [3, 0.08, -3],
  o16: [3, 0.08, -2],  o26: [3, 0.08, -1],  o36: [3, 0.08, 0],   o46: [3, 0.08, 1],  o56: [3, 0.08, 2],  o66: [3, 0.08, 3],
  o65: [2, 0.08, 3],   o64: [1, 0.08, 3],   o63: [0, 0.08, 3],   o62: [-1, 0.08, 3], o61: [-2, 0.08, 3], o60: [-3, 0.08, 3],
  o50: [-3, 0.08, 2],  o40: [-3, 0.08, 1],  o30: [-3, 0.08, 0],  o20: [-3, 0.08, -1], o10: [-3, 0.08, -2],
  hr1: [-2, 0.08, 0],  hr2: [-1, 0.08, 0],
  hg1: [0, 0.08, -2],  hg2: [0, 0.08, -1],
  hy1: [0, 0.08, 2],   hy2: [0, 0.08, 1],
  hb1: [2, 0.08, 0],   hb2: [1, 0.08, 0],
  center: [0, 0.08, 0],
};

function BoardMesh() {
  return (
    <group>
      {/* Wooden / Red oxide main board slab */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[7.6, 0.3, 7.6]} />
        <meshStandardMaterial color="#7C3B2E" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Brass outer rim bezel */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[7.75, 0.12, 7.75]} />
        <meshStandardMaterial color="#AD8A4E" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* 7x7 Grid cell inlays */}
      {Object.entries(CELL_3D_POS).map(([id, pos]) => {
        const isCenter = id === 'center';
        const isSafe = id.startsWith('o03') || id.startsWith('o36') || id.startsWith('o63') || id.startsWith('o30') || isCenter;
        return (
          <mesh key={id} position={[pos[0], 0.01, pos[2]]} receiveShadow>
            <boxGeometry args={[0.9, 0.04, 0.9]} />
            <meshStandardMaterial
              color={isCenter ? '#D9B876' : isSafe ? '#C99E55' : '#2A2320'}
              roughness={isCenter ? 0.2 : 0.6}
              metalness={isCenter ? 0.7 : 0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Pawns3D() {
  const { gameState, selectedPawnId } = useGameStore();

  const renderedPawns: React.ReactNode[] = [];

  for (const color of gameState.turnOrder) {
    const pState = gameState.players[color];
    const path = gameState.board.players[color];

    for (const p of pState.pawns) {
      if (p.position === OFF_BOARD) continue;

      const cellId = getCellIdAtPosition(path, p.position);
      const cellPos = CELL_3D_POS[cellId] || [0, 0, 0];
      const isSelected = color === gameState.turnOrder[gameState.currentPlayerIndex] && selectedPawnId === p.id;

      renderedPawns.push(
        <mesh
          key={`${color}-${p.id}`}
          position={[cellPos[0], cellPos[1] + 0.3 + (isSelected ? 0.2 : 0), cellPos[2]]}
          castShadow
        >
          {/* Classical bell-shaped brass/wood pawn */}
          <cylinderGeometry args={[0.16, 0.28, 0.55, 16]} />
          <meshStandardMaterial
            color={PAWN_COLORS[color]}
            roughness={0.4}
            metalness={0.4}
            emissive={isSelected ? PAWN_COLORS[color] : '#000000'}
            emissiveIntensity={isSelected ? 0.6 : 0}
          />
        </mesh>
      );
    }
  }

  return <group>{renderedPawns}</group>;
}

export const Scene3D: React.FC = () => {
  const { gameState } = useGameStore();
  const rollValues: [number, number] | null = gameState.currentRoll
    ? [gameState.currentRoll.dieA, gameState.currentRoll.dieB]
    : null;

  return (
    <div className="relative w-full max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-brass bg-floor-oxide-dark">
      <Canvas
        shadows
        camera={{ position: [0, 8.5, 6], fov: 48 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 12, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 6, -4]} intensity={0.6} />

        <Suspense fallback={null}>
          <Center>
            <group rotation={[-0.15, 0, 0]}>
              <BoardMesh />
              <Pawns3D />
              <Dice3D rolling={gameState.phase === 'waiting-for-roll'} values={rollValues} />
            </group>
          </Center>
        </Suspense>

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          minDistance={6}
          maxDistance={14}
        />
      </Canvas>
    </div>
  );
};
