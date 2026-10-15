# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the React routes and shared fetch logic isolated from the backend and keep each page responsible only for rendering the API response, loading status, and accessible error states. This preserves the separation described in the tier boundaries and keeps the browser surface thin.
- Logic tier decision: Centralize validation, persistence, and aggregation in the Express service layer so the routes stay small and consistent. Validation should return deliberate 4xx responses for malformed input and missing references instead of leaking Mongoose cast errors.
- Data tier decision: Use Mongoose schemas with required fields, object refs, and idempotent seed data so each capability is backed by a stable data model. Keep the seed script resilient to repeated execution so the project can be re-seeded safely in local and test environments.
- Activity tracking approach: Verify `userId` and `teamId` as valid ObjectIds, confirm they resolve to existing records, reject invalid payloads with `400`-range errors, and compute `points` plus `occurredAt` when the record is created. This matches the API contract and avoids 500s from cast exceptions.
- Team management approach: Require a `name` and `mascot`, default `members` to an empty array, and preserve member references as ObjectIds. Team creation should accept valid user IDs in `members` but reject empty or malformed payloads with a `400` response.
- Leaderboard approach: Aggregate activity points by team, sort total points descending, and assign a 1-based rank after ordering. This keeps the leaderboard deterministic and easy for the frontend to display.
- Workout suggestions approach: Look up the seeded user by email, inspect their recent activity pattern or goal, and return relevant workout suggestions with a reason string. If the email does not match a user, return a deliberate 4xx response rather than an empty result or a server error.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Current result: fails in four schema-validation tests because `User`, `Team`, `Activity`, and `Workout` definitions do not enforce the required fields the contract expects.
  - Meaning: the root cause is in the data model layer, not the service layer.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Current result: fails because activity and team creation are still stubbed with `501` responses, the leaderboard returns an empty array, and workout suggestions do not match user activity.
  - Meaning: the service layer remains incomplete and must be implemented before the API can satisfy the contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Current result: fails because each route renders the placeholder “Implementation pending” state instead of handling loading, empty, success, and error states with accessible output.
  - Meaning: the UI must wait for the backend contract to stabilize before the front-end contract can be met.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Status: not yet run; this should be used after the data and API contracts pass to verify TypeScript and runtime compatibility.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Status: not yet run; this should be used after the presentation contract passes to confirm the React app builds cleanly with Vite and TypeScript.
