import React from 'react';
import {StyleSheet} from 'react-native';
import {
  FilamentScene,
  FilamentView,
  DefaultLight,
  Model,
  Camera,
} from 'react-native-filament';

// ─── Asset requires ────────────────────────────────────────────────────────────
const chipModel = require('../assets/models/chip_character.glb');
const glitchyModel = require('../assets/models/glitchy_character.glb');

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface CharacterEntry {
  id: string;
  type: 'chip' | 'glitchy';
  // board-space position (row, col) — converted to 3D world coords internally
  row: number;
  col: number;
}

interface Arena3DOverlayProps {
  characters: CharacterEntry[];
}

// ─── Single-scene overlay for all 3D characters ────────────────────────────────
// All models share ONE FilamentScene → no per-tile overhead
export default function Arena3DOverlay({characters}: Arena3DOverlayProps) {
  // Map board (row, col) to Filament 3D world coords.
  // Filament world: X right, Y up, Z toward viewer.
  // Board origin top-left. We center the board at origin.
  // Board world space: 4x4 tiles centered at origin.
  // Camera at (4,4,4) → classic true-isometric angle (elevation ≈35.26°, azimuth 45°)
  // matches CSS: perspective(800) + rotateX(55deg) + rotateZ(45deg)
  const boardWorldSize = 2.2;
  const halfBoard = boardWorldSize / 2;
  const cellWorld = boardWorldSize / 4; // 0.55 world units per tile

  const toWorldX = (col: number) =>
    -halfBoard + col * cellWorld + cellWorld / 2;
  const toWorldZ = (row: number) =>
    -halfBoard + row * cellWorld + cellWorld / 2;

  // Isometric camera: equal (4,4,4) gives 35.26° elevation and 45° azimuth
  const CAM: [number, number, number] = [4, 4, 4];
  const TARGET: [number, number, number] = [0, 0, 0];
  const UP: [number, number, number] = [0, 1, 0];

  return (
    <FilamentScene>
      <FilamentView
        style={styles.view}
        pointerEvents="none">
        <DefaultLight />
        <Camera
          cameraPosition={CAM}
          cameraTarget={TARGET}
          cameraUp={UP}
        />
        {characters.map(char => (
          <Model
            key={char.id}
            source={char.type === 'chip' ? chipModel : glitchyModel}
            transformToUnitCube
            scale={[0.25, 0.25, 0.25]}
            translate={[toWorldX(char.col), 0, toWorldZ(char.row)]}
            multiplyWithCurrentTransform={false}
          />
        ))}
      </FilamentView>
    </FilamentScene>
  );
}

const styles = StyleSheet.create({
  view: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
