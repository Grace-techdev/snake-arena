import React, { useState } from 'react';
import { SnakeGame } from '@/components/game/SnakeGame';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { LiveGamesList } from '@/components/spectator/LiveGamesList';
import { SpectatorView } from '@/components/spectator/SpectatorView';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { spectatorApi } from '@/services/api';
import type { LiveGame } from '@/types/game';
import { Gamepad2, Trophy, Eye } from 'lucide-react';

export default function Index() {
  const [activeTab, setActiveTab] = useState('play');
  const [spectatingGame, setSpectatingGame] = useState<LiveGame | null>(null);

  const handleSelectGame = async (gameId: string) => {
    const games = await spectatorApi.getLiveGames();
    const game = games.find(g => g.id === gameId);
    if (game) {
      await spectatorApi.joinGame(gameId);
      setSpectatingGame(game);
    }
  };

  const handleBackFromSpectator = async () => {
    if (spectatingGame) {
      await spectatorApi.leaveGame(spectatingGame.id);
    }
    setSpectatingGame(null);
  };

  // If spectating, show spectator view
  if (spectatingGame) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <SpectatorView game={spectatingGame} onBack={handleBackFromSpectator} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="play" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Play</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="watch" className="gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Watch</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="play" className="flex justify-center">
            <SnakeGame />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
          
          <TabsContent value="watch">
            <div className="max-w-md mx-auto">
              <LiveGamesList onSelectGame={handleSelectGame} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        <p>SNAKE.IO — A multiplayer snake game</p>
      </footer>
    </div>
  );
}
