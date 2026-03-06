import React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import FilamentCharacter, {FilamentCharacterType} from './FilamentCharacter';

// Constants from GameBoardScreen
const TILE_SIZE = 72;
const TILE_GAP = 4;
const STRIDE = TILE_SIZE + TILE_GAP; // 76

export interface Character3DEntry {
  id: string;
  type: FilamentCharacterType;
  row: number;
  col: number;
}

interface Character3DOverlayProps {
  characters: Character3DEntry[];
}

// Calculate board-space position for a tile (same as TileCell positioning)
function calculateBoardPosition(
  row: number,
  col: number,
): {left: number; top: number} {
  'worklet';
  
  // Position in board space (same as tiles)
  const left = col * STRIDE;
  const top = row * STRIDE;
  
  return {left, top};
}

// Individual animated character component
interface AnimatedCharacterItemProps {
  char: Character3DEntry;
}

function AnimatedCharacterItem({char}: AnimatedCharacterItemProps) {
  const animStyle = useAnimatedStyle(() => {
    const pos = calculateBoardPosition(char.row, char.col);
    const charSize = TILE_SIZE * 0.75; // 54px
    
    return {
      position: 'absolute',
      left: pos.left + (TILE_SIZE - charSize) / 2, // center in tile
      top: pos.top + (TILE_SIZE - charSize) / 2,
      width: charSize,
      height: charSize,
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
}: Character3DOverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {characters.map(char => (
        <AnimatedCharacterItem
          key={char.id}
          char={char}
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
