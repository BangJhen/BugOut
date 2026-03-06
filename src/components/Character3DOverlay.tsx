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
  
  // Tile position in board space (top-left corner)
  const tileX = col * STRIDE;
  const tileY = row * STRIDE;
  
  // Center of tile (where character should be)
  const tileCenterX = tileX + STRIDE / 2;
  const tileCenterY = tileY + STRIDE / 2;
  
  // Apply camera pan (board moves relative to viewport)
  const x = tileCenterX + camX;
  const y = tileCenterY + camY;
  
  // The board container is centered in viewport, then ISO transform applied
  // CSS: perspective(800) rotateX(55deg) rotateZ(45deg)
  // This creates isometric diamond view
  
  // For rotateZ(45deg) then rotateX(55deg):
  // After rotateZ(45deg): point (x,y) → ((x-y)/√2, (x+y)/√2)
  // After rotateX(55deg): y-coordinate gets scaled by cos(55°) ≈ 0.574
  
  const cos45 = Math.SQRT1_2; // 1/√2 ≈ 0.7071
  const cos55 = 0.574;
  
  // Apply rotateZ(45deg)
  const x1 = (x - y) * cos45;
  const y1 = (x + y) * cos45;
  
  // Apply rotateX(55deg) - scales y by cos(55°)
  const x2 = x1;
  const y2 = y1 * cos55;
  
  // Position in viewport (centered)
  const viewportCenterX = VIEWPORT_SIZE / 2;
  const viewportCenterY = VIEWPORT_SIZE / 2;
  
  return {
    left: viewportCenterX + x2,
    top: viewportCenterY + y2,
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
