import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  getNextPosition,
  checkWallCollision,
  checkSelfCollision,
  checkFoodCollision,
  isValidDirectionChange,
  calculateSpeed,
  gameTick,
  handleDirectionChange,
  DEFAULT_CONFIG,
} from '@/lib/gameLogic';
import type { Position, Direction, GameState, GameMode } from '@/types/game';

describe('createInitialState', () => {
  it('creates a valid initial state for walls mode', () => {
    const state = createInitialState('walls', 20);
    
    expect(state.status).toBe('idle');
    expect(state.mode).toBe('walls');
    expect(state.score).toBe(0);
    expect(state.snake.length).toBe(3);
    expect(state.direction).toBe('RIGHT');
  });

  it('creates a valid initial state for pass-through mode', () => {
    const state = createInitialState('pass-through', 20);
    
    expect(state.mode).toBe('pass-through');
    expect(state.snake.length).toBe(3);
  });

  it('places snake in the center of the grid', () => {
    const gridSize = 20;
    const state = createInitialState('walls', gridSize);
    const head = state.snake[0];
    
    expect(head.x).toBe(Math.floor(gridSize / 2));
    expect(head.y).toBe(Math.floor(gridSize / 2));
  });
});

describe('generateFood', () => {
  it('generates food at a position not occupied by the snake', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    
    for (let i = 0; i < 100; i++) {
      const food = generateFood(snake, 20);
      const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
      expect(isOnSnake).toBe(false);
    }
  });

  it('generates food within grid bounds', () => {
    const snake: Position[] = [{ x: 5, y: 5 }];
    const gridSize = 20;
    
    for (let i = 0; i < 100; i++) {
      const food = generateFood(snake, gridSize);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(gridSize);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(gridSize);
    }
  });
});

describe('getNextPosition', () => {
  const gridSize = 20;

  it('moves up correctly', () => {
    const pos = getNextPosition({ x: 10, y: 10 }, 'UP', gridSize, 'walls');
    expect(pos).toEqual({ x: 10, y: 9 });
  });

  it('moves down correctly', () => {
    const pos = getNextPosition({ x: 10, y: 10 }, 'DOWN', gridSize, 'walls');
    expect(pos).toEqual({ x: 10, y: 11 });
  });

  it('moves left correctly', () => {
    const pos = getNextPosition({ x: 10, y: 10 }, 'LEFT', gridSize, 'walls');
    expect(pos).toEqual({ x: 9, y: 10 });
  });

  it('moves right correctly', () => {
    const pos = getNextPosition({ x: 10, y: 10 }, 'RIGHT', gridSize, 'walls');
    expect(pos).toEqual({ x: 11, y: 10 });
  });

  it('wraps around in pass-through mode - left edge', () => {
    const pos = getNextPosition({ x: 0, y: 10 }, 'LEFT', gridSize, 'pass-through');
    expect(pos).toEqual({ x: 19, y: 10 });
  });

  it('wraps around in pass-through mode - right edge', () => {
    const pos = getNextPosition({ x: 19, y: 10 }, 'RIGHT', gridSize, 'pass-through');
    expect(pos).toEqual({ x: 0, y: 10 });
  });

  it('wraps around in pass-through mode - top edge', () => {
    const pos = getNextPosition({ x: 10, y: 0 }, 'UP', gridSize, 'pass-through');
    expect(pos).toEqual({ x: 10, y: 19 });
  });

  it('wraps around in pass-through mode - bottom edge', () => {
    const pos = getNextPosition({ x: 10, y: 19 }, 'DOWN', gridSize, 'pass-through');
    expect(pos).toEqual({ x: 10, y: 0 });
  });

  it('does not wrap in walls mode', () => {
    const pos = getNextPosition({ x: 0, y: 10 }, 'LEFT', gridSize, 'walls');
    expect(pos).toEqual({ x: -1, y: 10 });
  });
});

describe('checkWallCollision', () => {
  const gridSize = 20;

  it('returns false in pass-through mode', () => {
    expect(checkWallCollision({ x: -1, y: 10 }, gridSize, 'pass-through')).toBe(false);
    expect(checkWallCollision({ x: 20, y: 10 }, gridSize, 'pass-through')).toBe(false);
  });

  it('detects left wall collision in walls mode', () => {
    expect(checkWallCollision({ x: -1, y: 10 }, gridSize, 'walls')).toBe(true);
  });

  it('detects right wall collision in walls mode', () => {
    expect(checkWallCollision({ x: 20, y: 10 }, gridSize, 'walls')).toBe(true);
  });

  it('detects top wall collision in walls mode', () => {
    expect(checkWallCollision({ x: 10, y: -1 }, gridSize, 'walls')).toBe(true);
  });

  it('detects bottom wall collision in walls mode', () => {
    expect(checkWallCollision({ x: 10, y: 20 }, gridSize, 'walls')).toBe(true);
  });

  it('returns false for valid positions in walls mode', () => {
    expect(checkWallCollision({ x: 0, y: 0 }, gridSize, 'walls')).toBe(false);
    expect(checkWallCollision({ x: 19, y: 19 }, gridSize, 'walls')).toBe(false);
    expect(checkWallCollision({ x: 10, y: 10 }, gridSize, 'walls')).toBe(false);
  });
});

describe('checkSelfCollision', () => {
  it('returns true when head collides with body', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 5, y: 5 }, // Collision!
    ];
    expect(checkSelfCollision(snake[0], snake)).toBe(true);
  });

  it('returns false when no collision', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    expect(checkSelfCollision(snake[0], snake)).toBe(false);
  });

  it('ignores head position (index 0)', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ];
    // The head would collide with itself at index 0, but we skip it
    expect(checkSelfCollision({ x: 5, y: 5 }, snake)).toBe(false);
  });
});

