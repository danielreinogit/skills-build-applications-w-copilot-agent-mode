import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title?: string; reason?: string };

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
      emptyMessage="No suggestions"
      extractItems={(payload) => Array.isArray(payload.suggestions) ? (payload.suggestions as WorkoutSuggestion[]) : []}
      renderItem={(suggestion) => (
        <>
          <strong>{suggestion.title ?? 'Workout'}</strong> · {suggestion.reason ?? 'Recommended for your goal'}
        </>
      )}
    />
  );
}
