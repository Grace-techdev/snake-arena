import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '@/services/api';
import type { LeaderboardEntry, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await leaderboardApi.getLeaderboard(
        filter === 'all' ? undefined : filter,
        10
      );
      setEntries(data);
      setLoading(false);
    };
    
    fetchLeaderboard();
  }, [filter]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-arcade text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          LEADERBOARD
        </h2>
      </div>
      
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="flex-1 text-xs"
        >
          ALL
        </Button>
        <Button
          variant={filter === 'walls' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('walls')}
          className="flex-1 text-xs"
        >
          WALLS
        </Button>
        <Button
          variant={filter === 'pass-through' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pass-through')}
          className="flex-1 text-xs"
        >
          PASS-THRU
        </Button>
      </div>
      
      {/* Leaderboard table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr className="text-xs text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Mode</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr 
                  key={entry.id}
                  className={`border-t border-border ${
                    index === 0 ? 'bg-primary/10' : 
                    index === 1 ? 'bg-secondary/10' : 
                    index === 2 ? 'bg-accent/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-arcade text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : entry.rank}
                  </td>
                  <td className="px-4 py-3 font-medium">{entry.username}</td>
                  <td className="px-4 py-3 text-right font-arcade text-primary">
                    {entry.score.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                    {entry.mode === 'walls' ? 'WALLS' : 'PASS'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
