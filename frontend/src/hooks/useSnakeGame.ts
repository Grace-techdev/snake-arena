import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameMode, Direction } from '@/types/game';
import { 
  createInitialState, 
  gameTick, 
  handleDirectionChange,
  DEFAULT_CONFIG 
} from '@/lib/gameLogic';

interface UseSnakeGameOptions {
  gridSize?: number;
  mode?: GameMode;
  onGameOver?: (score: number) => void;
}

export function useSnakeGame(options: UseSnakeGameOptions = {}) {
  const { 
    gridSize = DEFAULT_CONFIG.gridSize, 
    mode = 'walls',
    onGameOver 
  } = options;
  
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(mode, gridSize)
  );
  
  const gameLoopRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<Direction>(gameState.direction);
  
  // Reset game
  const resetGame = useCallback((newMode?: GameMode) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(createInitialState(newMode ?? mode, gridSize));
    lastDirectionRef.current = 'RIGHT';
  }, [mode, gridSize]);
  
  // Start game
  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);
  
  // Pause game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      status: prev.status === 'playing' ? 'paused' : prev.status 
    }));
  }, []);
  
  // Resume game
  const resumeGame = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      status: prev.status === 'paused' ? 'playing' : prev.status 
    }));
  }, []);
  
  // Change direction
  const changeDirection = useCallback((direction: Direction) => {
    setGameState(prev => {
      const newState = handleDirectionChange(prev, direction);
      if (newState.direction !== prev.direction) {
        lastDirectionRef.current = newState.direction;
      }
      return newState;
    });
  }, []);
  
  // Change mode
  const changeMode = useCallback((newMode: GameMode) => {
    resetGame(newMode);
  }, [resetGame]);
  
  // Store callbacks in refs to avoid effect re-runs
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  
  // Game loop - only depend on status to prevent multiple loops
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    let lastTime = performance.now();
    
    const loop = (currentTime: number) => {
      setGameState(prev => {
        // Only tick if enough time has passed
        if (currentTime - lastTime < prev.speed) {
          return prev;
        }
        
        lastTime = currentTime;
        const newState = gameTick(prev, gridSize, DEFAULT_CONFIG);
        
        // Check for game over
        if (newState.status === 'game-over' && prev.status === 'playing') {
          onGameOverRef.current?.(newState.score);
        }
        
        return newState;
      });
      
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    
    gameLoopRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState.status, gridSize]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          pauseGame();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, changeDirection, pauseGame]);
  
  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    changeDirection,
    changeMode,
  };
}
