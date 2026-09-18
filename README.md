# Kopala ICR 2026 — Admin Dashboard

A React + TypeScript + MUI single-page app for staff to manage
registrations, payments, and cash withdrawals for the KCM Kopala Inter
Company Relay 2026 event. It's the dashboard SPA the
[kopalaicr-api](../kopalaicr-api) backend's README calls
`kopalaicr-admin` — built against that API's JWT-protected admin
surface (`apps.accounts` + `admin/*` views in
`apps.registrations`/`apps.payments`).

Day-to-day category/user management stays in the backend's own
`/django-admin/`; this dashboard only covers what that backend exposes to
it: registrations (individual + team), dashboard stats, exports, bulk
upload, and cash withdrawals.

## Stack

- Vite + React 18 + TypeScript
- MUI (Material UI) + MUI X DataGrid + MUI X Charts
- React Router

## Running locally

Requires the [kopalaicr-api](../kopalaicr-api) backend running (see its
README — `docker compose up -d --build`, default `http://localhost:8004`).

```bash
npm install
cp .env.example .env   # defaults already point at http://localhost:8004
npm run dev
```

Sign in with a staff account created via the backend's
`python manage.py createsuperuser` (or any user with `is_staff=True` set
in `/django-admin/`) — the same account works for both `/django-admin/`
and this dashboard.

The dev server listens on port 5177 by default — matches the range
(5177-5179) the backend's `CORS_ALLOWED_ORIGINS` default already
reserves for this dashboard, so no backend config change is needed for
local dev (see `backend/config/settings/base.py`).

## What's here

- **Dashboard** — per-entry-type (Individual / Team) stats: totals,
  registered-today count, status breakdown, revenue collected/pending/
  today, total potential income, and cash available.
- **Individual registrations** — search/filter (status, category,
  gender, club/institution), view/edit/delete, manual "Add person"
  (walk-in/phone), bulk upload from CSV/XLSX, and an Excel export.
- **Team (Relay) registrations** — search/filter (status, category,
  division), view/edit/delete, manual "Add team" (with roster), and an
  Excel export. Roster edits after registration stay Django-admin-only,
  matching the backend (there's no self-service captain dashboard).
- **Cash withdrawals** — per entry type, record cash taken out of what's
  been collected; shows revenue collected / withdrawn / available.
- **Profile** — the signed-in admin's own details (read-only; changes go
  through `/django-admin/`).

Manually confirming a registration (creating one as `CONFIRMED`, or
editing its status to that) records a matching cash/EFT payment under
the chosen method, exactly like the backend's admin API — see
[kopalaicr-api's README](../kopalaicr-api/README.md#api-surface) for the
full endpoint list this dashboard talks to.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API. `same-origin` for a single-domain deployment behind the same reverse proxy; a full URL for a separate deployment (e.g. Vercel + a standalone API server). |

## Deploying

**Vercel (or any static host)** — this is a standalone SPA build, no
server-side code:

```bash
npm run build   # outputs dist/
```

`vercel.json` is already set up for SPA client-side routing.

**Docker** (nginx serving the built assets) — `Dockerfile` builds with
`VITE_API_BASE_URL` as a build arg (Vite bakes `VITE_*` vars in at build
time, so it can't be changed at container-run time without rebuilding):

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-api-host -t kopalaicr-main-admin .
docker run -p 8080:80 kopalaicr-main-admin
```

Whichever way this deploys, add its real origin to `CORS_ALLOWED_ORIGINS`
(or the `kopalaicr2026.com` subdomain regex already in place) in the
backend's `backend/.env`.
