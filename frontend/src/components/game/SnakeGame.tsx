import React from 'react';
import { GameCanvas } from './GameCanvas';
import { GameControls } from './GameControls';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { DEFAULT_CONFIG } from '@/lib/gameLogic';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardApi } from '@/services/api';
import { toast } from 'sonner';

interface SnakeGameProps {
  onScoreSubmit?: (score: number) => void;
}

export function SnakeGame({ onScoreSubmit }: SnakeGameProps) {
  const { isAuthenticated } = useAuth();
  
  const handleGameOver = async (score: number) => {
    if (isAuthenticated && score > 0) {
      try {
        const result = await leaderboardApi.submitScore(score, gameState.mode);
        if (result.isHighScore) {
          toast.success(`New high score! Rank #${result.rank}`);
        }
        onScoreSubmit?.(score);
      } catch {
        // Silently fail score submission
      }
    }
  };
  
  const {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    changeMode,
  } = useSnakeGame({
    gridSize: DEFAULT_CONFIG.gridSize,
    mode: 'walls',
    onGameOver: handleGameOver,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
      {/* Game Area */}
      <div className="relative">
        <GameCanvas
          snake={gameState.snake}
          food={gameState.food}
          gridSize={DEFAULT_CONFIG.gridSize}
          cellSize={DEFAULT_CONFIG.cellSize}
          showWalls={gameState.mode === 'walls'}
        />
        
        {/* Overlay for idle/paused/game-over states */}
        {gameState.status !== 'playing' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center space-y-4">
              {gameState.status === 'idle' && (
                <>
                  <h2 className="font-arcade text-xl neon-text">SNAKE</h2>
                  <p className="text-muted-foreground text-sm">Press START to play</p>
                </>
              )}
              
              {gameState.status === 'paused' && (
                <>
                  <h2 className="font-arcade text-xl neon-text-cyan">PAUSED</h2>
                  <p className="text-muted-foreground text-sm">Press RESUME to continue</p>
                </>
              )}
              
              {gameState.status === 'game-over' && (
                <>
                  <h2 className="font-arcade text-xl text-destructive">GAME OVER</h2>
                  <p className="font-arcade text-2xl neon-text">{gameState.score}</p>
                  <p className="text-muted-foreground text-sm">Press PLAY AGAIN</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Side Panel */}
      <div className="flex flex-col gap-6 min-w-[200px]">
        {/* Score Display */}
        <div className="text-center lg:text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Score</p>
          <p className="font-arcade text-3xl neon-text">{gameState.score}</p>
        </div>
        
        {/* Mode Display */}
        <div className="text-center lg:text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Mode</p>
          <p className="font-arcade text-sm neon-text-cyan">
            {gameState.mode === 'walls' ? 'WALLS' : 'PASS-THRU'}
          </p>
        </div>
        
        {/* Controls */}
        <GameControls
          status={gameState.status}
          mode={gameState.mode}
          onStart={startGame}
          onPause={pauseGame}
          onResume={resumeGame}
          onReset={() => resetGame()}
          onModeChange={changeMode}
        />
      </div>
    </div>
  );
}
