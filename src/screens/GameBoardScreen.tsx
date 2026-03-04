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
  StartBase,
  generateDefaultBoard,
  spawnCharacters,
  getValidMoves,
  PLAYER_COLORS,
  BOARD_SIZE,
  START_BASES,
} from '../types/game';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Assets ───────────────────────────────────────────────────────────────────
const backgroundImg = require('../assets/images/backgrounds/background.png');
const tileFirewall = require('../assets/images/Arena/1.png');
const tilePath = require('../assets/images/Arena/2.png');
const tilePortal = require('../assets/images/Arena/3.png');
const tileStartBlue = require('../assets/images/Arena/4.png');
const tileStartGreen = require('../assets/images/Arena/5.png');
const chipCharacter = require('../assets/images/characters/robot_mascot.png');
const glitchyCharacter = require('../assets/images/characters/Glitchy.png');

// ─── Board dimensions ─────────────────────────────────────────────────────────
// Smaller tiles to prevent clipping in isometric view
const TILE_SIZE = Math.min(Math.floor((SCREEN_WIDTH * 0.55) / BOARD_SIZE), 60);
const TILE_GAP = 2;
const SB_SIZE = TILE_SIZE * 0.8; // Start bases are slightly smaller
const SB_OFFSET = TILE_SIZE * 0.6; // Offset from grid edge

// Map tile type to image
function getTileImage(tile: TileData) {
  switch (tile.type) {
    case 'firewall':
      return tileFirewall;
    case 'path':
      return tilePath;
    case 'portal':
      return tilePortal;
    default:
      return tilePath;
  }
}

