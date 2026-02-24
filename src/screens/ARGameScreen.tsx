import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroText,
  ViroBox,
  ViroAmbientLight,
  ViroARPlaneSelector,
  ViroNode,
} from '@reactvision/react-viro';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// ─── AR Scene Component ───────────────────────────────────────────────────────
function ARGameScene() {
  const [text, setText] = React.useState('Initializing AR...');

  const onInitialized = (state: any, _reason: any) => {
    if (state === 3) {
      setText('AR Ready! Look for a surface');
    } else if (state === 2) {
      setText('Limited tracking - move device');
    }
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroAmbientLight color="#FFFFFF" intensity={200} />

      <ViroText
        text={text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        width={4}
        height={1}
      />

      <ViroARPlaneSelector>
        <ViroNode position={[0, 0, 0]}>
          <ViroBox
            position={[0, 0.1, 0]}
            scale={[0.2, 0.2, 0.2]}
            onClick={() => setText('Box clicked!')}
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

// ─── Main AR Game Screen ──────────────────────────────────────────────────────
interface ARGameScreenProps {
  onBack: () => void;
}

export default function ARGameScreen({onBack}: ARGameScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARGameScene,
        }}
        style={styles.arScene}
      />

      <View style={[styles.backButtonContainer, {top: insets.top + 14}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Move your device to detect surfaces
        </Text>
        <Text style={styles.instructionsSubtext}>
          Tap the box to interact
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  arScene: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  instructionsSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
});
