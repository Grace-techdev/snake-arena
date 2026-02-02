/**
 * Centralized Mock API Service
 * All backend calls are mocked here for easy replacement with real API later
 */

import type { 
  User, 
  LeaderboardEntry, 
  LiveGame, 
  GameMode,
  Position,
  Direction,
  GameState
} from '@/types/game';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data stores
let currentUser: User | null = null;
const mockUsers: Map<string, User & { password: string }> = new Map();

// Initialize with some mock users
mockUsers.set('player1@snake.io', {
  id: '1',
  username: 'PixelMaster',
  email: 'player1@snake.io',
  password: 'password123',
  createdAt: '2024-01-15T10:00:00Z',
});

mockUsers.set('demo@snake.io', {
  id: '2',
  username: 'DemoPlayer',
  email: 'demo@snake.io',
  password: 'demo',
  createdAt: '2024-02-01T10:00:00Z',
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, userId: '10', username: 'NeonViper', score: 2450, mode: 'walls', date: '2024-01-28' },
  { id: '2', rank: 2, userId: '11', username: 'PixelHunter', score: 2180, mode: 'walls', date: '2024-01-27' },
  { id: '3', rank: 3, userId: '12', username: 'RetroGamer', score: 1920, mode: 'pass-through', date: '2024-01-26' },
  { id: '4', rank: 4, userId: '13', username: 'ArcadeKing', score: 1850, mode: 'walls', date: '2024-01-25' },
  { id: '5', rank: 5, userId: '14', username: 'SnakeCharmer', score: 1720, mode: 'pass-through', date: '2024-01-24' },
  { id: '6', rank: 6, userId: '15', username: 'GridRunner', score: 1650, mode: 'walls', date: '2024-01-23' },
  { id: '7', rank: 7, userId: '16', username: 'ByteBiter', score: 1580, mode: 'pass-through', date: '2024-01-22' },
  { id: '8', rank: 8, userId: '17', username: 'CyberSnake', score: 1490, mode: 'walls', date: '2024-01-21' },
  { id: '9', rank: 9, userId: '18', username: 'DigitalDragon', score: 1420, mode: 'pass-through', date: '2024-01-20' },
  { id: '10', rank: 10, userId: '19', username: 'GlowWorm', score: 1350, mode: 'walls', date: '2024-01-19' },
];

// Mock live games
const mockLiveGames: LiveGame[] = [
  { id: 'game1', playerId: '20', playerName: 'NeonViper', currentScore: 340, mode: 'walls', status: 'playing', startedAt: new Date().toISOString(), viewerCount: 12 },
  { id: 'game2', playerId: '21', playerName: 'PixelHunter', currentScore: 180, mode: 'pass-through', status: 'playing', startedAt: new Date().toISOString(), viewerCount: 8 },
  { id: 'game3', playerId: '22', playerName: 'ArcadeKing', currentScore: 520, mode: 'walls', status: 'playing', startedAt: new Date().toISOString(), viewerCount: 24 },
];

// ============ AUTH API ============

export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(800);
    
    const userData = mockUsers.get(email);
    if (!userData) {
      return { success: false, error: 'User not found' };
    }
    
    if (userData.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    const { password: _, ...user } = userData;
    currentUser = user;
    localStorage.setItem('snake_user', JSON.stringify(user));
    
    return { success: true, user };
  },
  
  async signup(email: string, username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(1000);
    
    if (mockUsers.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.set(email, { ...user, password });
    currentUser = user;
    localStorage.setItem('snake_user', JSON.stringify(user));
    
    return { success: true, user };
  },
  
  async logout(): Promise<void> {
    await delay(300);
    currentUser = null;
    localStorage.removeItem('snake_user');
  },
  
  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    
    if (currentUser) return currentUser;
    
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    
    return null;
  },
};

// ============ LEADERBOARD API ============

