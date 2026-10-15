import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type?: string; minutes?: number; points?: number };

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyMessage="No activities"
      extractItems={(payload) => Array.isArray(payload.activities) ? (payload.activities as Activity[]) : []}
      renderItem={(activity) => (
        <>
          <strong>{activity.type ?? 'Activity'}</strong> · {activity.minutes ?? 0} minutes · {activity.points ?? 0} points
        </>
      )}
    />
  );
}
