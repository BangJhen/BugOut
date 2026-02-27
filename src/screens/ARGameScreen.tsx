import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroARImageMarker,
  ViroARTrackingTargets,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
} from '@reactvision/react-viro';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────
function CloseIcon({size = 24}: {size?: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraIcon({size = 24}: {size?: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Register AR Image Target
ViroARTrackingTargets.createTargets({
  arena: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.2, // 20cm in meters
  },
});

// ─── AR Scene Component ───────────────────────────────────────────────────────
interface ARGameSceneProps {
  onMarkerFound: () => void;
  onMarkerLost: () => void;
}

function ARGameScene({onMarkerFound, onMarkerLost}: ARGameSceneProps) {
  const modelScale: [number, number, number] = [0.15, 0.15, 0.15];

  const handleAnchorFound = () => {
    console.log('Arena marker found!');
    onMarkerFound();
  };

  const handleAnchorRemoved = () => {
    console.log('Arena marker lost!');
    onMarkerLost();
  };

  return (
    <ViroARScene>
      {/* Lighting */}
      <ViroAmbientLight color="#FFFFFF" intensity={300} />
      <ViroDirectionalLight
        color="#FFFFFF"
        direction={[0, -1, -0.2]}
        intensity={500}
        castsShadow={true}
      />

      {/* AR Image Marker Detection */}
      <ViroARImageMarker
        target="arena"
        onAnchorFound={handleAnchorFound}
        onAnchorRemoved={handleAnchorRemoved}>
        {/* 3D Character Model - Positioned directly on marker */}
        <Viro3DObject
          source={require('../assets/models/chip_character.glb')}
          type="GLB"
          position={[0, 0, 0]}
          scale={modelScale}
          rotation={[0, 0, 0]}
          onLoadStart={() => console.log('Loading 3D model...')}
          onLoadEnd={() => console.log('3D model loaded!')}
          onError={(error) => console.error('3D model error:', error)}
        />
      </ViroARImageMarker>
    </ViroARScene>
  );
}

// ─── Main AR Game Screen ──────────────────────────────────────────────────────
interface ARGameScreenProps {
  onBack: () => void;
}

export default function ARGameScreen({onBack}: ARGameScreenProps) {
  const insets = useSafeAreaInsets();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [markerDetected, setMarkerDetected] = React.useState(false);
  const [statusText, setStatusText] = React.useState('SCANNING...');
  const [statusSubtext, setStatusSubtext] = React.useState('LOOKING FOR BOARD');

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleMarkerFound = () => {
    setMarkerDetected(true);
    setStatusText('BOARD DETECTED');
    setStatusSubtext('CHARACTER LOADED');
  };

  const handleMarkerLost = () => {
    setMarkerDetected(false);
    setStatusText('SCANNING...');
    setStatusSubtext('LOOKING FOR BOARD');
  };

  const handleConfirmBoard = () => {
    if (markerDetected) {
      console.log('Board confirmed! Starting game...');
      // TODO: Navigate to game screen or start game logic
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* AR Camera View */}
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARGameScene,
          passProps: {
            onMarkerFound: handleMarkerFound,
            onMarkerLost: handleMarkerLost,
          },
        }}
        style={styles.arScene}
      />

      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 14}]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <CloseIcon size={16} />
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Animated.View 
              style={[
                styles.statusDot, 
                {
                  transform: [{scale: pulseAnim}],
                  backgroundColor: markerDetected ? '#4ade80' : '#22d3ee',
                }
              ]} 
            />
            <Text style={[
              styles.statusText,
              {color: markerDetected ? '#4ade80' : '#22d3ee'}
            ]}>
              {statusText}
            </Text>
          </View>
          <Text style={styles.statusSubtext}>{statusSubtext}</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}>
          <CameraIcon size={20} />
        </TouchableOpacity>
      </View>

      {/* Scanning Frame */}
      <View style={styles.scanningFrame}>
        {/* Top Left Corner */}
        <View style={[styles.corner, styles.cornerTopLeft]} />
        {/* Top Right Corner */}
        <View style={[styles.corner, styles.cornerTopRight]} />
        {/* Bottom Left Corner */}
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        {/* Bottom Right Corner */}
        <View style={[styles.corner, styles.cornerBottomRight]} />
      </View>

      {/* Decorative Dots */}
      <View style={styles.dot1} />
      <View style={styles.dot2} />
      <View style={styles.dot3} />

      {/* Confirm Button */}
      <View style={[styles.buttonContainer, {bottom: insets.bottom + 40}]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !markerDetected && styles.confirmButtonDisabled
          ]}
          activeOpacity={0.85}
          onPress={handleConfirmBoard}
          disabled={!markerDetected}>
          <Text style={styles.confirmButtonText}>
            {markerDetected ? 'Confirm Board' : 'Point Camera at Board'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252748',
  },
  arScene: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 16, 32, 0.3)',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Outfit-ExtraBold',
    color: '#22d3ee',
    letterSpacing: 4,
    textShadowColor: 'rgba(34, 211, 238, 0.8)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  statusSubtext: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scanningFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 288,
    height: 442,
    marginLeft: -144,
    marginTop: -221,
  },
  corner: {
    position: 'absolute',
    width: 48,
    height: 48,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 10,
    borderLeftWidth: 10,
    borderColor: '#24b8cf',
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderColor: '#24b8cf',
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderColor: '#24b8cf',
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderColor: '#24b8cf',
    borderBottomRightRadius: 16,
  },
  dot1: {
    position: 'absolute',
    top: '40%',
    left: '35%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22d3ee',
  },
  dot2: {
    position: 'absolute',
    bottom: '35%',
    right: '30%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  dot3: {
    position: 'absolute',
    top: '50%',
    right: '25%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22d3ee',
    opacity: 0.5,
  },
  buttonContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  confirmButton: {
    width: '100%',
    maxWidth: 382,
    height: 72,
    backgroundColor: '#24b8cf',
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
    color: '#fff',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(36, 184, 207, 0.3)',
    opacity: 0.5,
  },
});
