import React, { memo } from 'react';
import type { Position } from '@/types/game';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  cellSize: number;
  showWalls: boolean;
}

export const GameCanvas = memo(function GameCanvas({ 
  snake, 
  food, 
  gridSize, 
  cellSize,
  showWalls 
}: GameCanvasProps) {
  const canvasSize = gridSize * cellSize;
  
  return (
    <div 
      className="relative neon-border"
      style={{ 
        width: canvasSize, 
        height: canvasSize,
      }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 game-grid"
        style={{ backgroundSize: `${cellSize}px ${cellSize}px` }}
      />
      
      {/* Walls indicator */}
      {showWalls && (
        <div className="absolute inset-0 border-2 border-wall pointer-events-none" />
      )}
      
      {/* Snake */}
      {snake.map((segment, index) => (
        <div
          key={`snake-${index}`}
          className={`absolute transition-all duration-75 ${
            index === 0 
              ? 'bg-primary rounded-sm z-10' 
              : 'bg-primary/80 rounded-sm'
          }`}
          style={{
            left: segment.x * cellSize + 1,
            top: segment.y * cellSize + 1,
            width: cellSize - 2,
            height: cellSize - 2,
            boxShadow: index === 0 
              ? '0 0 10px hsl(var(--snake)), 0 0 20px hsl(var(--snake) / 0.5)' 
              : '0 0 5px hsl(var(--snake) / 0.5)',
          }}
        />
      ))}
      
      {/* Food */}
      <div
        className="absolute rounded-full bg-food animate-pulse-glow"
        style={{
          left: food.x * cellSize + 2,
          top: food.y * cellSize + 2,
          width: cellSize - 4,
          height: cellSize - 4,
          boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food) / 0.6)',
        }}
      />
      
      {/* CRT effect overlay */}
      <div className="crt-effect absolute inset-0 pointer-events-none" />
    </div>
  );
});
