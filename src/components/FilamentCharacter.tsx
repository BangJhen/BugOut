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
  const boardWorldSize = 2.2; // world units that fit the whole board
  const halfBoard = boardWorldSize / 2;
  const cellWorld = boardWorldSize / 4; // per tile in world units

  const toWorldX = (col: number) =>
    -halfBoard + col * cellWorld + cellWorld / 2;
  const toWorldZ = (row: number) =>
    -halfBoard + row * cellWorld + cellWorld / 2;

  return (
    <FilamentScene>
      <FilamentView
        style={styles.view}
        pointerEvents="none">
        <DefaultLight />
        <Camera />
        {characters.map(char => (
          <Model
            key={char.id}
            source={char.type === 'chip' ? chipModel : glitchyModel}
            transformToUnitCube
            scale={[0.38, 0.38, 0.38]}
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
