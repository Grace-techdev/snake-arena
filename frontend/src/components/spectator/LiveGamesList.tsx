import React, { useState, useEffect } from 'react';
import { spectatorApi } from '@/services/api';
import type { LiveGame } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Eye, Users, Loader2 } from 'lucide-react';

interface LiveGamesListProps {
  onSelectGame: (gameId: string) => void;
}

export function LiveGamesList({ onSelectGame }: LiveGamesListProps) {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const data = await spectatorApi.getLiveGames();
      setGames(data);
      setLoading(false);
    };
    
    fetchGames();
    
    // Refresh every 3 seconds
    const interval = setInterval(fetchGames, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No live games right now</p>
        <p className="text-sm">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-arcade text-lg flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-secondary" />
        LIVE GAMES
      </h2>
      
      {games.map((game) => (
        <div
          key={game.id}
          className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{game.playerName}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {game.viewerCount}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-arcade text-lg text-primary">{game.currentScore}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {game.mode === 'walls' ? 'WALLS' : 'PASS-THRU'}
              </span>
            </div>
            
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onSelectGame(game.id)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Watch
            </Button>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="text-xs text-destructive uppercase">Live</span>
          </div>
        </div>
      ))}
    </div>
  );
}
