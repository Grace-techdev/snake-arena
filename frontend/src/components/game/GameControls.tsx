import React from 'react';
import type { GameMode, GameStatus, GameSpeed } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  speed: GameSpeed;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
  onSpeedChange: (speed: GameSpeed) => void;
}

export function GameControls({
  status,
  mode,
  speed,
  onStart,
  onPause,
  onResume,
  onReset,
  onModeChange,
  onSpeedChange,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'walls' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          className="flex-1 font-arcade text-[8px]"
          disabled={status === 'playing'}
        >
          WALLS
        </Button>
        <Button
          variant={mode === 'pass-through' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('pass-through')}
          className="flex-1 font-arcade text-[8px]"
          disabled={status === 'playing'}
        >
          PASS-THRU
        </Button>
      </div>

      {/* Speed selector */}
      <div className="flex gap-2">
        <Button
          variant={speed === 'slow' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSpeedChange('slow')}
          className="flex-1 font-arcade text-[8px]"
          disabled={status === 'playing' || status === 'paused'}
        >
          SLOW
        </Button>
        <Button
          variant={speed === 'normal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSpeedChange('normal')}
          className="flex-1 font-arcade text-[8px]"
          disabled={status === 'playing' || status === 'paused'}
        >
          NORMAL
        </Button>
        <Button
          variant={speed === 'fast' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSpeedChange('fast')}
          className="flex-1 font-arcade text-[8px]"
          disabled={status === 'playing' || status === 'paused'}
        >
          FAST
        </Button>
      </div>

      {/* Game controls */}
      <div className="flex gap-2">
        {status === 'idle' && (
          <Button onClick={onStart} className="flex-1 gap-2">
            <Play className="w-4 h-4" />
            START
          </Button>
        )}

        {status === 'playing' && (
          <Button onClick={onPause} variant="secondary" className="flex-1 gap-2">
            <Pause className="w-4 h-4" />
            PAUSE
          </Button>
        )}

        {status === 'paused' && (
          <Button onClick={onResume} className="flex-1 gap-2">
            <Play className="w-4 h-4" />
            RESUME
          </Button>
        )}

        {status === 'game-over' && (
          <Button onClick={onReset} className="flex-1 gap-2">
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </Button>
        )}

        {(status === 'playing' || status === 'paused') && (
          <Button onClick={onReset} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>↑ ← ↓ → or WASD to move</p>
        <p>SPACE to pause</p>
      </div>
    </div>
  );
}
