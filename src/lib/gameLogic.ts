import type { Position, Direction, GameState, GameMode, GameConfig } from '@/types/game';

export const DEFAULT_CONFIG: GameConfig = {
  gridSize: 20,
  cellSize: 20,
  initialSpeed: 150,
  speedIncrement: 5,
  maxSpeed: 50,
};

/**
 * Creates initial game state
 */
export function createInitialState(mode: GameMode, gridSize: number): GameState {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  
  return {
    snake: [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ],
    food: generateFood([{ x: centerX, y: centerY }, { x: centerX - 1, y: centerY }, { x: centerX - 2, y: centerY }], gridSize),
    direction: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    speed: DEFAULT_CONFIG.initialSpeed,
  };
}

/**
 * Generates food at a random position not occupied by the snake
 */
export function generateFood(snake: Position[], gridSize: number): Position {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
  
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (occupied.has(`${position.x},${position.y}`));
  
  return position;
}

/**
 * Gets the next position based on current position and direction
 */
export function getNextPosition(
  position: Position, 
  direction: Direction, 
  gridSize: number, 
  mode: GameMode
): Position {
  let newX = position.x;
  let newY = position.y;
  
  switch (direction) {
    case 'UP': newY--; break;
    case 'DOWN': newY++; break;
    case 'LEFT': newX--; break;
    case 'RIGHT': newX++; break;
  }
  
  // Handle pass-through mode (wrap around)
  if (mode === 'pass-through') {
    if (newX < 0) newX = gridSize - 1;
    if (newX >= gridSize) newX = 0;
    if (newY < 0) newY = gridSize - 1;
    if (newY >= gridSize) newY = 0;
  }
  
  return { x: newX, y: newY };
}

/**
 * Checks if a position collides with walls (only in walls mode)
 */
export function checkWallCollision(position: Position, gridSize: number, mode: GameMode): boolean {
  if (mode === 'pass-through') return false;
  
  return (
    position.x < 0 ||
    position.x >= gridSize ||
    position.y < 0 ||
    position.y >= gridSize
  );
}

/**
 * Checks if a position collides with the snake body
 */
export function checkSelfCollision(position: Position, snake: Position[]): boolean {
  // Check collision with body (skip head at index 0)
  return snake.slice(1).some(segment => 
    segment.x === position.x && segment.y === position.y
  );
}

/**
 * Checks if a position matches the food position
 */
export function checkFoodCollision(position: Position, food: Position): boolean {
  return position.x === food.x && position.y === food.y;
}

/**
 * Returns true if the new direction is valid (not opposite to current)
 */
export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  const opposites: Record<Direction, Direction> = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT',
  };
  
  return current !== opposites[next];
}

/**
 * Calculates the new speed based on current score
 */
export function calculateSpeed(score: number, config: GameConfig): number {
  const reduction = Math.floor(score / 50) * config.speedIncrement;
  return Math.max(config.maxSpeed, config.initialSpeed - reduction);
}

/**
 * Main game tick - moves the snake and handles collisions
 */
export function gameTick(state: GameState, gridSize: number, config: GameConfig): GameState {
  if (state.status !== 'playing') return state;
  
  const head = state.snake[0];
  const newHead = getNextPosition(head, state.direction, gridSize, state.mode);
  
  // Check wall collision
  if (checkWallCollision(newHead, gridSize, state.mode)) {
    return { ...state, status: 'game-over' };
  }
  
  // Check self collision
  if (checkSelfCollision(newHead, state.snake)) {
    return { ...state, status: 'game-over' };
  }
  
  // Check food collision
  const ateFood = checkFoodCollision(newHead, state.food);
  
  // Create new snake
  const newSnake = [newHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop(); // Remove tail if didn't eat
  }
  
  // Calculate new score and speed
  const newScore = ateFood ? state.score + 10 : state.score;
  const newSpeed = calculateSpeed(newScore, config);
  
  // Generate new food if eaten
  const newFood = ateFood ? generateFood(newSnake, gridSize) : state.food;
  
  return {
    ...state,
    snake: newSnake,
    food: newFood,
    score: newScore,
    speed: newSpeed,
  };
}

/**
 * Handles direction change input
 */
export function handleDirectionChange(state: GameState, newDirection: Direction): GameState {
  if (state.status !== 'playing') return state;
  
  if (isValidDirectionChange(state.direction, newDirection)) {
    return { ...state, direction: newDirection };
  }
  
  return state;
}