export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode, limit = 10): Promise<LeaderboardEntry[]> {
    await delay(500);
    
    let entries = [...mockLeaderboard];
    
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return entries.slice(0, limit);
  },
  
  async submitScore(score: number, mode: GameMode): Promise<{ rank: number; isHighScore: boolean }> {
    await delay(600);
    
    const rank = mockLeaderboard.filter(e => e.score > score).length + 1;
    const isHighScore = rank <= 10;
    
    if (isHighScore && currentUser) {
      mockLeaderboard.push({
        id: Math.random().toString(36).substr(2, 9),
        rank,
        userId: currentUser.id,
        username: currentUser.username,
        score,
        mode,
        date: new Date().toISOString().split('T')[0],
      });
      mockLeaderboard.sort((a, b) => b.score - a.score);
      mockLeaderboard.forEach((e, i) => e.rank = i + 1);
    }
    
    return { rank, isHighScore };
  },
};

// ============ SPECTATOR API ============

export const spectatorApi = {
  async getLiveGames(): Promise<LiveGame[]> {
    await delay(400);
    
    // Simulate score changes
    mockLiveGames.forEach(game => {
      if (game.status === 'playing') {
        game.currentScore += Math.floor(Math.random() * 20);
        game.viewerCount += Math.floor(Math.random() * 3) - 1;
        game.viewerCount = Math.max(0, game.viewerCount);
      }
    });
    
    return [...mockLiveGames];
  },
  
  async joinGame(gameId: string): Promise<{ success: boolean; error?: string }> {
    await delay(300);
    
    const game = mockLiveGames.find(g => g.id === gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }
    
    game.viewerCount++;
    return { success: true };
  },
  
  async leaveGame(gameId: string): Promise<void> {
    await delay(100);
    
    const game = mockLiveGames.find(g => g.id === gameId);
    if (game) {
      game.viewerCount = Math.max(0, game.viewerCount - 1);
    }
  },
};

// ============ AI PLAYER SIMULATION ============

export const aiPlayerApi = {
  /**
   * Generates AI moves for spectator mode
   * Simulates a real player with occasional mistakes
   */
  getNextMove(state: GameState, gridSize: number): Direction {
    const head = state.snake[0];
    const food = state.food;
    
    // Add some randomness to make it look human
    if (Math.random() < 0.1) {
      // 10% chance of random move
      const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const opposites: Record<Direction, Direction> = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT',
      };
      const validMoves = directions.filter(d => d !== opposites[state.direction]);
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    
    // Simple AI: move towards food while avoiding self-collision
    const possibleMoves = getPossibleMoves(head, state.snake, state.direction, gridSize, state.mode);
    
    if (possibleMoves.length === 0) {
      return state.direction; // No safe move, continue current direction
    }
    
    // Find move that gets closest to food
    let bestMove = possibleMoves[0];
    let bestDistance = Infinity;
    
    for (const move of possibleMoves) {
      const nextPos = getNextPosition(head, move, gridSize, state.mode);
      const distance = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMove = move;
      }
    }
    
    return bestMove;
  },
};

// Helper functions for AI
function getNextPosition(pos: Position, direction: Direction, gridSize: number, mode: GameMode): Position {
  let newX = pos.x;
  let newY = pos.y;
  
  switch (direction) {
    case 'UP': newY--; break;
    case 'DOWN': newY++; break;
    case 'LEFT': newX--; break;
    case 'RIGHT': newX++; break;
  }
  
  if (mode === 'pass-through') {
    if (newX < 0) newX = gridSize - 1;
    if (newX >= gridSize) newX = 0;
    if (newY < 0) newY = gridSize - 1;
    if (newY >= gridSize) newY = 0;
  }
  
  return { x: newX, y: newY };
}

function getPossibleMoves(
  head: Position, 
  snake: Position[], 
  currentDirection: Direction, 
  gridSize: number,
  mode: GameMode
): Direction[] {
  const opposites: Record<Direction, Direction> = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT',
  };
  
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  
  return directions.filter(dir => {
    // Can't go opposite direction
    if (dir === opposites[currentDirection]) return false;
    
    const nextPos = getNextPosition(head, dir, gridSize, mode);
    
    // Check wall collision in walls mode
    if (mode === 'walls') {
      if (nextPos.x < 0 || nextPos.x >= gridSize || nextPos.y < 0 || nextPos.y >= gridSize) {
        return false;
      }
    }
    
    // Check self collision (ignore tail as it will move)
    const bodyWithoutTail = snake.slice(0, -1);
    return !bodyWithoutTail.some(seg => seg.x === nextPos.x && seg.y === nextPos.y);
  });
}
