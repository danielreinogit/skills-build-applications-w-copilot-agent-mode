import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName?: string; totalPoints?: number; rank?: number };

function extractEntries(payload: Record<string, unknown>): LeaderboardEntry[] {
  return Array.isArray(payload.leaderboard) ? payload.leaderboard as LeaderboardEntry[] : [];
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
      path="/api/leaderboard"
      emptyMessage="No leaderboard"
      extractItems={extractEntries}
      renderItem={renderEntry}
    />
  );
}
