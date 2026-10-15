import { CapabilityCard } from './CapabilityCard.js';

type Team = { name?: string; members?: unknown[] };

function extractTeams(payload: Record<string, unknown>): Team[] {
  return Array.isArray(payload.teams) ? payload.teams as Team[] : [];
}

function renderTeam(team: Team) {
  return (
    <>
      <strong>{team.name ?? 'Unknown team'}</strong> · {Array.isArray(team.members) ? team.members.length : 0} members
    </>
  );
}

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyMessage="No teams"
      extractItems={extractTeams}
      renderItem={renderTeam}
    />
  );
}