describe('checkFoodCollision', () => {
  it('returns true when positions match', () => {
    expect(checkFoodCollision({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(true);
  });

  it('returns false when positions differ', () => {
    expect(checkFoodCollision({ x: 5, y: 5 }, { x: 6, y: 5 })).toBe(false);
    expect(checkFoodCollision({ x: 5, y: 5 }, { x: 5, y: 6 })).toBe(false);
  });
});

describe('isValidDirectionChange', () => {
  it('allows perpendicular direction changes', () => {
    expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
    expect(isValidDirectionChange('RIGHT', 'UP')).toBe(true);
    expect(isValidDirectionChange('RIGHT', 'DOWN')).toBe(true);
  });

  it('prevents opposite direction changes', () => {
    expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
    expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
  });

  it('allows same direction', () => {
    expect(isValidDirectionChange('UP', 'UP')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
  });
});

describe('calculateSpeed', () => {
  it('returns initial speed at score 0', () => {
    expect(calculateSpeed(0, DEFAULT_CONFIG)).toBe(DEFAULT_CONFIG.initialSpeed);
  });

  it('decreases speed as score increases', () => {
    const speed50 = calculateSpeed(50, DEFAULT_CONFIG);
    const speed100 = calculateSpeed(100, DEFAULT_CONFIG);
    
    expect(speed50).toBeLessThan(DEFAULT_CONFIG.initialSpeed);
    expect(speed100).toBeLessThan(speed50);
  });

  it('does not go below max speed', () => {
    const speedHigh = calculateSpeed(10000, DEFAULT_CONFIG);
    expect(speedHigh).toBe(DEFAULT_CONFIG.maxSpeed);
  });
});

describe('gameTick', () => {
  const createPlayingState = (overrides?: Partial<GameState>): GameState => ({
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 10 },
    direction: 'RIGHT',
    score: 0,
    status: 'playing',
    mode: 'walls',
    speed: 150,
    ...overrides,
  });

  it('moves the snake in the current direction', () => {
    const state = createPlayingState();
    const newState = gameTick(state, 20, DEFAULT_CONFIG);
    
    expect(newState.snake[0]).toEqual({ x: 11, y: 10 });
    expect(newState.snake.length).toBe(3);
  });

  it('grows the snake when eating food', () => {
    const state = createPlayingState({
      snake: [{ x: 14, y: 10 }, { x: 13, y: 10 }, { x: 12, y: 10 }],
      food: { x: 15, y: 10 },
    });
    const newState = gameTick(state, 20, DEFAULT_CONFIG);
    
    expect(newState.snake.length).toBe(4);
    expect(newState.score).toBe(10);
    // Food should be regenerated at a different position
    expect(newState.food).not.toEqual({ x: 15, y: 10 });
  });

  it('ends game on wall collision in walls mode', () => {
    const state = createPlayingState({
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }],
      direction: 'RIGHT',
      mode: 'walls',
    });
    const newState = gameTick(state, 20, DEFAULT_CONFIG);
    
    expect(newState.status).toBe('game-over');
  });

  it('wraps around in pass-through mode', () => {
    const state = createPlayingState({
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }],
      direction: 'RIGHT',
      mode: 'pass-through',
    });
    const newState = gameTick(state, 20, DEFAULT_CONFIG);
    
    expect(newState.status).toBe('playing');
    expect(newState.snake[0]).toEqual({ x: 0, y: 10 });
  });

  it('ends game on self collision', () => {
    // Snake forming a loop where head will collide with body
    // Snake: head at (5,5) moving RIGHT, body wraps around
    const state = createPlayingState({
      snake: [
        { x: 5, y: 5 },   // head - moving RIGHT to (6, 5)
        { x: 5, y: 6 },   // segment 1
        { x: 6, y: 6 },   // segment 2
        { x: 6, y: 5 },   // segment 3 - will collide with new head!
        { x: 7, y: 5 },   // tail - will be removed
      ],
      direction: 'RIGHT',
    });
    
    const newState = gameTick(state, 20, DEFAULT_CONFIG);
    
    expect(newState.status).toBe('game-over');
  });

  it('does nothing if game is not playing', () => {
    const state = createPlayingState({ status: 'paused' });
    const newState = gameTick(state, 20, DEFAULT_CONFIG);
    
    expect(newState).toBe(state);
  });
});

describe('handleDirectionChange', () => {
  it('changes direction when valid', () => {
    const state: GameState = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      direction: 'RIGHT',
      score: 0,
      status: 'playing',
      mode: 'walls',
      speed: 150,
    };
    
    const newState = handleDirectionChange(state, 'UP');
    expect(newState.direction).toBe('UP');
  });

  it('does not change to opposite direction', () => {
    const state: GameState = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      direction: 'RIGHT',
      score: 0,
      status: 'playing',
      mode: 'walls',
      speed: 150,
    };
    
    const newState = handleDirectionChange(state, 'LEFT');
    expect(newState.direction).toBe('RIGHT');
  });

  it('does nothing if game is not playing', () => {
    const state: GameState = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      direction: 'RIGHT',
      score: 0,
      status: 'idle',
      mode: 'walls',
      speed: 150,
    };
    
    const newState = handleDirectionChange(state, 'UP');
    expect(newState.direction).toBe('RIGHT');
  });
});
