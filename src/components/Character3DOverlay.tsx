import React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle, SharedValue} from 'react-native-reanimated';
import FilamentCharacter, {FilamentCharacterType} from './FilamentCharacter';

// Constants from GameBoardScreen
const TILE_SIZE = 72;
const TILE_GAP = 4;
const STRIDE = TILE_SIZE + TILE_GAP; // 76
const SCREEN_WIDTH = 390; // Dimensions.get('window').width
const VIEWPORT_SIZE = SCREEN_WIDTH - 24;

export interface Character3DEntry {
  id: string;
  type: FilamentCharacterType;
  row: number;
  col: number;
}

interface Character3DOverlayProps {
  characters: Character3DEntry[];
  camX: SharedValue<number>;
  camY: SharedValue<number>;
}

// Calculate screen position for a board tile after ISO projection + camera pan
function calculateScreenPosition(
  row: number,
  col: number,
  camX: number,
  camY: number,
): {left: number; top: number} {
  'worklet';
  // Board-space position (before ISO transform)
  const boardX = col * STRIDE;
  const boardY = row * STRIDE;

  // Apply camera pan offset
  const panX = boardX + camX;
  const panY = boardY + camY;

  // ISO projection: rotateX(55deg) rotateZ(45deg)
  // This creates a diamond/isometric view
  // Simplified 2D projection approximation:
  // x_screen = (panX - panY) * cos(45°)
  // y_screen = (panX + panY) * sin(45°) * cos(55°)
  
  const cos45 = 0.7071;
  const sin45 = 0.7071;
  const cos55 = 0.5736;

  const isoX = (panX - panY) * cos45;
  const isoY = (panX + panY) * sin45 * cos55;

  // Center in viewport
  const centerX = VIEWPORT_SIZE / 2;
  const centerY = VIEWPORT_SIZE / 2;

  return {
    left: centerX + isoX,
    top: centerY + isoY,
  };
}

// Individual animated character component
interface AnimatedCharacterItemProps {
  char: Character3DEntry;
  camX: SharedValue<number>;
  camY: SharedValue<number>;
}

function AnimatedCharacterItem({char, camX, camY}: AnimatedCharacterItemProps) {
  const animStyle = useAnimatedStyle(() => {
    const pos = calculateScreenPosition(
      char.row,
      char.col,
      camX.value,
      camY.value,
    );
    return {
      position: 'absolute',
      left: pos.left - TILE_SIZE * 0.375, // center the 54px character
      top: pos.top - TILE_SIZE * 0.375,
    };
  });

  return (
    <Animated.View style={animStyle}>
      <FilamentCharacter type={char.type} size={TILE_SIZE * 0.75} />
    </Animated.View>
  );
}

export default function Character3DOverlay({
  characters,
  camX,
  camY,
}: Character3DOverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {characters.map(char => (
        <AnimatedCharacterItem
          key={char.id}
          char={char}
          camX={camX}
          camY={camY}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
