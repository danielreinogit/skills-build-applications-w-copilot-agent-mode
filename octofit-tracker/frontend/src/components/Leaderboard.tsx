import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName?: string; totalPoints?: number; rank?: number };

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyMessage="No leaderboard"
      extractItems={(payload) => Array.isArray(payload.leaderboard) ? (payload.leaderboard as LeaderboardEntry[]) : []}
      renderItem={(entry) => (
        <>
          <strong>#{entry.rank ?? 0}</strong> {entry.teamName ?? 'Team'} · {entry.totalPoints ?? 0} points
        </>
      )}
    />
  );
}
