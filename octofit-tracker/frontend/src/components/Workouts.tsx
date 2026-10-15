import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = { title?: string; reason?: string };

async function loadSuggestions(): Promise<WorkoutSuggestion[]> {
  const payload = await getJson<{ suggestions: WorkoutSuggestion[] }>('/api/workouts/suggestions/mona@example.com');
  return payload.suggestions;
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
      emptyMessage="No suggestions"
      loadItems={loadSuggestions}
      renderItem={renderSuggestion}
    />
  );
}
