# jubilant-fishstick

Dashboard frontend for the client-facing sales reporting experience.

## Stack

- Next.js App Router
- TypeScript
- Recharts for the stacked revenue chart
- Same-origin proxy routes for backend access

## Runtime configuration

- `DASHBOARD_API_BASE_URL`

If unset, the app defaults to the in-cluster API service URL:

`http://dashboard-api.app.svc.cluster.local:8080`

## Routes

- `/` dashboard page
- `/api/healthz`
- `/api/pipelines`
- `/api/dashboard/won-by-funnel`
- `/api/pipelines/:pipelineID/monthly-breakdown?month=YYYY-MM`

## Dashboard behavior

- The top chart shows the previous 12 fully closed months of won revenue, stacked by funnel.
- If the current month is April 2026, the chart window is April 2025 through March 2026.
- The drill-down cards default to the current month.
- Clicking a chart month updates the stage, owner, and product breakdowns for the selected funnel.

## Local development

```bash
npm install
npm run dev
```

Set `DASHBOARD_API_BASE_URL` when the API is not reachable at the default cluster DNS name.
