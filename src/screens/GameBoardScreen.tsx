import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {Colors} from '../constants/theme';
import {
  TileData,
  GameCharacter,
  generateDefaultBoard,
  spawnCharacters,
  getValidMoves,
  PLAYER_COLORS,
  BOARD_SIZE,
} from '../types/game';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Assets ───────────────────────────────────────────────────────────────────
const backgroundImg = require('../assets/images/backgrounds/background.png');
const tileFirewall = require('../assets/images/Arena/1.png');
const tilePath = require('../assets/images/Arena/2.png');
const tilePortal = require('../assets/images/Arena/3.png');
const tileStartBase1 = require('../assets/images/Arena/4.png');
const tileStartBase4 = require('../assets/images/Arena/5.png');
const chipCharacter = require('../assets/images/characters/robot_mascot.png');
const glitchyCharacter = require('../assets/images/characters/Glitchy.png');

// ─── Tile size & isometric config ─────────────────────────────────────────────
const TILE_SIZE = Math.floor((SCREEN_WIDTH - 60) / BOARD_SIZE);
const TILE_GAP = 3;

// Map tile type to image
function getTileImage(tile: TileData) {
  switch (tile.type) {
    case 'firewall':
      return tileFirewall;
    case 'path':
      return tilePath;
    case 'portal':
      return tilePortal;
    case 'startBase':
      if (tile.owner === 4) return tileStartBase4;
      return tileStartBase1;
    default:
      return tilePath;
  }
}

