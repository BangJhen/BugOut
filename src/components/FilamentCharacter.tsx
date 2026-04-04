import React from 'react';
import {StyleSheet, View} from 'react-native';
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
export type FilamentCharacterType = 'chip' | 'glitchy';

interface FilamentCharacterProps {
  type: FilamentCharacterType;
  // size of the rendered 3D view in pixels (should match tile size)
  size: number;
  modelScale?: number;
}

// ─── Per-tile 3D character (1 FilamentScene per instance) ─────────────────────
// Only mount this for currentPlayer's on-grid char + monster → max 2 instances
export default function FilamentCharacter({
  type,
  size,
  modelScale = 1,
}: FilamentCharacterProps) {
  const source = type === 'chip' ? chipModel : glitchyModel;

  // Lower camera Y to reduce top view and show more front/side volume.
  const CAM: [number, number, number] = [2.4, 0.35, -2.4];
  const TARGET: [number, number, number] = [0, 0.25, 0];
  const UP: [number, number, number] = [0, 1, 0];
  const MODEL_ROTATE: [number, number, number] =
    type === 'chip' ? [0.16, 0.62, 0] : [0.12, 1.12, 0];

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <FilamentScene>
        <FilamentView style={styles.view} pointerEvents="none">
          <DefaultLight />
          <Camera
            cameraPosition={CAM}
            cameraTarget={TARGET}
            cameraUp={UP}
          />
          <Model
            source={source}
            rotate={MODEL_ROTATE}
            scale={[modelScale, modelScale, modelScale]}
            transformToUnitCube
            multiplyWithCurrentTransform={false}
          />
        </FilamentView>
      </FilamentScene>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  view: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
