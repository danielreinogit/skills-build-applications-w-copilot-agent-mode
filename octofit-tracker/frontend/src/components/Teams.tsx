import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = { name?: string; members?: unknown[] };

async function loadTeams(): Promise<Team[]> {
  const payload = await getJson<{ teams: Team[] }>('/api/teams');
  return payload.teams;
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
      emptyMessage="No teams"
      loadItems={loadTeams}
      renderItem={renderTeam}
    />
  );
}
