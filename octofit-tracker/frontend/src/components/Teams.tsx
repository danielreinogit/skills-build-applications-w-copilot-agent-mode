import { CapabilityCard } from './CapabilityCard.js';

type Team = { name?: string; members?: unknown[] };

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyMessage="No teams"
      extractItems={(payload) => Array.isArray(payload.teams) ? (payload.teams as Team[]) : []}
      renderItem={(team) => (
        <>
          <strong>{team.name ?? 'Unknown team'}</strong> · {Array.isArray(team.members) ? team.members.length : 0} members
        </>
      )}
    />
  );
}
