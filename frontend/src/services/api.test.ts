import { describe, it, expect, beforeEach } from 'vitest';
import { authApi, leaderboardApi, spectatorApi, aiPlayerApi } from '@/services/api';
import type { GameState } from '@/types/game';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const result = await authApi.login('demo@snake.io', 'demo');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('DemoPlayer');
    });

    it('fails with invalid email', async () => {
      const result = await authApi.login('invalid@snake.io', 'password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('fails with wrong password', async () => {
      const result = await authApi.login('demo@snake.io', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
    });

    it('stores user in localStorage on success', async () => {
      await authApi.login('demo@snake.io', 'demo');
      
      const stored = localStorage.getItem('snake_user');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!).username).toBe('DemoPlayer');
    });
  });

  describe('signup', () => {
    it('creates a new user successfully', async () => {
      const result = await authApi.signup('newuser@test.com', 'NewPlayer', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('NewPlayer');
    });

    it('fails if email already exists', async () => {
      const result = await authApi.signup('demo@snake.io', 'AnotherPlayer', 'password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('logout', () => {
    it('clears user from localStorage', async () => {
      await authApi.login('demo@snake.io', 'demo');
      expect(localStorage.getItem('snake_user')).toBeDefined();
      
      await authApi.logout();
      expect(localStorage.getItem('snake_user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when not logged in', async () => {
      const user = await authApi.getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns user from localStorage', async () => {
      await authApi.login('demo@snake.io', 'demo');
      
      // Simulate page refresh by clearing in-memory state
      await authApi.logout();
      localStorage.setItem('snake_user', JSON.stringify({
        id: '2',
        username: 'DemoPlayer',
        email: 'demo@snake.io',
      }));
      
      const user = await authApi.getCurrentUser();
      expect(user?.username).toBe('DemoPlayer');
    });
  });
});

describe('leaderboardApi', () => {
  describe('getLeaderboard', () => {
    it('returns leaderboard entries', async () => {
      const entries = await leaderboardApi.getLeaderboard();
      
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0]).toHaveProperty('rank');
      expect(entries[0]).toHaveProperty('username');
      expect(entries[0]).toHaveProperty('score');
    });

    it('filters by mode', async () => {
      const wallsEntries = await leaderboardApi.getLeaderboard('walls');
      
      for (const entry of wallsEntries) {
        expect(entry.mode).toBe('walls');
      }
    });

    it('limits results', async () => {
      const entries = await leaderboardApi.getLeaderboard(undefined, 5);
      expect(entries.length).toBeLessThanOrEqual(5);
    });
  });

  describe('submitScore', () => {
    it('returns rank for submitted score', async () => {
      const result = await leaderboardApi.submitScore(1000, 'walls');
      
      expect(result).toHaveProperty('rank');
      expect(result).toHaveProperty('isHighScore');
      expect(typeof result.rank).toBe('number');
    });

    it('identifies high scores correctly', async () => {
      const highResult = await leaderboardApi.submitScore(10000, 'walls');
      const lowResult = await leaderboardApi.submitScore(1, 'walls');
      
      expect(highResult.isHighScore).toBe(true);
      expect(lowResult.isHighScore).toBe(false);
    });
  });
});

describe('spectatorApi', () => {
  describe('getLiveGames', () => {
    it('returns list of live games', async () => {
      const games = await spectatorApi.getLiveGames();
      
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      expect(games[0]).toHaveProperty('id');
      expect(games[0]).toHaveProperty('playerName');
      expect(games[0]).toHaveProperty('currentScore');
    });
  });

  describe('joinGame', () => {
    it('successfully joins an existing game', async () => {
      const games = await spectatorApi.getLiveGames();
      const result = await spectatorApi.joinGame(games[0].id);
      
      expect(result.success).toBe(true);
    });

    it('fails for non-existent game', async () => {
      const result = await spectatorApi.joinGame('non-existent-game-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Game not found');
    });
  });
});

describe('aiPlayerApi', () => {
  describe('getNextMove', () => {
    it('returns a valid direction', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        food: { x: 15, y: 10 },
        direction: 'RIGHT',
        score: 0,
        status: 'playing',
        mode: 'walls',
        speed: 150,
      };
      
      const move = aiPlayerApi.getNextMove(state, 20);
      expect(['UP', 'DOWN', 'LEFT', 'RIGHT']).toContain(move);
    });

    it('does not return opposite direction', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        food: { x: 15, y: 10 },
        direction: 'RIGHT',
        score: 0,
        status: 'playing',
        mode: 'walls',
        speed: 150,
      };
      
      // Run multiple times due to randomness
      for (let i = 0; i < 50; i++) {
        const move = aiPlayerApi.getNextMove(state, 20);
        expect(move).not.toBe('LEFT'); // Opposite of RIGHT
      }
    });

    it('moves towards food in most cases', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        food: { x: 15, y: 10 }, // Food is to the right
        direction: 'RIGHT',
        score: 0,
        status: 'playing',
        mode: 'walls',
        speed: 150,
      };
      
      let rightCount = 0;
      for (let i = 0; i < 100; i++) {
        const move = aiPlayerApi.getNextMove(state, 20);
        if (move === 'RIGHT') rightCount++;
      }
      
      // Should prefer moving right towards food in most cases
      expect(rightCount).toBeGreaterThan(50);
    });
  });
});
