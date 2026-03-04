// ─── Tile Types ───────────────────────────────────────────────────────────────
export type TileType = 'path' | 'firewall' | 'portal';

export interface TileData {
  type: TileType;
  id: string;
  row: number;
  col: number;
}

// ─── Start Base (outside the grid) ────────────────────────────────────────────
export interface StartBase {
  id: string;
  owner: number; // player 1-4
  // The grid corner tile this start base connects to
  entryRow: number;
  entryCol: number;
  // Position relative to grid: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// ─── Character Types ──────────────────────────────────────────────────────────
export type CharacterType = 'chip' | 'glitchy';

export interface GameCharacter {
  id: string;
  type: CharacterType;
  playerId: number;
  // -1 means on start base (use startBaseId)
  row: number;
  col: number;
  onStartBase: boolean;
  color: string;
}

// ─── Board Configuration ──────────────────────────────────────────────────────
export const BOARD_SIZE = 4;

// Player colors matching PlayerSelectionScreen
export const PLAYER_COLORS: Record<number, string> = {
  1: '#22d3ee', // blue/cyan
  2: '#ef4444', // red
  3: '#eab308', // yellow
  4: '#22c55e', // green
};

// All 4 start bases - positioned at corners OUTSIDE the 4x4 grid
export const START_BASES: StartBase[] = [
  {id: 'sb-1', owner: 1, entryRow: 3, entryCol: 0, position: 'bottom-left'},
  {id: 'sb-2', owner: 2, entryRow: 3, entryCol: 3, position: 'bottom-right'},
  {id: 'sb-3', owner: 3, entryRow: 0, entryCol: 0, position: 'top-left'},
  {id: 'sb-4', owner: 4, entryRow: 0, entryCol: 3, position: 'top-right'},
];

// Default 4x4 board layout - ONLY path, portal, firewall
// No start bases inside the grid
//
// Layout (row, col):
//   (0,0) Path     | (0,1) Portal   | (0,2) Path     | (0,3) Firewall
//   (1,0) Firewall | (1,1) Path     | (1,2) Firewall  | (1,3) Path
//   (2,0) Path     | (2,1) Portal   | (2,2) Portal    | (2,3) Path
//   (3,0) Path     | (3,1) Firewall | (3,2) Path      | (3,3) Path
//
export function generateDefaultBoard(): TileData[][] {
  const board: TileData[][] = [
    [
      {type: 'path', id: 'tile-0-0', row: 0, col: 0},
      {type: 'portal', id: 'tile-0-1', row: 0, col: 1},
      {type: 'path', id: 'tile-0-2', row: 0, col: 2},
      {type: 'firewall', id: 'tile-0-3', row: 0, col: 3},
    ],
    [
      {type: 'firewall', id: 'tile-1-0', row: 1, col: 0},
      {type: 'path', id: 'tile-1-1', row: 1, col: 1},
      {type: 'firewall', id: 'tile-1-2', row: 1, col: 2},
      {type: 'path', id: 'tile-1-3', row: 1, col: 3},
    ],
    [
      {type: 'path', id: 'tile-2-0', row: 2, col: 0},
      {type: 'portal', id: 'tile-2-1', row: 2, col: 1},
      {type: 'portal', id: 'tile-2-2', row: 2, col: 2},
      {type: 'path', id: 'tile-2-3', row: 2, col: 3},
    ],
    [
      {type: 'path', id: 'tile-3-0', row: 3, col: 0},
      {type: 'firewall', id: 'tile-3-1', row: 3, col: 1},
      {type: 'path', id: 'tile-3-2', row: 3, col: 2},
      {type: 'path', id: 'tile-3-3', row: 3, col: 3},
    ],
  ];
  return board;
}

// Check if a tile is walkable
export function isTileWalkable(tile: TileData): boolean {
  return tile.type !== 'firewall';
}

// Get valid moves for a character
export function getValidMoves(
  board: TileData[][],
  character: GameCharacter,
): TileData[] {
  // If on start base, can only move to the entry tile
  if (character.onStartBase) {
    const startBase = START_BASES.find(sb => sb.owner === character.playerId);
    if (!startBase) return [];
    const entryTile = board[startBase.entryRow][startBase.entryCol];
    // Entry tile must be walkable
    return isTileWalkable(entryTile) ? [entryTile] : [];
  }

  // Normal grid movement: up, down, left, right
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];
  const moves: TileData[] = [];
  for (const [dr, dc] of directions) {
    const newRow = character.row + dr;
    const newCol = character.col + dc;
    if (
      newRow >= 0 &&
      newRow < BOARD_SIZE &&
      newCol >= 0 &&
      newCol < BOARD_SIZE
    ) {
      const tile = board[newRow][newCol];
      if (isTileWalkable(tile)) {
        moves.push(tile);
      }
    }
  }
  // NOTE: Cannot return to start base (one-way)
  return moves;
}

// Spawn characters for all players on their start bases
export function spawnCharacters(playerCount: number): GameCharacter[] {
  const characters: GameCharacter[] = [];

  for (let i = 1; i <= playerCount; i++) {
    const startBase = START_BASES.find(sb => sb.owner === i);
    if (!startBase) continue;
    // Randomly choose chip or glitchy
    const type: CharacterType = Math.random() > 0.5 ? 'chip' : 'glitchy';
    characters.push({
      id: `player-${i}`,
      type,
      playerId: i,
      row: startBase.entryRow,
      col: startBase.entryCol,
      onStartBase: true,
      color: PLAYER_COLORS[i],
    });
  }

  return characters;
}
