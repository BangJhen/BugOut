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
}

// ─── Per-tile 3D character (1 FilamentScene per instance) ─────────────────────
// Only mount this for currentPlayer's on-grid char + monster → max 2 instances
export default function FilamentCharacter({type, size}: FilamentCharacterProps) {
  const source = type === 'chip' ? chipModel : glitchyModel;

  // Camera looks straight down-front at a single centered model.
  // position (0, 2.2, 2.2) → ~45° elevation from front, model at origin.
  const CAM: [number, number, number] = [0, 2.2, 2.2];
  const TARGET: [number, number, number] = [0, 0, 0];
  const UP: [number, number, number] = [0, 1, 0];

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
