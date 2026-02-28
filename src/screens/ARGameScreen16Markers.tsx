import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroAnimations,
} from '@reactvision/react-viro';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';

// ─── Game Configuration ───────────────────────────────────────────────────────
const GAME_MARKERS = [
  'start',
  'path1',
  'path2',
  'path3',
  'path4',
  'path5',
  'path6',
  'path7',
  'path8',
  'path9',
  'path10',
  'arena',
  'firewall',
  'portal',
  'treasure',
  'goal',
] as const;

type MarkerName = typeof GAME_MARKERS[number];

// Valid moves map (adjacency list for game board)
const VALID_MOVES: Record<MarkerName, MarkerName[]> = {
  start: ['path1'],
  path1: ['start', 'path2'],
  path2: ['path1', 'arena'],
  arena: ['path2', 'path3'],
  path3: ['arena', 'path4'],
  path4: ['path3', 'firewall'],
  firewall: ['path4', 'path5'],
  path5: ['firewall', 'path6'],
  path6: ['path5', 'portal'],
  portal: ['path6', 'path7'],
  path7: ['portal', 'path8'],
  path8: ['path7', 'path9'],
  path9: ['path8', 'path10'],
  path10: ['path9', 'treasure'],
  treasure: ['path10', 'goal'],
  goal: [],
};