// Get character image
function getCharacterImage(type: 'chip' | 'glitchy') {
  return type === 'chip' ? chipCharacter : glitchyCharacter;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function BackIcon({size = 24}: {size?: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DiceIcon({size = 24}: {size?: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 22.08V12M3.27 6.96L12 12l8.73-5.04"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Animated Character ───────────────────────────────────────────────────────
interface AnimCharacterProps {
  character: GameCharacter;
  tileSize: number;
  isSelected: boolean;
  onPress: () => void;
}

function AnimCharacter({character, tileSize, isSelected, onPress}: AnimCharacterProps) {
  const bounceY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    scale.value = withDelay(
      character.playerId * 200,
      withSpring(1, {stiffness: 300, damping: 15}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bounce when selected
  useEffect(() => {
    if (isSelected) {
      bounceY.value = withSequence(
        withTiming(-12, {duration: 300, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 300, easing: Easing.in(Easing.quad)}),
        withTiming(-8, {duration: 250, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 250, easing: Easing.in(Easing.quad)}),
      );
      glowOpacity.value = withTiming(1, {duration: 300});
    } else {
      glowOpacity.value = withTiming(0, {duration: 200});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: bounceY.value},
      {scale: scale.value},
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const charSize = tileSize * 0.7;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.characterContainer,
        {
          width: tileSize,
          height: tileSize,
          left: character.col * (tileSize + TILE_GAP),
          top: character.row * (tileSize + TILE_GAP),
        },
      ]}>
      {/* Selection glow */}
      <Animated.View
        style={[
          styles.characterGlow,
          {
            width: tileSize - 4,
            height: tileSize - 4,
            borderRadius: (tileSize - 4) / 2,
            borderColor: character.color,
            shadowColor: character.color,
          },
          glowStyle,
        ]}
      />
      {/* Character sprite */}
      <Animated.View style={animStyle}>
        <Image
          source={getCharacterImage(character.type)}
          style={{width: charSize, height: charSize}}
          resizeMode="contain"
        />
      </Animated.View>
      {/* Player indicator */}
      <View style={[styles.playerBadge, {backgroundColor: character.color}]}>
        <Text style={styles.playerBadgeText}>P{character.playerId}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tile Component ───────────────────────────────────────────────────────────
interface TileComponentProps {
  tile: TileData;
  tileSize: number;
  isHighlighted: boolean;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}

function TileComponent({tile, tileSize, isHighlighted, isSelected, onPress, delay}: TileComponentProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, {stiffness: 300, damping: 18}));
    opacity.value = withDelay(delay, withTiming(1, {duration: 400}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.tileWrapper,
          {
            width: tileSize,
            height: tileSize,
          },
          isHighlighted && styles.tileHighlighted,
          isSelected && styles.tileSelected,
        ]}>
        <Image
          source={getTileImage(tile)}
          style={styles.tileImage}
          resizeMode="cover"
        />
        {/* Highlight overlay for valid moves */}
        {isHighlighted && (
          <View style={styles.tileHighlightOverlay}>
            <View style={styles.tileHighlightDot} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Game Board ───────────────────────────────────────────────────────────────
interface GameBoardProps {
  board: TileData[][];
  characters: GameCharacter[];
  selectedCharacter: GameCharacter | null;
  validMoves: TileData[];
  onTilePress: (tile: TileData) => void;
  onCharacterPress: (character: GameCharacter) => void;
}

function GameBoard({
  board,
  characters,
  selectedCharacter,
  validMoves,
  onTilePress,
  onCharacterPress,
}: GameBoardProps) {
  const boardWidth = BOARD_SIZE * (TILE_SIZE + TILE_GAP) - TILE_GAP;

  const validMoveIds = useMemo(
    () => new Set(validMoves.map(t => t.id)),
    [validMoves],
  );

  return (
    <View style={styles.boardContainer}>
      {/* Isometric transform wrapper */}
      <View
        style={[
          styles.isometricWrapper,
          {
            width: boardWidth,
            height: boardWidth,
          },
        ]}>
        {/* Tiles */}
        {board.map((row, rowIdx) =>
          row.map((tile, colIdx) => {
            const isHighlighted = validMoveIds.has(tile.id);
            const isSelected =
              selectedCharacter?.row === rowIdx &&
              selectedCharacter?.col === colIdx;
            const delay = (rowIdx * BOARD_SIZE + colIdx) * 80;

            return (
              <View
                key={tile.id}
                style={{
                  position: 'absolute',
                  left: colIdx * (TILE_SIZE + TILE_GAP),
                  top: rowIdx * (TILE_SIZE + TILE_GAP),
                }}>
                <TileComponent
                  tile={tile}
                  tileSize={TILE_SIZE}
                  isHighlighted={isHighlighted}
                  isSelected={isSelected}
                  onPress={() => onTilePress(tile)}
                  delay={delay}
                />
              </View>
            );
          }),
        )}

        {/* Characters */}
        {characters.map(character => (
          <AnimCharacter
            key={character.id}
            character={character}
            tileSize={TILE_SIZE}
            isSelected={selectedCharacter?.id === character.id}
            onPress={() => onCharacterPress(character)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Turn Info Panel ──────────────────────────────────────────────────────────
interface TurnInfoProps {
  currentPlayer: number;
  turnCount: number;
  selectedCharacter: GameCharacter | null;
  onRollDice: () => void;
}

function TurnInfo({currentPlayer, turnCount, selectedCharacter, onRollDice}: TurnInfoProps) {
  const color = PLAYER_COLORS[currentPlayer] || '#22d3ee';

  return (
    <View style={styles.turnInfoContainer}>
      <View style={styles.turnInfoRow}>
        <View style={styles.turnInfoLeft}>
          <View style={[styles.turnDot, {backgroundColor: color}]} />
          <Text style={[styles.turnPlayerText, {color}]}>
            PLAYER {currentPlayer}
          </Text>
        </View>
        <Text style={styles.turnCountText}>Turn {turnCount}</Text>
      </View>

      {selectedCharacter && (
        <Text style={styles.turnHint}>
          Tap a highlighted tile to move{' '}
          {selectedCharacter.type === 'chip' ? 'Chip' : 'Glitchy'}
        </Text>
      )}

      {!selectedCharacter && (
        <Text style={styles.turnHint}>
          Tap your character to select, then move
        </Text>
      )}

      <TouchableOpacity
        style={[styles.diceButton, {backgroundColor: color}]}
        onPress={onRollDice}
        activeOpacity={0.8}>
        <DiceIcon size={20} />
        <Text style={styles.diceButtonText}>End Turn</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Game Board Screen ───────────────────────────────────────────────────
interface GameBoardScreenProps {
  squadSize: number;
  onBack: () => void;
}

export default function GameBoardScreen({squadSize, onBack}: GameBoardScreenProps) {
  const insets = useSafeAreaInsets();

  // Game state
  const [board] = useState<TileData[][]>(() => generateDefaultBoard());
  const [characters, setCharacters] = useState<GameCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<GameCharacter | null>(null);
  const [validMoves, setValidMoves] = useState<TileData[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [turnCount, setTurnCount] = useState(1);

  // Spawn characters on mount
  useEffect(() => {
    const spawned = spawnCharacters(board, squadSize);
    setCharacters(spawned);
  }, [board, squadSize]);

  // Handle character selection
  const handleCharacterPress = useCallback(
    (character: GameCharacter) => {
      // Only allow selecting current player's character
      if (character.playerId !== currentPlayer) {
        Alert.alert('Not Your Turn', `It's Player ${currentPlayer}'s turn!`);
        return;
      }

      if (selectedCharacter?.id === character.id) {
        // Deselect
        setSelectedCharacter(null);
        setValidMoves([]);
      } else {
        // Select and show valid moves
        setSelectedCharacter(character);
        const moves = getValidMoves(board, character.row, character.col);
        setValidMoves(moves);
      }
    },
    [board, currentPlayer, selectedCharacter],
  );

  // Handle tile press for movement
  const handleTilePress = useCallback(
    (tile: TileData) => {
      if (!selectedCharacter) return;

      // Check if it's a valid move
      const isValid = validMoves.some(m => m.id === tile.id);
      if (!isValid) {
        // Deselect if tapping non-valid tile
        setSelectedCharacter(null);
        setValidMoves([]);
        return;
      }

      // Move character
      setCharacters(prev =>
        prev.map(c =>
          c.id === selectedCharacter.id
            ? {...c, row: tile.row, col: tile.col}
            : c,
        ),
      );

      // Handle special tiles
      if (tile.type === 'portal') {
        // Find another portal to teleport to
        const otherPortals: TileData[] = [];
        board.forEach(row =>
          row.forEach(t => {
            if (t.type === 'portal' && t.id !== tile.id) {
              otherPortals.push(t);
            }
          }),
        );
        if (otherPortals.length > 0) {
          const target =
            otherPortals[Math.floor(Math.random() * otherPortals.length)];
          // Delay teleport for visual effect
          setTimeout(() => {
            setCharacters(prev =>
              prev.map(c =>
                c.id === selectedCharacter.id
                  ? {...c, row: target.row, col: target.col}
                  : c,
              ),
            );
            Alert.alert('Portal!', `Teleported to (${target.row}, ${target.col})!`);
          }, 400);
        }
      }

      // Clear selection
      setSelectedCharacter(null);
      setValidMoves([]);
    },
    [board, selectedCharacter, validMoves],
  );

  // End turn
  const handleEndTurn = useCallback(() => {
    setSelectedCharacter(null);
    setValidMoves([]);
    const nextPlayer = currentPlayer >= squadSize ? 1 : currentPlayer + 1;
    setCurrentPlayer(nextPlayer);
    if (nextPlayer === 1) {
      setTurnCount(prev => prev + 1);
    }
  }, [currentPlayer, squadSize]);

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <BackIcon size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ARENA</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Board */}
      <View style={styles.boardSection}>
        <GameBoard
          board={board}
          characters={characters}
          selectedCharacter={selectedCharacter}
          validMoves={validMoves}
          onTilePress={handleTilePress}
          onCharacterPress={handleCharacterPress}
        />
      </View>

      {/* Turn Info */}
      <View style={[styles.bottomPanel, {paddingBottom: insets.bottom + 16}]}>
        <TurnInfo
          currentPlayer={currentPlayer}
          turnCount={turnCount}
          selectedCharacter={selectedCharacter}
          onRollDice={handleEndTurn}
        />
      </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 22,
    color: '#fff',
    letterSpacing: 6,
    textShadowColor: Colors.accent,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  // Board
  boardSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Isometric perspective transform
    transform: [
      {perspective: 900},
      {rotateX: '50deg'},
      {rotateZ: '-45deg'},
    ],
  },
  isometricWrapper: {
    position: 'relative',
  },
  // Tiles
  tileWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileHighlighted: {
    borderWidth: 2,
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  tileHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileHighlightDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(74, 222, 128, 0.7)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Characters
  characterContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  characterGlow: {
    position: 'absolute',
    borderWidth: 2,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  playerBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  playerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  // Bottom panel
  bottomPanel: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(15, 16, 32, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 242, 255, 0.15)',
  },
  turnInfoContainer: {
    gap: 10,
  },
  turnInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turnInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  turnPlayerText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  turnCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  turnHint: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  diceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 9999,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  diceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
