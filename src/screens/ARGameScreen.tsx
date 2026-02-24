import React, {useState} from 'react';
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
  ViroSpotLight,
  ViroARPlaneSelector,
  ViroNode,
} from '@reactvision/react-viro';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// ─── AR Scene Component ───────────────────────────────────────────────────────
function ARGameScene() {
  const [text, setText] = useState('Tap to place objects!');

  const onInitialized = (state: any, _reason: any) => {
    if (state === 3) {
      // ViroARTrackingState.TRACKING_NORMAL
      setText('AR is ready! Look for a surface');
    } else if (state === 2) {
      // ViroARTrackingState.TRACKING_LIMITED
      setText('Limited tracking - move your device');
    }
  };

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      {/* Ambient Light */}
      <ViroAmbientLight color="#FFFFFF" intensity={200} />

      {/* Spotlight */}
      <ViroSpotLight
        innerAngle={5}
        outerAngle={45}
        direction={[0, -1, -0.2]}
        position={[0, 3, 0]}
        color="#FFFFFF"
        castsShadow={true}
        intensity={500}
      />

      {/* AR Text */}
      <ViroText
        text={text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.arText}
      />

      {/* AR Plane Selector - detects horizontal surfaces */}
      <ViroARPlaneSelector>
        <ViroNode position={[0, 0, 0]}>
          {/* 3D Box on detected plane */}
          <ViroBox
            position={[0, 0.1, 0]}
            scale={[0.2, 0.2, 0.2]}
            materials={['grid']}
            onClick={() => setText('Box clicked!')}
          />

          {/* Another box */}
          <ViroBox
            position={[0.3, 0.1, 0]}
            scale={[0.15, 0.15, 0.15]}
            materials={['grid']}
            onClick={() => setText('Second box clicked!')}
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

      {/* AR Scene Navigator */}
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARGameScene,
        }}
        style={styles.arScene}
      />

      {/* Back Button Overlay */}
      <View style={[styles.backButtonContainer, {top: insets.top + 14}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions Overlay */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Move your device to detect surfaces
        </Text>
        <Text style={styles.instructionsSubtext}>
          Objects will appear on detected planes
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
  arText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlignVertical: 'center',
    textAlign: 'center',
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
