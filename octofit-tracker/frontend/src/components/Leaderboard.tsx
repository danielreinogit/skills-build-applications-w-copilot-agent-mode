import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName?: string; totalPoints?: number; rank?: number };

async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const payload = await getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
  return payload.leaderboard;
}

function renderEntry(entry: LeaderboardEntry) {
  return (
    <>
      <strong>#{entry.rank ?? 0}</strong> {entry.teamName ?? 'Team'} · {entry.totalPoints ?? 0} points
    </>
  );
}

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      emptyMessage="No leaderboard"
      loadItems={loadLeaderboard}
      renderItem={renderEntry}
    />
  );
}
