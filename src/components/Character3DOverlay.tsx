import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  Model,
} from 'react-native-filament';

const chipModel = require('../assets/models/chip_character.glb');
const glitchyModel = require('../assets/models/glitchy_character.glb');

const BOARD_SIZE = 4;
const WORLD_STRIDE = 1.25;
const WORLD_Y = 0.26;

export type FilamentCharacterType = 'chip' | 'glitchy';

export interface Character3DEntry {
  id: string;
  type: FilamentCharacterType;
  row: number;
  col: number;
}

interface Character3DOverlayProps {
  characters: Character3DEntry[];
}

function toWorldPosition(row: number, col: number): [number, number, number] {
  const half = (BOARD_SIZE - 1) / 2;
  const x = (col - half) * WORLD_STRIDE;
  const z = (row - half) * WORLD_STRIDE;
  return [x, WORLD_Y, z];
}

export default function Character3DOverlay({
  characters,
}: Character3DOverlayProps) {
  const sceneModels = useMemo(
    () =>
      characters.map(char => {
        const source = char.type === 'chip' ? chipModel : glitchyModel;
        const rotate: [number, number, number] =
          char.type === 'chip' ? [0.12, 0.72, 0] : [0.08, 1.2, 0];
        const translate = toWorldPosition(char.row, char.col);
        const scale = char.type === 'chip' ? 1.2 : 1.25;

        return {
          id: char.id,
          source,
          rotate,
          translate,
          scale,
        };
      }),
    [characters],
  );

  return (
    <View style={styles.overlay} pointerEvents="none">
      <FilamentScene>
        <FilamentView style={styles.sceneView} pointerEvents="none">
          <DefaultLight />
          <Camera
            cameraPosition={[0, 3.2, 5.1]}
            cameraTarget={[0, 0, 0]}
            cameraUp={[0, 1, 0]}
          />

          {sceneModels.map(model => (
            <Model
              key={model.id}
              source={model.source}
              rotate={model.rotate}
              translate={model.translate}
              scale={[model.scale, model.scale, model.scale]}
              transformToUnitCube
              multiplyWithCurrentTransform={false}
            />
          ))}
        </FilamentView>
      </FilamentScene>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  sceneView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
