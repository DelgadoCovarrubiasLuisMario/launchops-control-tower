# Interview Talk Track

## 30-second explanation

LaunchOps Control Tower is a full-stack SaaS operations dashboard for engineering teams. It tracks deployments, incidents, feature flags, audit events and operational KPIs. I built it with React, Vite, TypeScript, Tailwind, Node, Express, MySQL, Sequelize and Socket.IO to demonstrate full-cycle product engineering, not just CRUD screens.

## What makes it stronger than a typical portfolio project

Most junior portfolios show basic CRUD apps. This project adds more production-like concepts:

- Authentication and RBAC.
- Multi-organization modeling.
- Real-time Socket.IO events.
- Audit trails.
- Feature flags.
- Deployment status workflows.
- Incident severity management.
- API security with Helmet, CORS and rate limiting.
- Server-state management with TanStack Query.
- Reusable UI components.

## Technical decisions

### Why Socket.IO?

Operational dashboards benefit from realtime updates. A deployment or incident view should not require refreshing the browser to see important changes.

### Why Sequelize + MySQL?

This aligns with my professional experience and allows a relational model for organizations, users, deployments, incidents, flags, metrics and audit events.

### Why audit logs?

Actions like changing deployment status or toggling production flags need traceability. Audit events make the system feel closer to an internal product used by real teams.

### Why TanStack Query?

The app depends on server state: data that is remote, shared, cached and may become stale. TanStack Query helps organize that clearly.

## Possible improvements

- Add automated tests with Vitest and Supertest.
- Add Docker Compose for local MySQL.
- Add GitHub Actions CI.
- Add OpenAPI/Swagger documentation.
- Add refresh tokens.
- Add deployment previews.
- Add a public read-only demo mode.
