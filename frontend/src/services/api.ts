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

const API_BASE_URL = 'http://localhost:8000';

// ============ AUTH API ============

export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem('snake_user', JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Connection failed' };
    }
  },

  async signup(email: string, username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem('snake_user', JSON.stringify(data.user));
      }

      return data;
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'Connection failed' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('snake_user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const stored = localStorage.getItem('snake_user');
    if (!stored) return null;

    try {
      const user = JSON.parse(stored);
      // Verify with backend
      const response = await fetch(`${API_BASE_URL}/auth/me?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const remoteUser = await response.json();
        // If remote user is null (not found), clear local session
        if (!remoteUser) {
          localStorage.removeItem('snake_user');
          return null;
        }
        return remoteUser;
      }
    } catch (err) {
      console.error('Auth verification error:', err);
    }

    // Fallback to local data if backend checks fail (offline support) Or better, return null to force re-login
    // For now, let's trust local if parseable, as simple auth check
    return JSON.parse(stored);
  },
};

// ============ LEADERBOARD API ============

export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode, limit = 10): Promise<LeaderboardEntry[]> {
    try {
      let url = `${API_BASE_URL}/leaderboard?limit=${limit}`;
      if (mode) {
        url += `&mode=${mode}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return await response.json();
    } catch (err) {
      console.error('Leaderboard error:', err);
      return [];
    }
  },

  async submitScore(score: number, mode: GameMode): Promise<{ rank: number; isHighScore: boolean }> {
    const stored = localStorage.getItem('snake_user');
    if (!stored) return { rank: 0, isHighScore: false };

    try {
      const user = JSON.parse(stored);
      const response = await fetch(`${API_BASE_URL}/leaderboard?email=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, mode }),
      });

      if (!response.ok) throw new Error('Failed to submit score');
      return await response.json();
    } catch (err) {
      console.error('Score submission error:', err);
      return { rank: 0, isHighScore: false };
    }
  },
};

// ============ SPECTATOR API ============

export const spectatorApi = {
  async getLiveGames(): Promise<LiveGame[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/games`);
      if (!response.ok) throw new Error('Failed to fetch live games');
      return await response.json();
    } catch (err) {
      console.error('Live games error:', err);
      return [];
    }
  },

  async joinGame(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/join`, {
        method: 'POST',
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Join game error:', err);
      return { success: false, error: 'Connection failed' };
    }
  },

  async leaveGame(gameId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/games/${gameId}/leave`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Leave game error:', err);
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
