// Game Types
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'walls' | 'pass-through';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';
export type GameSpeed = 'slow' | 'normal' | 'fast';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
}

export interface GameConfig {
  gridSize: number;
  cellSize: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
}

// Spectator Types
export interface LiveGame {
  id: string;
  playerId: string;
  playerName: string;
  currentScore: number;
  mode: GameMode;
  status: 'playing' | 'finished';
  startedAt: string;
  viewerCount: number;
}

export interface SpectatorGameState extends GameState {
  gameId: string;
  playerName: string;
}
