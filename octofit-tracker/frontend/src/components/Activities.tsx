import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = { type?: string; minutes?: number; points?: number };

async function loadActivities(): Promise<Activity[]> {
  const payload = await getJson<{ activities: Activity[] }>('/api/activities');
  return payload.activities;
}

function renderActivity(activity: Activity) {
  return (
    <>
      <strong>{activity.type ?? 'Activity'}</strong> · {activity.minutes ?? 0} minutes · {activity.points ?? 0} points
    </>
  );
}

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      emptyMessage="No activities"
      loadItems={loadActivities}
      renderItem={renderActivity}
    />
  );
}
