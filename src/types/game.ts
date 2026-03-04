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

// ─── Character Types ───────────────────────────────────────────────────────────
// Player characters always use the robot (chip) asset
export interface GameCharacter {
  id: string;
  playerId: number;
  row: number;
  col: number;
  onStartBase: boolean;
  color: string;
}

// ─── Monster (Glitchy) ────────────────────────────────────────────────────
export interface Monster {
  id: string;
  row: number;
  col: number;
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

// Generate a randomized 4x4 board with rules:
// - Exactly 2 portals (placed randomly, not on entry corners)
// - 3–4 firewalls (random positions, not on entry corners)
// - Rest are path tiles
// - Entry corner tiles (0,0), (0,3), (3,0), (3,3) are always 'path'
export function generateDefaultBoard(): TileData[][] {
  const ENTRY_CORNERS = new Set(['0-0', '0-3', '3-0', '3-3']);
  const eligible: Array<{row: number; col: number}> = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!ENTRY_CORNERS.has(`${r}-${c}`)) {
        eligible.push({row: r, col: c});
      }
    }
  }

  // Shuffle eligible positions
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }

  // Assign: first 2 → portal, next 3 → firewall, rest → path
  const PORTAL_COUNT = 2;
  const FIREWALL_COUNT = 3;
  const typeMap: Record<string, TileType> = {};
  eligible.forEach(({row, col}, idx) => {
    if (idx < PORTAL_COUNT) {
      typeMap[`${row}-${col}`] = 'portal';
    } else if (idx < PORTAL_COUNT + FIREWALL_COUNT) {
      typeMap[`${row}-${col}`] = 'firewall';
    } else {
      typeMap[`${row}-${col}`] = 'path';
    }
  });

  // Build the board
  const board: TileData[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: TileData[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r}-${c}`;
      const type: TileType = ENTRY_CORNERS.has(key) ? 'path' : typeMap[key];
      row.push({type, id: `tile-${r}-${c}`, row: r, col: c});
    }
    board.push(row);
  }
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
// All player characters use the robot (chip) asset
export function spawnCharacters(playerCount: number): GameCharacter[] {
  const characters: GameCharacter[] = [];

  for (let i = 1; i <= playerCount; i++) {
    const startBase = START_BASES.find(sb => sb.owner === i);
    if (!startBase) continue;
    characters.push({
      id: `player-${i}`,
      playerId: i,
      row: startBase.entryRow,
      col: startBase.entryCol,
      onStartBase: true,
      color: PLAYER_COLORS[i],
    });
  }

  return characters;
}

// Spawn 2 Glitchy monsters on random non-corner, path-only tiles
// Avoids the 4 entry corners so monsters don't block player entry
export function spawnMonsters(board: TileData[][]): Monster[] {
  const ENTRY_CORNERS = new Set(['0-0', '0-3', '3-0', '3-3']);
  const candidates: Array<{row: number; col: number}> = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const tile = board[r][c];
      if (!ENTRY_CORNERS.has(`${r}-${c}`) && tile.type === 'path') {
        candidates.push({row: r, col: c});
      }
    }
  }

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Pick 1 monster
  return candidates.slice(0, 1).map((pos, idx) => ({
    id: `monster-${idx}`,
    row: pos.row,
    col: pos.col,
  }));
}
