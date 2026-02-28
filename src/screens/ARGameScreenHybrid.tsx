import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  ViroARSceneNavigator,
  ViroARScene,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroNode,
} from '@reactvision/react-viro';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {runOnJS} from 'react-native-reanimated';
import {MarkerTracker, TrackedMarker} from '../utils/markerTracking';
import {MarkerDetectionResult} from '../utils/markerDetectionMLKit';
import {screenToWorldCoordinates} from '../utils/markerDetection';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Marker detection configuration
const DETECTION_INTERVAL = 3; // Process every 3rd frame for performance
let frameCount = 0;

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

// ─── AR Scene Component ───────────────────────────────────────────────────────
interface ARSceneProps {
  trackedMarkers: TrackedMarker[];
}

function ARScene({trackedMarkers}: ARSceneProps) {
  const modelScale: [number, number, number] = [0.15, 0.15, 0.15];

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

      {/* Render 3D characters for tracked markers */}
      {trackedMarkers.map(marker => (
        <ViroNode
          key={marker.markerName}
          position={[marker.position.x, marker.position.y, marker.position.z]}>
          <Viro3DObject
            source={require('../assets/models/chip_character.glb')}
            type="GLB"
            position={[0, 0.05, 0]}
            scale={modelScale}
            rotation={[0, 0, 0]}
          />
        </ViroNode>
      ))}
    </ViroARScene>
  );
}

// ─── Main Hybrid AR Screen ────────────────────────────────────────────────────
interface ARGameScreenHybridProps {
  onBack: () => void;
}

export default function ARGameScreenHybrid({onBack}: ARGameScreenHybridProps) {
  const insets = useSafeAreaInsets();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Camera setup
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  
  // State
  const [markerDetected, setMarkerDetected] = React.useState(false);
  const [statusText, setStatusText] = React.useState('SCANNING...');
  const [statusSubtext, setStatusSubtext] = React.useState('LOOKING FOR BOARD');
  const [trackedMarkers, setTrackedMarkers] = React.useState<TrackedMarker[]>([]);
  
  // Marker tracker instance
  const markerTracker = React.useRef(new MarkerTracker()).current;

  // Request camera permission on mount
  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Pulse animation
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

  // Process detected markers and update tracking
  const processDetections = React.useCallback((detections: MarkerDetectionResult[]) => {
    const updatedMarkers: TrackedMarker[] = [];
    
    // Update each detected marker with Kalman filter
    detections.forEach(detection => {
      // Convert screen coordinates to AR world coordinates
      const worldPos = screenToWorldCoordinates(
        detection.center.x,
        detection.center.y,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
      );
      
      // Update marker with Kalman filter for smooth tracking
      const tracked = markerTracker.updateMarker(
        detection.markerName,
        worldPos,
        detection.confidence
      );
      
      updatedMarkers.push(tracked);
    });
    
    // Remove markers that are no longer detected
    const detectedNames = new Set(detections.map(d => d.markerName));
    markerTracker.getTrackedMarkers().forEach(marker => {
      if (!detectedNames.has(marker.markerName as any)) {
        markerTracker.removeMarker(marker.markerName);
      }
    });
    
    // Update UI
    setTrackedMarkers(updatedMarkers);
    if (updatedMarkers.length > 0) {
      setMarkerDetected(true);
      setStatusText('BOARD DETECTED');
      setStatusSubtext(`${updatedMarkers.length} MARKER${updatedMarkers.length > 1 ? 'S' : ''} TRACKED`);
    } else {
      setMarkerDetected(false);
      setStatusText('SCANNING...');
      setStatusSubtext('LOOKING FOR BOARD');
    }
  }, [markerTracker]);

  // Frame processor for marker detection
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // Process every Nth frame for performance
    frameCount++;
    if (frameCount % DETECTION_INTERVAL !== 0) {
      return;
    }
    
    // Simulate marker detection for now
    // In production, this would analyze the frame buffer
    // and detect actual marker patterns
    
    // For testing: Simulate random marker detection
    const simulatedDetections: MarkerDetectionResult[] = [];
    
    // Randomly detect markers for testing (remove in production)
    if (Math.random() > 0.7) {
      const markerNames: Array<'arena' | 'firewall' | 'portal' | 'startBase'> = 
        ['arena', 'firewall', 'portal', 'startBase'];
      const randomMarker = markerNames[Math.floor(Math.random() * markerNames.length)];
      
      simulatedDetections.push({
        markerName: randomMarker,
        bounds: {
          x: SCREEN_WIDTH * 0.3,
          y: SCREEN_HEIGHT * 0.4,
          width: 100,
          height: 100,
        },
        confidence: 0.85,
        center: {
          x: SCREEN_WIDTH * 0.5,
          y: SCREEN_HEIGHT * 0.5,
        },
      });
    }
    
    // Process detections on JS thread
    if (simulatedDetections.length > 0) {
      runOnJS(processDetections)(simulatedDetections);
    }
    
    // TODO: Replace simulation with actual detection:
    // const detections = detectMarkersInFrame(frame, frame.width, frame.height);
    // runOnJS(processDetections)(detections);
  }, [processDetections]);

  const handleReset = () => {
    console.log('Reset button pressed');
    markerTracker.reset();
    setTrackedMarkers([]);
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

  // Show loading if no camera device
  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  // Show permission request if needed
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Vision Camera for marker detection */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />

      {/* ViroReact AR overlay for 3D rendering */}
      <View style={styles.arOverlay} pointerEvents="none">
        <ViroARSceneNavigator
          autofocus={true}
          initialScene={{
            scene: ARScene,
            passProps: {
              trackedMarkers: trackedMarkers,
            },
          }}
          style={styles.arScene}
        />
      </View>

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

        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleReset}
            activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M1 4v6h6M23 20v-6h-6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanning Frame */}
      <View style={styles.scanningFrame}>
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
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

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Tracked Markers: {trackedMarkers.length}
        </Text>
        <Text style={styles.debugText}>
          Mode: Vision Camera + ViroReact Hybrid
        </Text>
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
  arOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
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
  rightButtons: {
    flexDirection: 'row',
    gap: 8,
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
  debugInfo: {
    position: 'absolute',
    bottom: 140,
    left: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Outfit-Regular',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#24b8cf',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
});
