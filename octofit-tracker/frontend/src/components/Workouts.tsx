import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title?: string; reason?: string };

function extractSuggestions(payload: Record<string, unknown>): WorkoutSuggestion[] {
  return Array.isArray(payload.suggestions) ? payload.suggestions as WorkoutSuggestion[] : [];
}

function renderSuggestion(suggestion: WorkoutSuggestion) {
  return (
    <>
      <strong>{suggestion.title ?? 'Workout'}</strong> · {suggestion.reason ?? 'Recommended for your goal'}
    </>
  );
}

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
      emptyMessage="No suggestions"
      extractItems={extractSuggestions}
      renderItem={renderSuggestion}
    />
  );
}
