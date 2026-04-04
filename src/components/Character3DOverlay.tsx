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

const STAGE_SPACING = 1.8;
const STAGE_Y = 0.45;

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

function toStagePosition(index: number, count: number): [number, number, number] {
  const half = (count - 1) / 2;
  const x = (index - half) * STAGE_SPACING;
  return [x, STAGE_Y, 0];
}

export default function Character3DOverlay({
  characters,
}: Character3DOverlayProps) {
  const sceneModels = useMemo(
    () =>
      characters.map((char, idx) => {
        const source = char.type === 'chip' ? chipModel : glitchyModel;
        const rotate: [number, number, number] =
          char.type === 'chip' ? [0.18, 0.9, 0] : [0.14, 1.35, 0];
        const translate = toStagePosition(idx, characters.length);
        const scale = char.type === 'chip' ? 1.75 : 1.85;

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
            cameraPosition={[0, 1.25, 4.6]}
            cameraTarget={[0, 0.35, 0]}
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