// Define AR tracking targets for all 16 markers
ViroARTrackingTargets.createTargets({
  start: {
    source: require('../assets/images/markers/start-base1.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path1: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path2: {
    source: require('../assets/images/markers/firewall.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path3: {
    source: require('../assets/images/markers/portal.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  // For now, reuse existing markers for paths 4-10
  // In production, you'd have unique images for each
  path4: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path5: {
    source: require('../assets/images/markers/firewall.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path6: {
    source: require('../assets/images/markers/portal.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path7: {
    source: require('../assets/images/markers/start-base1.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path8: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path9: {
    source: require('../assets/images/markers/firewall.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  path10: {
    source: require('../assets/images/markers/portal.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  arena: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  firewall: {
    source: require('../assets/images/markers/firewall.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  portal: {
    source: require('../assets/images/markers/portal.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  treasure: {
    source: require('../assets/images/markers/start-base1.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
  goal: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
    type: 'Image',
  },
});

// Define animations
ViroAnimations.registerAnimations({
  jump: {
    properties: {
      positionY: '+=0.3',
    },
    duration: 500,
    easing: 'EaseOut',
  },
  land: {
    properties: {
      positionY: '-=0.3',
    },
    duration: 500,
    easing: 'EaseIn',
  },
  idle: {
    properties: {
      rotateY: '+=360',
    },
    duration: 4000,
    easing: 'Linear',
  },
});

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
  activeMarker: MarkerName;
  visibleMarkers: Set<string>;
  onMarkerFound: (markerName: string) => void;
  onMarkerLost: (markerName: string) => void;
  isMoving: boolean;
}

function ARScene({
  activeMarker,
  visibleMarkers,
  onMarkerFound,
  onMarkerLost,
  isMoving,
}: ARSceneProps) {
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

      {/* Render all 16 markers */}
      {GAME_MARKERS.map(markerName => (
        <ViroARImageMarker
          key={markerName}
          target={markerName}
          onAnchorFound={() => onMarkerFound(markerName)}
          onAnchorRemoved={() => onMarkerLost(markerName)}>
          
          {/* Only render character on active marker */}
          {activeMarker === markerName && (
            <Viro3DObject
              source={require('../assets/models/chip_character.glb')}
              type="GLB"
              position={[-0.01, 0.05, 0]}
              scale={modelScale}
              rotation={[0, 0, 0]}
              animation={{
                name: isMoving ? 'jump' : 'idle',
                run: true,
                loop: !isMoving,
              }}
            />
          )}
          
          {/* Visual indicator for visible but inactive markers */}
          {visibleMarkers.has(markerName) && activeMarker !== markerName && (
            <ViroAmbientLight color="#00FF00" intensity={100} />
          )}
        </ViroARImageMarker>
      ))}
    </ViroARScene>
  );
}

// ─── Main Game Screen ─────────────────────────────────────────────────────────
interface ARGameScreen16MarkersProps {
  onBack: () => void;
}

export default function ARGameScreen16Markers({onBack}: ARGameScreen16MarkersProps) {
  const insets = useSafeAreaInsets();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Game state
  const [activeMarker, setActiveMarker] = React.useState<MarkerName>('start');
  const [visibleMarkers, setVisibleMarkers] = React.useState<Set<string>>(new Set());
  const [isMoving, setIsMoving] = React.useState(false);
  const [markerDetected, setMarkerDetected] = React.useState(false);
  const [statusText, setStatusText] = React.useState('SCANNING...');
  const [statusSubtext, setStatusSubtext] = React.useState('LOOKING FOR START MARKER');

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

  // Handle marker found
  const handleMarkerFound = React.useCallback((markerName: string) => {
    console.log(`Marker found: ${markerName}`);
    setVisibleMarkers(prev => {
      const newSet = new Set(prev);
      newSet.add(markerName);
      return newSet;
    });
    
    if (!markerDetected) {
      setMarkerDetected(true);
      setStatusText('MARKERS DETECTED');
      setStatusSubtext(`${visibleMarkers.size + 1} MARKERS VISIBLE`);
    }
  }, [markerDetected, visibleMarkers.size]);

  // Handle marker lost
  const handleMarkerLost = React.useCallback((markerName: string) => {
    console.log(`Marker lost: ${markerName}`);
    setVisibleMarkers(prev => {
      const newSet = new Set(prev);
      newSet.delete(markerName);
      return newSet;
    });
    
    setTimeout(() => {
      setVisibleMarkers(current => {
        if (current.size === 0) {
          setMarkerDetected(false);
          setStatusText('SCANNING...');
          setStatusSubtext('LOOKING FOR MARKERS');
        } else {
          setStatusSubtext(`${current.size} MARKERS VISIBLE`);
        }
        return current;
      });
    }, 100);
  }, []);

  // Move character to target marker
  const moveToMarker = React.useCallback((targetMarker: MarkerName) => {
    if (isMoving) {
      Alert.alert('Wait', 'Character is already moving!');
      return;
    }

    // Check if target marker is visible
    if (!visibleMarkers.has(targetMarker)) {
      Alert.alert('Invalid Move', `${targetMarker} marker is not visible!`);
      return;
    }

    // Check if move is valid according to game rules
    const validMoves = VALID_MOVES[activeMarker];
    if (!validMoves.includes(targetMarker)) {
      Alert.alert(
        'Invalid Move',
        `Cannot move from ${activeMarker} to ${targetMarker}.\nValid moves: ${validMoves.join(', ')}`
      );
      return;
    }

    // Execute move
    setIsMoving(true);
    setStatusText('MOVING...');
    setStatusSubtext(`${activeMarker} → ${targetMarker}`);

    // Simulate movement animation duration
    setTimeout(() => {
      setActiveMarker(targetMarker);
      setIsMoving(false);
      setStatusText('CHARACTER MOVED');
      setStatusSubtext(`Now at: ${targetMarker}`);

      // Check win condition
      if (targetMarker === 'goal') {
        setTimeout(() => {
          Alert.alert('🎉 Victory!', 'You reached the goal!', [
            {text: 'Play Again', onPress: handleReset},
            {text: 'Exit', onPress: onBack},
          ]);
        }, 500);
      }
    }, 1000);
  }, [activeMarker, isMoving, visibleMarkers, onBack]);

  // Reset game
  const handleReset = React.useCallback(() => {
    setActiveMarker('start');
    setIsMoving(false);
    setStatusText('GAME RESET');
    setStatusSubtext('Find START marker');
  }, []);

  // Get available moves
  const getAvailableMoves = React.useCallback(() => {
    const validMoves = VALID_MOVES[activeMarker];
    const visibleValidMoves = validMoves.filter(marker => visibleMarkers.has(marker));
    return visibleValidMoves;
  }, [activeMarker, visibleMarkers]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ViroReact AR Scene */}
      <ViroARSceneNavigator
        autofocus={true}
        numberOfTrackedImages={10}
        initialScene={{
          scene: ARScene,
          passProps: {
            activeMarker,
            visibleMarkers,
            onMarkerFound: handleMarkerFound,
            onMarkerLost: handleMarkerLost,
            isMoving,
          },
        }}
        style={StyleSheet.absoluteFill}
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

      {/* Game Info Panel */}
      <View style={[styles.gameInfo, {bottom: insets.bottom + 120}]}>
        <Text style={styles.gameInfoTitle}>Current Position</Text>
        <Text style={styles.gameInfoValue}>{activeMarker.toUpperCase()}</Text>
        
        <Text style={styles.gameInfoTitle}>Available Moves</Text>
        {getAvailableMoves().length > 0 ? (
          <View style={styles.movesContainer}>
            {getAvailableMoves().map(marker => (
              <TouchableOpacity
                key={marker}
                style={styles.moveButton}
                onPress={() => moveToMarker(marker)}
                disabled={isMoving}>
                <Text style={styles.moveButtonText}>{marker}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noMovesText}>
            {VALID_MOVES[activeMarker].length === 0
              ? '🎉 Goal Reached!'
              : 'No visible moves - find more markers!'}
          </Text>
        )}
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Visible Markers: {visibleMarkers.size}/16
        </Text>
        <Text style={styles.debugText}>
          Active: {activeMarker}
        </Text>
        <Text style={styles.debugText}>
          Moving: {isMoving ? 'Yes' : 'No'}
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
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Outfit-ExtraBold',
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
  gameInfo: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gameInfoValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Outfit-ExtraBold',
    color: '#4ade80',
    marginBottom: 16,
  },
  movesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  moveButton: {
    backgroundColor: '#24b8cf',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
    color: '#fff',
  },
  noMovesText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  debugInfo: {
    position: 'absolute',
    top: 120,
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
});
