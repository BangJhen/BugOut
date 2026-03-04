// ─── Tile Types ───────────────────────────────────────────────────────────────
export type TileType = 'path' | 'firewall' | 'portal' | 'startBase';

export interface TileData {
  type: TileType;
  id: string;
  row: number;
  col: number;
  // For start bases, which player owns it (1-4)
  owner?: number;
}

// ─── Character Types ──────────────────────────────────────────────────────────
export type CharacterType = 'chip' | 'glitchy';

export interface GameCharacter {
  id: string;
  type: CharacterType;
  playerId: number;
  row: number;
  col: number;
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

// Default 4x4 board layout matching the reference image
// The board is viewed from the bottom-right corner in isometric
//
// Layout (row, col):
//   (0,0) Start3  | (0,1) Portal   | (0,2) Path     | (0,3) Start4
//   (1,0) Path    | (1,1) Firewall | (1,2) Firewall  | (1,3) Path
//   (2,0) Path    | (2,1) Portal   | (2,2) Portal    | (2,3) Path
//   (3,0) Start1  | (3,1) Path     | (3,2) Firewall  | (3,3) Start2
//
export function generateDefaultBoard(): TileData[][] {
  const board: TileData[][] = [
    // Row 0 (top)
    [
      {type: 'startBase', id: 'tile-0-0', row: 0, col: 0, owner: 3},
      {type: 'portal', id: 'tile-0-1', row: 0, col: 1},
      {type: 'path', id: 'tile-0-2', row: 0, col: 2},
      {type: 'startBase', id: 'tile-0-3', row: 0, col: 3, owner: 4},
    ],
    // Row 1
    [
      {type: 'path', id: 'tile-1-0', row: 1, col: 0},
      {type: 'firewall', id: 'tile-1-1', row: 1, col: 1},
      {type: 'firewall', id: 'tile-1-2', row: 1, col: 2},
      {type: 'path', id: 'tile-1-3', row: 1, col: 3},
    ],
    // Row 2
    [
      {type: 'path', id: 'tile-2-0', row: 2, col: 0},
      {type: 'portal', id: 'tile-2-1', row: 2, col: 1},
      {type: 'portal', id: 'tile-2-2', row: 2, col: 2},
      {type: 'path', id: 'tile-2-3', row: 2, col: 3},
    ],
    // Row 3 (bottom)
    [
      {type: 'startBase', id: 'tile-3-0', row: 3, col: 0, owner: 1},
      {type: 'path', id: 'tile-3-1', row: 3, col: 1},
      {type: 'firewall', id: 'tile-3-2', row: 3, col: 2},
      {type: 'startBase', id: 'tile-3-3', row: 3, col: 3, owner: 2},
    ],
  ];
  return board;
}

// Get start base positions for given number of players
export function getStartPositions(
  board: TileData[][],
  playerCount: number,
): {row: number; col: number; owner: number}[] {
  const starts: {row: number; col: number; owner: number}[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const tile = board[r][c];
      if (tile.type === 'startBase' && tile.owner && tile.owner <= playerCount) {
        starts.push({row: r, col: c, owner: tile.owner});
      }
    }
  }
  return starts.sort((a, b) => a.owner - b.owner);
}

// Check if a tile is walkable
export function isTileWalkable(tile: TileData): boolean {
  return tile.type !== 'firewall';
}

// Get adjacent tiles (up, down, left, right)
export function getAdjacentTiles(
  board: TileData[][],
  row: number,
  col: number,
): TileData[] {
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];
  const adjacent: TileData[] = [];
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (
      newRow >= 0 &&
      newRow < board.length &&
      newCol >= 0 &&
      newCol < board[0].length
    ) {
      adjacent.push(board[newRow][newCol]);
    }
  }
  return adjacent;
}

// Get walkable adjacent tiles for movement
export function getValidMoves(
  board: TileData[][],
  row: number,
  col: number,
): TileData[] {
  return getAdjacentTiles(board, row, col).filter(isTileWalkable);
}

// Spawn characters for all players
export function spawnCharacters(
  board: TileData[][],
  playerCount: number,
): GameCharacter[] {
  const startPositions = getStartPositions(board, playerCount);
  const characters: GameCharacter[] = [];

  startPositions.forEach(start => {
    // Randomly choose chip or glitchy
    const type: CharacterType = Math.random() > 0.5 ? 'chip' : 'glitchy';
    characters.push({
      id: `player-${start.owner}`,
      type,
      playerId: start.owner,
      row: start.row,
      col: start.col,
      color: PLAYER_COLORS[start.owner],
    });
  });

  return characters;
}
