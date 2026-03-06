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
import Character3DOverlay, {Character3DEntry} from '../components/Character3DOverlay';
import {
  TileData,
  GameCharacter,
  Monster,
  StartBase,
  generateDefaultBoard,
  spawnCharacters,
  spawnMonsters,
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


// ─── Isometric board dimensions ───────────────────────────────────────────────
const TILE_SIZE = 72;
const TILE_GAP = 4;
const TILE_DEPTH = 8; // pseudo-3D tile thickness
const SB_SIZE = 50;
const SB_GAP = 8;
const STRIDE = TILE_SIZE + TILE_GAP; // 76
const BOARD_PX = STRIDE * BOARD_SIZE - TILE_GAP; // 300

// Viewport area for the isometric board
const VIEWPORT_SIZE = SCREEN_WIDTH - 24;

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

// Position start base outside the isometric grid
function getStartBasePosition(sb: StartBase): {left: number; top: number} {
  const tileCenter = (TILE_SIZE - SB_SIZE) / 2;
  switch (sb.position) {
    case 'bottom-left':
      return {left: -SB_SIZE - SB_GAP, top: sb.entryRow * STRIDE + tileCenter};
    case 'bottom-right':
      return {left: BOARD_PX + SB_GAP, top: sb.entryRow * STRIDE + tileCenter};
    case 'top-left':
      return {left: sb.entryCol * STRIDE + tileCenter, top: -SB_SIZE - SB_GAP};
    case 'top-right':
      return {left: sb.entryCol * STRIDE + tileCenter, top: -SB_SIZE - SB_GAP};
  }
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

// ─── Animated Character overlay (rendered inside a tile cell) ─────────────────
interface AnimCharacterProps {
  character: GameCharacter;
  isSelected: boolean;
  onPress: () => void;
}

function AnimCharacter({character, isSelected, onPress}: AnimCharacterProps) {
  const bounceY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const charScale = useSharedValue(0);

  useEffect(() => {
    charScale.value = withDelay(
      character.playerId * 150,
      withSpring(1, {stiffness: 300, damping: 15}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSelected) {
      bounceY.value = withSequence(
        withTiming(-6, {duration: 200, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 200, easing: Easing.in(Easing.quad)}),
      );
      glowOpacity.value = withTiming(1, {duration: 200});
    } else {
      glowOpacity.value = withTiming(0, {duration: 150});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateY: bounceY.value}, {scale: charScale.value}],
  }));

  const glowStyle = useAnimatedStyle(() => ({opacity: glowOpacity.value}));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.characterContainer}>
      <Animated.View
        style={[
          styles.characterGlow,
          {
            borderColor: character.color,
            shadowColor: character.color,
          },
          glowStyle,
        ]}
      />
      <Animated.View style={animStyle}>
        <Image
          source={chipCharacter}
          style={styles.charTapTarget}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={[styles.playerBadge, {backgroundColor: character.color}]}>
        <Text style={styles.playerBadgeText}>P{character.playerId}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tile Cell ─────────────────────────────────────────────────────────────────
// Renders one tile + any player character + any monster on it
interface TileCellProps {
  tile: TileData;
  isHighlighted: boolean;
  isSelected: boolean;
  character: GameCharacter | null;
  isCharSelected: boolean;
  hasMonster: boolean;
  onTilePress: () => void;
  onCharPress: () => void;
  delay: number;
}

function TileCell({
  tile,
  isHighlighted,
  isSelected,
  character,
  isCharSelected,
  hasMonster,
  onTilePress,
  onCharPress,
  delay,
}: TileCellProps) {
  const tileScale = useSharedValue(0);
  const tileOpacity = useSharedValue(0);

  useEffect(() => {
    tileScale.value = withDelay(delay, withSpring(1, {stiffness: 280, damping: 18}));
    tileOpacity.value = withDelay(delay, withTiming(1, {duration: 350}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: tileScale.value}],
    opacity: tileOpacity.value,
  }));

  return (
    <Animated.View style={[styles.tileCell, animStyle]}>
      {/* 3D depth strip (south face visible in isometric) */}
      <View style={styles.tileDepth} />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onTilePress}
        style={[
          styles.tileWrapper,
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
      {character && (
        <AnimCharacter
          character={character}
          isSelected={isCharSelected}
          onPress={onCharPress}
        />
      )}
      {hasMonster && !character && <MonsterOverlay />}
    </Animated.View>
  );
}

// ─── Start Base Badge ─────────────────────────────────────────────────────────
// Rendered as a small badge at each corner of the grid
interface StartBaseBadgeProps {
  startBase: StartBase;
  character: GameCharacter | null;
  isCharSelected: boolean;
  onCharPress: () => void;
}

function StartBaseBadge({startBase, character, isCharSelected, onCharPress}: StartBaseBadgeProps) {
  const color = PLAYER_COLORS[startBase.owner];
  const charImgSize = SB_SIZE * 0.55;

  return (
    <View style={[styles.startBaseWrapper, {borderColor: color, shadowColor: color}]}>
      <Image
        source={getStartBaseImage(startBase.owner)}
        style={styles.tileImage}
        resizeMode="cover"
      />
      <View style={[styles.startBaseOverlay, {backgroundColor: color}]} />
      <View style={[styles.startBaseLabel, {backgroundColor: color}]}>
        <Text style={styles.startBaseLabelText}>P{startBase.owner}</Text>
      </View>
      {character && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCharPress}
          style={styles.sbCharContainer}>
          <Image
            source={chipCharacter}
            style={{width: charImgSize, height: charImgSize}}
            resizeMode="contain"
          />
          {isCharSelected && (
            <View style={[styles.sbCharGlow, {borderColor: color, shadowColor: color}]} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Monster Overlay ─────────────────────────────────────────────────────────
function MonsterOverlay() {
  return (
    <View style={styles.monsterOverlay}>
      <View style={styles.monsterBadge}>
        <Text style={styles.monsterBadgeText}>!</Text>
      </View>
    </View>
  );
}

// ─── Game Board (Isometric + Camera Follow) ─────────────────────────────────
interface GameBoardProps {
  board: TileData[][];
  characters: GameCharacter[];
  monsters: Monster[];
  selectedCharacter: GameCharacter | null;
  validMoves: TileData[];
  squadSize: number;
  currentPlayer: number;
  onTilePress: (tile: TileData) => void;
  onCharacterPress: (character: GameCharacter) => void;
}

function GameBoard({
  board,
  characters,
  monsters,
  selectedCharacter,
  validMoves,
  squadSize,
  currentPlayer,
  onTilePress,
  onCharacterPress,
}: GameBoardProps) {
  // ── Camera follow ──────────────────────────────────────────────────────
  const camX = useSharedValue(0);
  const camY = useSharedValue(0);

  // Pan camera to a board position (row, col)
  const panCameraTo = useCallback(
    (row: number, col: number) => {
      const boardCenter = BOARD_PX / 2;
      const targetX = col * STRIDE + TILE_SIZE / 2;
      const targetY = row * STRIDE + TILE_SIZE / 2;
      camX.value = withSpring(boardCenter - targetX, {damping: 18, stiffness: 90});
      camY.value = withSpring(boardCenter - targetY, {damping: 18, stiffness: 90});
    },
    [camX, camY],
  );

  // Pan to current player's character on turn change
  useEffect(() => {
    const char = characters.find(c => c.playerId === currentPlayer);
    if (!char) return;
    panCameraTo(char.row, char.col);
  }, [currentPlayer, characters, panCameraTo]);

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{translateX: camX.value}, {translateY: camY.value}],
  }));

  // ── Lookups ────────────────────────────────────────────────────────────
  const validMoveIds = useMemo(
    () => new Set(validMoves.map(t => t.id)),
    [validMoves],
  );

  const activeStartBases = START_BASES.filter(sb => sb.owner <= squadSize);

  const charMap = useMemo(() => {
    const m: Record<string, GameCharacter> = {};
    characters.forEach(c => {
      if (!c.onStartBase) {
        m[`${c.row}-${c.col}`] = c;
      }
    });
    return m;
  }, [characters]);

  const monsterMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    monsters.forEach(mon => {
      m[`${mon.row}-${mon.col}`] = true;
    });
    return m;
  }, [monsters]);

  const sbCharMap = useMemo(() => {
    const m: Record<number, GameCharacter> = {};
    characters.forEach(c => {
      if (c.onStartBase) {
        m[c.playerId] = c;
      }
    });
    return m;
  }, [characters]);

  // ── Build 3D character entries (currentPlayer on-grid + monster) ──────
  const character3DEntries = useMemo<Character3DEntry[]>(() => {
    const entries: Character3DEntry[] = [];
    // Only render 3D for current player's on-grid character
    const currentChar = characters.find(
      c => c.playerId === currentPlayer && !c.onStartBase,
    );
    if (currentChar) {
      entries.push({
        id: currentChar.id,
        type: 'chip',
        row: currentChar.row,
        col: currentChar.col,
      });
    }
    // Render 3D for monster
    monsters.forEach(m => {
      entries.push({id: m.id, type: 'glitchy', row: m.row, col: m.col});
    });
    return entries;
  }, [characters, monsters, currentPlayer]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.viewport}>
      {/* Isometric projection wrapper */}
      <View style={styles.isoProjection}>
        {/* Camera pan (animated in board-space, before iso rotation) */}
        <Animated.View style={[styles.boardContent, cameraStyle]}>
          {/* Grid tiles — absolutely positioned */}
          {board.map((row, rowIdx) =>
            row.map((tile, colIdx) => {
              const key = `${rowIdx}-${colIdx}`;
              const isHighlighted = validMoveIds.has(tile.id);
              const charHere = charMap[key] ?? null;
              const isGridSelected =
                selectedCharacter?.row === rowIdx &&
                selectedCharacter?.col === colIdx &&
                !selectedCharacter?.onStartBase;
              const delay = (rowIdx * BOARD_SIZE + colIdx) * 50;
              return (
                <View
                  key={tile.id}
                  style={{
                    position: 'absolute',
                    left: colIdx * STRIDE,
                    top: rowIdx * STRIDE,
                  }}>
                  <TileCell
                    tile={tile}
                    isHighlighted={isHighlighted}
                    isSelected={isGridSelected}
                    character={charHere}
                    isCharSelected={
                      charHere ? selectedCharacter?.id === charHere.id : false
                    }
                    hasMonster={!!monsterMap[key]}
                    onTilePress={() => onTilePress(tile)}
                    onCharPress={() => charHere && onCharacterPress(charHere)}
                    delay={delay}
                  />
                </View>
              );
            }),
          )}

          {/* Start bases — absolutely positioned outside the grid */}
          {activeStartBases.map(sb => {
            const pos = getStartBasePosition(sb);
            const c = sbCharMap[sb.owner] ?? null;
            return (
              <View
                key={sb.id}
                style={{position: 'absolute', left: pos.left, top: pos.top}}>
                <StartBaseBadge
                  startBase={sb}
                  character={c}
                  isCharSelected={c !== null && selectedCharacter?.id === c.id}
                  onCharPress={() => {
                    if (c) {
                      onCharacterPress(c);
                    }
                  }}
                />
              </View>
            );
          })}
        </Animated.View>
      </View>

      {/* 3D character overlay — rendered at viewport level (outside ISO transform)
          for proper 3D depth, positioned to match tile screen coords */}
      {character3DEntries.length > 0 && (
        <Character3DOverlay
          characters={character3DEntries}
          camX={camX}
          camY={camY}
        />
      )}
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
            : 'Tap a highlighted tile to move your robot'}
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
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<GameCharacter | null>(null);
  const [validMoves, setValidMoves] = useState<TileData[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [turnCount, setTurnCount] = useState(1);

  // Spawn characters + monsters on mount
  useEffect(() => {
    const spawned = spawnCharacters(squadSize);
    setCharacters(spawned);
  }, [squadSize]);

  useEffect(() => {
    const spawnedMonsters = spawnMonsters(board);
    setMonsters(spawnedMonsters);
  }, [board]);

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
          monsters={monsters}
          selectedCharacter={selectedCharacter}
          validMoves={validMoves}
          squadSize={squadSize}
          currentPlayer={currentPlayer}
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
  // ── Isometric layout ──────────────────────────────────────────────────
  viewport: {
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  isoProjection: {
    transform: [
      {perspective: 800},
      {rotateX: '55deg'},
      {rotateZ: '45deg'},
    ],
  },
  boardContent: {
    width: BOARD_PX,
    height: BOARD_PX,
  },
  // ── Tiles ─────────────────────────────────────────────────────────────
  tileCell: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    position: 'relative',
  },
  tileDepth: {
    position: 'absolute',
    bottom: -TILE_DEPTH,
    left: 0,
    right: 0,
    height: TILE_DEPTH,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tileWrapper: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
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
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 12,
  },
  tileHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileHighlightDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.8)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // ── Start Base badges ─────────────────────────────────────────────────
  startBaseWrapper: {
    width: SB_SIZE,
    height: SB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  startBaseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  startBaseLabel: {
    position: 'absolute',
    bottom: 3,
    alignSelf: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  startBaseLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  charTapTarget: {
    width: TILE_SIZE * 0.6,
    height: TILE_SIZE * 0.6,
    borderRadius: 999,
  },
  sbCharContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sbCharGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 8,
    borderWidth: 2,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  // ── Characters ────────────────────────────────────────────────────────
  characterContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  characterGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 8,
    borderWidth: 2,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  playerBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  playerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  // ── Monster ───────────────────────────────────────────────────────────
  monsterOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  monsterBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
  // ── Bottom panel ──────────────────────────────────────────────────────
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
