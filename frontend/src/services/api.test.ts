import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authApi, leaderboardApi, spectatorApi, aiPlayerApi } from '@/services/api';
import type { GameState } from '@/types/game';

// Helper to mock fetch responses
function mockFetch(data: any, status = 200) {
  return vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(data),
    })
  );
}

describe('authApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = originalFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const mockUser = { id: '1', username: 'DemoPlayer', email: 'demo@snake.io' };
      global.fetch = mockFetch({ success: true, user: mockUser });

      const result = await authApi.login('demo@snake.io', 'demo');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('DemoPlayer');
    });

    it('fails with invalid email', async () => {
      global.fetch = mockFetch({ success: false, error: 'User not found' });

      const result = await authApi.login('invalid@snake.io', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('fails with wrong password', async () => {
      global.fetch = mockFetch({ success: false, error: 'Invalid password' });

      const result = await authApi.login('demo@snake.io', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
    });

    it('stores user in localStorage on success', async () => {
      const mockUser = { id: '1', username: 'DemoPlayer', email: 'demo@snake.io' };
      global.fetch = mockFetch({ success: true, user: mockUser });

      await authApi.login('demo@snake.io', 'demo');

      const stored = localStorage.getItem('snake_user');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!).username).toBe('DemoPlayer');
    });
  });

  describe('signup', () => {
    it('creates a new user successfully', async () => {
      const mockUser = { id: '2', username: 'NewPlayer', email: 'newuser@test.com' };
      global.fetch = mockFetch({ success: true, user: mockUser });

      const result = await authApi.signup('newuser@test.com', 'NewPlayer', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('NewPlayer');
    });

    it('fails if email already exists', async () => {
      global.fetch = mockFetch({ success: false, error: 'Email already registered' }, 400);

      const result = await authApi.signup('demo@snake.io', 'AnotherPlayer', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('logout', () => {
    it('clears user from localStorage', async () => {
      // Mock login first (manually set storage)
      localStorage.setItem('snake_user', JSON.stringify({ username: 'Demo' }));

      global.fetch = mockFetch({ message: 'Logged out' });

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
      const mockUserStr = JSON.stringify({
        id: '2',
        username: 'DemoPlayer',
        email: 'demo@snake.io',
      });
      localStorage.setItem('snake_user', mockUserStr);

      // Mock verify call
      global.fetch = mockFetch(JSON.parse(mockUserStr));

      const user = await authApi.getCurrentUser();
      expect(user?.username).toBe('DemoPlayer');
    });
  });
});

describe('leaderboardApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getLeaderboard', () => {
    it('returns leaderboard entries', async () => {
      const mockEntries = [
        { rank: 1, username: 'Player1', score: 1000, mode: 'walls', date: '2023-01-01' }
      ];
      global.fetch = mockFetch(mockEntries);

      const entries = await leaderboardApi.getLeaderboard();

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0]).toHaveProperty('rank');
      expect(entries[0]).toHaveProperty('username');
    });
  });

  describe('submitScore', () => {
    it('returns rank for submitted score', async () => {
      localStorage.setItem('snake_user', JSON.stringify({ email: 'test@test.com' }));
      global.fetch = mockFetch({ rank: 5, isHighScore: true });

      const result = await leaderboardApi.submitScore(1000, 'walls');

      expect(result).toHaveProperty('rank');
      expect(result).toHaveProperty('isHighScore');
    });
  });
});

describe('spectatorApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getLiveGames', () => {
    it('returns list of live games', async () => {
      const mockGames = [
        { id: 'game1', playerName: 'Player1', currentScore: 100 }
      ];
      global.fetch = mockFetch(mockGames);

      const games = await spectatorApi.getLiveGames();

      expect(games.length).toBeGreaterThan(0);
      expect(games[0].id).toBe('game1');
    });
  });

  describe('joinGame', () => {
    it('successfully joins an existing game', async () => {
      const mockGames = [{ id: 'game1' }];
      global.fetch = mockFetch({ success: true }); // Mock join response

      const result = await spectatorApi.joinGame('game1');

      expect(result.success).toBe(true);
    });

    it('fails for non-existent game', async () => {
      global.fetch = mockFetch({ success: false, error: 'Game not found' }); // Mock fail response

      const result = await spectatorApi.joinGame('non-existent-game-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Game not found');
    });
  });
});

describe('aiPlayerApi', () => {
  // These are pure functions, no need to mock fetch
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
