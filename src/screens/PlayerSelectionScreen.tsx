import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../constants/theme';
import Svg, {Path} from 'react-native-svg';

const backgroundImg = require('../assets/images/background.png');
const chipBlue = require('../assets/images/chip-blue.png');
const chipRed = require('../assets/images/chip-red.png');
const chipYellow = require('../assets/images/chip-yellow.png');
const chipGreen = require('../assets/images/chip-green.png');

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function BackIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InfoIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16v-4M12 8h.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Player Data ──────────────────────────────────────────────────────────────
const PLAYERS = [
  {id: 1, name: 'PLAYER 1', color: '#22d3ee', image: chipBlue},
  {id: 2, name: 'PLAYER 2', color: '#ef4444', image: chipRed},
  {id: 3, name: 'PLAYER 3', color: '#eab308', image: chipYellow},
  {id: 4, name: 'PLAYER 4', color: '#22c55e', image: chipGreen},
];

// ─── Header ───────────────────────────────────────────────────────────────────
interface HeaderProps {
  insets: {top: number};
  onBack: () => void;
}

function Header({insets, onBack}: HeaderProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(100, withSpring(1));
    translateY.value = withDelay(100, withSpring(0, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.header, {paddingTop: insets.top + 8}, animStyle]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
        <BackIcon size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Play Game</Text>
      <TouchableOpacity style={styles.infoButton} activeOpacity={0.7}>
        <InfoIcon size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Squad Size Toggle ────────────────────────────────────────────────────────
interface SquadSizeToggleProps {
  selectedSize: number;
  onSizeChange: (size: number) => void;
}

function SquadSizeToggle({selectedSize, onSizeChange}: SquadSizeToggleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(200, withSpring(1));
    translateY.value = withDelay(200, withSpring(0, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.squadSection, animStyle]}>
      <Text style={styles.squadTitle}>SQUAD SIZE</Text>
      <View style={styles.toggleContainer}>
        {[1, 2, 3, 4].map(size => (
          <TouchableOpacity
            key={size}
            style={[
              styles.toggleButton,
              selectedSize === size && styles.toggleButtonActive,
            ]}
            onPress={() => onSizeChange(size)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.toggleText,
                selectedSize === size && styles.toggleTextActive,
              ]}>
              {size} Player{size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Information Modal ────────────────────────────────────────────────────────
interface InformationModalProps {
  visible: boolean;
  onContinue: () => void;
}

function InformationModal({visible, onContinue}: InformationModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}>
      <View style={styles.infoModalOverlay}>
        <TouchableOpacity
          style={styles.infoModalBackdrop}
          activeOpacity={1}
          onPress={onContinue}
        />
        <View style={[styles.infoModalContent, {marginBottom: insets.bottom + 20}]}>
          {/* Title */}
          <Text style={styles.infoModalTitle}>INFORMATION</Text>
          
          {/* Message */}
          <Text style={styles.infoModalMessage}>
            Please arrange the board properly,{"\n"}
            then scan it here to begin the game.
          </Text>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.infoModalButton}
            onPress={onContinue}
            activeOpacity={0.85}>
            <Text style={styles.infoModalButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────
interface PlayerCardProps {
  player: typeof PLAYERS[0];
  delay: number;
  shouldExit?: boolean;
}

function PlayerCard({player, delay, shouldExit = false}: PlayerCardProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (shouldExit) {
      // Fade out animation
      opacity.value = withSpring(0, {stiffness: 200, damping: 22});
      scale.value = withSpring(0.8, {stiffness: 200, damping: 22});
    } else {
      // Fade in animation
      opacity.value = withDelay(delay, withSpring(1));
      scale.value = withDelay(delay, withSpring(1, {stiffness: 200, damping: 22}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldExit]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View
      style={[
        styles.playerCard,
        {borderColor: player.color},
        animStyle,
      ]}>
      <Text style={styles.playerName}>{player.name}</Text>
      <View style={styles.playerImageContainer}>
        <Image source={player.image} style={styles.playerImage} resizeMode="contain" />
      </View>
    </Animated.View>
  );
}

// ─── Main Player Selection Screen ─────────────────────────────────────────────
interface PlayerSelectionScreenProps {
  onBack: () => void;
  onContinue: (squadSize: number) => void;
}

export default function PlayerSelectionScreen({onBack, onContinue}: PlayerSelectionScreenProps) {
  const [squadSize, setSquadSize] = useState(1);
  const [visiblePlayers, setVisiblePlayers] = useState(1);
  const [exitingPlayers, setExitingPlayers] = useState<number[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const prevSquadSizeRef = useRef(1);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const prevSize = prevSquadSizeRef.current;
    
    if (squadSize < prevSize) {
      // Squad size decreased - trigger exit animation for removed players
      const playersToRemove = [];
      for (let i = squadSize; i < prevSize; i++) {
        playersToRemove.push(i + 1); // player IDs are 1-indexed
      }
      setExitingPlayers(playersToRemove);
      
      // Wait for exit animation to complete before updating visible players
      setTimeout(() => {
        setVisiblePlayers(squadSize);
        setExitingPlayers([]);
      }, 300); // Match animation duration
    } else {
      // Squad size increased - show new players immediately
      setVisiblePlayers(squadSize);
    }
    
    prevSquadSizeRef.current = squadSize;
  }, [squadSize]);

  const handleContinuePress = () => {
    setShowInfoModal(true);
  };

  const handleInfoModalContinue = () => {
    setShowInfoModal(false);
    onContinue(squadSize);
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Header insets={insets} onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 120}]}
        showsVerticalScrollIndicator={false}>
        
        <SquadSizeToggle selectedSize={squadSize} onSizeChange={setSquadSize} />

        <View style={styles.playersGrid}>
          {PLAYERS.slice(0, visiblePlayers).map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              delay={300 + index * 100}
              shouldExit={exitingPlayers.includes(player.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Information Modal */}
      <InformationModal
        visible={showInfoModal}
        onContinue={handleInfoModalContinue}
      />

      {/* Continue Button */}
      <View style={[styles.bottomSection, {paddingBottom: insets.bottom + 24}]}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress} activeOpacity={0.85}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,242,255,0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
    lineHeight: 20,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  // Squad Size
  squadSection: {
    marginBottom: 40,
  },
  squadTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31,41,55,0.5)',
    borderRadius: 9999,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  // Players Grid
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  playerCard: {
    width: '47%',
    backgroundColor: 'rgba(31,41,55,0.8)',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
  },
  playerName: {
    fontWeight: '700',
    fontSize: 14,
    color: 'white',
    letterSpacing: 1,
    marginBottom: 16,
  },
  playerImageContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  // Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(15,16,32,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,242,255,0.2)',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontWeight: '700',
    fontSize: 20,
    color: 'white',
    letterSpacing: 0.5,
  },
  // Information Modal
  infoModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  infoModalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'rgba(31,41,55,0.95)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#22d3ee',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#22d3ee',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  infoModalTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: 'white',
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoModalMessage: {
    fontWeight: '400',
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  infoModalButton: {
    width: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22d3ee',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  infoModalButtonText: {
    fontWeight: '700',
    fontSize: 18,
    color: 'white',
  },
});
