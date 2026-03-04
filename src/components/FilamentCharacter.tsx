import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  FilamentScene,
  FilamentView,
  DefaultLight,
  Model,
  Camera,
  Animator,
} from 'react-native-filament';

// ─── Asset requires ────────────────────────────────────────────────────────────
const chipModel = require('../assets/models/chip_character.glb');
const glitchyModel = require('../assets/models/glitchy_character.glb');

// ─── Types ─────────────────────────────────────────────────────────────────────
export type FilamentCharacterType = 'chip' | 'glitchy';

interface FilamentCharacterProps {
  type: FilamentCharacterType;
  // size in pixels for the 3D view container
  size?: number;
  isSelected?: boolean;
  // animation index to play (0 = first/idle by default)
  animationIndex?: number;
}

// ─── Public component ──────────────────────────────────────────────────────────
export default function FilamentCharacter({
  type,
  size = 80,
  isSelected = false,
  animationIndex = 0,
}: FilamentCharacterProps) {
  const source = type === 'chip' ? chipModel : glitchyModel;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <FilamentScene>
        <FilamentView style={styles.view}>
          <DefaultLight />
          <Camera />
          {/* Model with Animator child for looping animation */}
          <Model source={source} transformToUnitCube>
            <Animator animationIndex={animationIndex} />
          </Model>
        </FilamentView>
      </FilamentScene>
      {isSelected && <View style={styles.selectedRing} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  view: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#00f2ff',
    pointerEvents: 'none',
  },
});
