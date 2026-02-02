import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Button } from '@/components/ui/button';
import { DEFAULT_CONFIG, createInitialState, gameTick } from '@/lib/gameLogic';
import { aiPlayerApi } from '@/services/api';
import type { GameState, LiveGame } from '@/types/game';
import { ArrowLeft, Users } from 'lucide-react';

interface SpectatorViewProps {
  game: LiveGame;
  onBack: () => void;
}

export function SpectatorView({ game, onBack }: SpectatorViewProps) {
  // Initialize AI-controlled game state
  const [gameState, setGameState] = useState<GameState>(() => ({
    ...createInitialState(game.mode, DEFAULT_CONFIG.gridSize),
    status: 'playing',
    score: game.currentScore,
  }));
  
  const [viewerCount, setViewerCount] = useState(game.viewerCount);
  const gameLoopRef = useRef<number | null>(null);

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // AI game loop
  const runGameLoop = useCallback(() => {
    let lastTime = 0;
    
    const loop = (currentTime: number) => {
      if (currentTime - lastTime >= gameState.speed) {
        lastTime = currentTime;
        
        setGameState(prev => {
          if (prev.status !== 'playing') return prev;
          
          // Get AI move
          const newDirection = aiPlayerApi.getNextMove(prev, DEFAULT_CONFIG.gridSize);
          const stateWithDirection = { ...prev, direction: newDirection };
          
          // Execute game tick
          const newState = gameTick(stateWithDirection, DEFAULT_CONFIG.gridSize, DEFAULT_CONFIG);
          
          // If game over, restart after a delay
          if (newState.status === 'game-over') {
            setTimeout(() => {
              setGameState({
                ...createInitialState(game.mode, DEFAULT_CONFIG.gridSize),
                status: 'playing',
              });
            }, 2000);
          }
          
          return newState;
        });
      }
      
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    
    gameLoopRef.current = requestAnimationFrame(loop);
  }, [gameState.speed, game.mode]);

  useEffect(() => {
    runGameLoop();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [runGameLoop]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{viewerCount} watching</span>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="text-xs text-destructive uppercase font-semibold">Live</span>
          </div>
        </div>
      </div>
      
      {/* Player info */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Watching</p>
        <h2 className="font-arcade text-xl neon-text">{game.playerName}</h2>
      </div>
      
      {/* Game view */}
      <div className="relative">
        <GameCanvas
          snake={gameState.snake}
          food={gameState.food}
          gridSize={DEFAULT_CONFIG.gridSize}
          cellSize={DEFAULT_CONFIG.cellSize}
          showWalls={gameState.mode === 'walls'}
        />
        
        {/* Game over overlay */}
        {gameState.status === 'game-over' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-arcade text-destructive text-xl mb-2">GAME OVER</h3>
              <p className="text-muted-foreground">Restarting...</p>
            </div>
          </div>
        )}
        
        {/* Spectator badge */}
        <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
          👁️ Spectating
        </div>
      </div>
      
      {/* Score */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Score</p>
        <p className="font-arcade text-3xl neon-text">{gameState.score}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Mode: {gameState.mode === 'walls' ? 'WALLS' : 'PASS-THROUGH'}
        </p>
      </div>
    </div>
  );
}