// Start base image based on owner
function getStartBaseImage(owner: number) {
  // We have blue (4.png) and green (5.png)
  // Reuse blue for P1 & P3, green for P2 & P4
  return owner === 2 || owner === 4 ? tileStartGreen : tileStartBlue;
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

// ─── Start Base Position Helper ───────────────────────────────────────────────
function getStartBasePixelPos(sb: StartBase, gridWidth: number) {
  const step = TILE_SIZE + TILE_GAP;
  switch (sb.position) {
    case 'bottom-left':
      return {left: -SB_OFFSET - SB_SIZE, top: (BOARD_SIZE - 1) * step + (TILE_SIZE - SB_SIZE) / 2};
    case 'bottom-right':
      return {left: gridWidth + SB_OFFSET, top: (BOARD_SIZE - 1) * step + (TILE_SIZE - SB_SIZE) / 2};
    case 'top-left':
      return {left: -SB_OFFSET - SB_SIZE, top: (TILE_SIZE - SB_SIZE) / 2};
    case 'top-right':
      return {left: gridWidth + SB_OFFSET, top: (TILE_SIZE - SB_SIZE) / 2};
  }
}

// ─── Character pixel position ─────────────────────────────────────────────────
function getCharacterPixelPos(
  character: GameCharacter,
  gridWidth: number,
) {
  const step = TILE_SIZE + TILE_GAP;
  if (character.onStartBase) {
    const sb = START_BASES.find(s => s.owner === character.playerId);
    if (sb) {
      const pos = getStartBasePixelPos(sb, gridWidth);
      return {
        left: pos.left + (SB_SIZE - TILE_SIZE) / 2,
        top: pos.top + (SB_SIZE - TILE_SIZE) / 2,
      };
    }
  }
  return {
    left: character.col * step,
    top: character.row * step,
  };
}

// ─── Animated Character ───────────────────────────────────────────────────────
interface AnimCharacterProps {
  character: GameCharacter;
  tileSize: number;
  gridWidth: number;
  isSelected: boolean;
  onPress: () => void;
}

function AnimCharacter({character, tileSize, gridWidth, isSelected, onPress}: AnimCharacterProps) {
  const bounceY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const charScale = useSharedValue(0);

  useEffect(() => {
    charScale.value = withDelay(
      character.playerId * 200,
      withSpring(1, {stiffness: 300, damping: 15}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSelected) {
      bounceY.value = withSequence(
        withTiming(-10, {duration: 250, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 250, easing: Easing.in(Easing.quad)}),
        withTiming(-6, {duration: 200, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 200, easing: Easing.in(Easing.quad)}),
      );
      glowOpacity.value = withTiming(1, {duration: 300});
    } else {
      glowOpacity.value = withTiming(0, {duration: 200});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateY: bounceY.value}, {scale: charScale.value}],
  }));

  const glowStyle = useAnimatedStyle(() => ({opacity: glowOpacity.value}));

  const pos = getCharacterPixelPos(character, gridWidth);
  const charImgSize = tileSize * 0.65;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.characterContainer,
        {width: tileSize, height: tileSize, left: pos.left, top: pos.top},
      ]}>
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
      <Animated.View style={animStyle}>
        <Image
          source={getCharacterImage(character.type)}
          style={{width: charImgSize, height: charImgSize}}
          resizeMode="contain"
        />
      </Animated.View>
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
  const tileScale = useSharedValue(0);
  const tileOpacity = useSharedValue(0);

  useEffect(() => {
    tileScale.value = withDelay(delay, withSpring(1, {stiffness: 300, damping: 18}));
    tileOpacity.value = withDelay(delay, withTiming(1, {duration: 400}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: tileScale.value}],
    opacity: tileOpacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.tileWrapper,
          {width: tileSize, height: tileSize},
          isHighlighted && styles.tileHighlighted,
          isSelected && styles.tileSelected,
        ]}>
        <Image source={getTileImage(tile)} style={styles.tileImage} resizeMode="cover" />
        {isHighlighted && (
          <View style={styles.tileHighlightOverlay}>
            <View style={styles.tileHighlightDot} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Start Base Component ─────────────────────────────────────────────────────
interface StartBaseComponentProps {
  startBase: StartBase;
  gridWidth: number;
  isActive: boolean;
  delay: number;
}

function StartBaseComponent({startBase, gridWidth, isActive, delay}: StartBaseComponentProps) {
  const sbScale = useSharedValue(0);
  const sbOpacity = useSharedValue(0);

  useEffect(() => {
    sbScale.value = withDelay(delay, withSpring(1, {stiffness: 300, damping: 18}));
    sbOpacity.value = withDelay(delay, withTiming(1, {duration: 400}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: sbScale.value}],
    opacity: sbOpacity.value,
  }));

  const pos = getStartBasePixelPos(startBase, gridWidth);
  const color = PLAYER_COLORS[startBase.owner];

  return (
    <Animated.View
      style={[
        styles.startBaseWrapper,
        {
          width: SB_SIZE,
          height: SB_SIZE,
          left: pos.left,
          top: pos.top,
          borderColor: color,
          shadowColor: color,
        },
        isActive && {shadowOpacity: 0.8, shadowRadius: 10},
        animStyle,
      ]}>
      <Image
        source={getStartBaseImage(startBase.owner)}
        style={styles.tileImage}
        resizeMode="cover"
      />
      {/* Player color overlay */}
      <View
        style={[
          styles.startBaseOverlay,
          {backgroundColor: color, opacity: 0.15},
        ]}
      />
      {/* Label */}
      <View style={[styles.startBaseLabel, {backgroundColor: color}]}>
        <Text style={styles.startBaseLabelText}>P{startBase.owner}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Game Board ───────────────────────────────────────────────────────────────
interface GameBoardProps {
  board: TileData[][];
  characters: GameCharacter[];
  selectedCharacter: GameCharacter | null;
  validMoves: TileData[];
  squadSize: number;
  onTilePress: (tile: TileData) => void;
  onCharacterPress: (character: GameCharacter) => void;
}

function GameBoard({
  board,
  characters,
  selectedCharacter,
  validMoves,
  squadSize,
  onTilePress,
  onCharacterPress,
}: GameBoardProps) {
  const gridWidth = BOARD_SIZE * (TILE_SIZE + TILE_GAP) - TILE_GAP;
  // Total width includes start bases on both sides
  const totalWidth = gridWidth + 2 * (SB_OFFSET + SB_SIZE) + 20;

  const validMoveIds = useMemo(
    () => new Set(validMoves.map(t => t.id)),
    [validMoves],
  );

  const activeStartBases = START_BASES.filter(sb => sb.owner <= squadSize);

  return (
    <View style={styles.boardContainer}>
      <View
        style={[
          styles.isometricWrapper,
          {width: totalWidth, height: gridWidth + 20},
        ]}>
        {/* Center offset for the grid inside the total wrapper */}
        <View
          style={{
            position: 'absolute',
            left: SB_OFFSET + SB_SIZE + 10,
            top: 10,
            width: gridWidth,
            height: gridWidth,
          }}>
          {/* 4x4 Grid Tiles */}
          {board.map((row, rowIdx) =>
            row.map((tile, colIdx) => {
              const isHighlighted = validMoveIds.has(tile.id);
              const isSelected =
                selectedCharacter?.row === rowIdx &&
                selectedCharacter?.col === colIdx &&
                !selectedCharacter?.onStartBase;
              const delay = (rowIdx * BOARD_SIZE + colIdx) * 60;

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

          {/* Start Bases (outside grid) */}
          {activeStartBases.map((sb, idx) => (
            <StartBaseComponent
              key={sb.id}
              startBase={sb}
              gridWidth={gridWidth}
              isActive={characters.some(
                c => c.playerId === sb.owner && c.onStartBase,
              )}
              delay={BOARD_SIZE * BOARD_SIZE * 60 + idx * 100}
            />
          ))}

          {/* Characters */}
          {characters.map(character => (
            <AnimCharacter
              key={character.id}
              character={character}
              tileSize={TILE_SIZE}
              gridWidth={gridWidth}
              isSelected={selectedCharacter?.id === character.id}
              onPress={() => onCharacterPress(character)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Turn Info Panel ──────────────────────────────────────────────────────────
interface TurnInfoProps {
  currentPlayer: number;
  turnCount: number;
  selectedCharacter: GameCharacter | null;
  onEndTurn: () => void;
}

function TurnInfo({currentPlayer, turnCount, selectedCharacter, onEndTurn}: TurnInfoProps) {
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

      {selectedCharacter ? (
        <Text style={styles.turnHint}>
          {selectedCharacter.onStartBase
            ? 'Tap the entry tile to leave Start Base'
            : `Tap a highlighted tile to move ${selectedCharacter.type === 'chip' ? 'Chip' : 'Glitchy'}`}
        </Text>
      ) : (
        <Text style={styles.turnHint}>
          Tap your character to select, then move
        </Text>
      )}

      <TouchableOpacity
        style={[styles.diceButton, {backgroundColor: color}]}
        onPress={onEndTurn}
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

  const [board] = useState<TileData[][]>(() => generateDefaultBoard());
  const [characters, setCharacters] = useState<GameCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<GameCharacter | null>(null);
  const [validMoves, setValidMoves] = useState<TileData[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [turnCount, setTurnCount] = useState(1);

  // Spawn characters on mount
  useEffect(() => {
    const spawned = spawnCharacters(squadSize);
    setCharacters(spawned);
  }, [squadSize]);

  // Handle character selection
  const handleCharacterPress = useCallback(
    (character: GameCharacter) => {
      if (character.playerId !== currentPlayer) {
        Alert.alert('Not Your Turn', `It's Player ${currentPlayer}'s turn!`);
        return;
      }
      if (selectedCharacter?.id === character.id) {
        setSelectedCharacter(null);
        setValidMoves([]);
      } else {
        setSelectedCharacter(character);
        const moves = getValidMoves(board, character);
        setValidMoves(moves);
      }
    },
    [board, currentPlayer, selectedCharacter],
  );

  // Handle tile press for movement
  const handleTilePress = useCallback(
    (tile: TileData) => {
      if (!selectedCharacter) return;

      const isValid = validMoves.some(m => m.id === tile.id);
      if (!isValid) {
        setSelectedCharacter(null);
        setValidMoves([]);
        return;
      }

      // Move character to tile (leave start base if on one)
      setCharacters(prev =>
        prev.map(c =>
          c.id === selectedCharacter.id
            ? {...c, row: tile.row, col: tile.col, onStartBase: false}
            : c,
        ),
      );

      // Handle portal teleportation
      if (tile.type === 'portal') {
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
          setTimeout(() => {
            setCharacters(prev =>
              prev.map(c =>
                c.id === selectedCharacter.id
                  ? {...c, row: target.row, col: target.col}
                  : c,
              ),
            );
            Alert.alert('Portal!', 'Teleported to another portal!');
          }, 400);
        }
      }

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
          squadSize={squadSize}
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
          onEndTurn={handleEndTurn}
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
  boardSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {perspective: 900},
      {rotateX: '50deg'},
      {rotateZ: '-45deg'},
    ],
  },
  isometricWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  // Grid tiles
  tileWrapper: {
    borderRadius: 6,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.7)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Start Bases (outside grid)
  startBaseWrapper: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  startBaseOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  startBaseLabel: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  startBaseLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
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
    bottom: 0,
    right: 0,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  playerBadgeText: {
    fontSize: 8,
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
