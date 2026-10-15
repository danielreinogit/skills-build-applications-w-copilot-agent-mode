import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.js';

const routes = [
  { route: '/activities', response: { activities: [{ type: 'run', minutes: 30, points: 30 }] } },
  { route: '/teams', response: { teams: [{ name: 'Octocats', members: [] }] } },
  { route: '/leaderboard', response: { leaderboard: [{ teamName: 'Octocats', totalPoints: 30, rank: 1 }] } },
  { route: '/workouts', response: { suggestions: [{ title: 'Intervals', reason: 'Build endurance' }] } },
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('capability API requests', () => {
  for (const { route, response } of routes) {
    it(`${route} fetches once after rendering its response`, async () => {
      const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );

      await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  }
});
