# LaunchOps Control Tower

**LaunchOps Control Tower** is the star project of this portfolio: a full-stack SaaS command center for engineering teams that need to track deployments, incidents, feature flags, audit events and operational KPIs in real time.

It is intentionally designed to look and feel like a professional internal platform rather than a generic CRUD app. The project aligns with Luis Mario Delgado Covarrubias' CV experience in React/Vite/TypeScript, Node/Express/TypeScript, MySQL, Sequelize, Git/GitHub workflows, CORS, authentication, role-based flows, security hardening, client delivery and full-cycle web solutions.

## Why this project stands out

- Real-time updates with Socket.IO.
- JWT authentication with role-based access control.
- Multi-organization data model.
- Audit trail for operational actions.
- Feature flag management.
- Deployment intelligence dashboard.
- Incident severity tracking.
- API health endpoint and public URL configuration pattern.
- MySQL + Sequelize models with seed data.
- React dashboard built with reusable components.
- Tailwind CSS v4 + Vite.
- Command palette for fast navigation.
- Motion-based microinteractions.
- TanStack Query for server-state fetching.
- Recharts for visual analytics.

## Tech stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS v4
- TanStack Query
- React Hook Form
- Zod
- Socket.IO Client
- Recharts
- Motion
- Lucide React
- cmdk

### Backend

- Node.js
- Express
- TypeScript
- MySQL
- Sequelize
- Socket.IO
- JWT
- Zod
- Helmet
- CORS
- Express Rate Limit
- Pino HTTP Logger

## Demo users

After seeding the database, use:

| Role | Email | Password |
|---|---|---|
| Admin | admin@launchops.dev | password123 |
| Engineer | engineer@launchops.dev | password123 |
| Viewer | viewer@launchops.dev | password123 |

## Getting started

```bash
cd launchops-control-tower
docker compose up -d
npm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

npm run seed
npm run dev
```

The web app runs on `http://localhost:5173` and the API runs on `http://localhost:4000`. The included Docker Compose file starts a local MySQL 8.4 database for development.

## Suggested GitHub topics

`react` `typescript` `nodejs` `express` `mysql` `sequelize` `socketio` `tailwindcss` `tanstack-query` `full-stack` `saas` `dashboard` `portfolio-project`

## Architecture

```txt
launchops-control-tower/
├── apps/
│   ├── api/        Node + Express + Sequelize + Socket.IO
│   └── web/        React + Vite + Tailwind + TanStack Query
├── docs/           CV entry, interview talk track and API requests
└── README.md
```

## Portfolio positioning

Use this as the first featured project in your portfolio. The other projects show specialization, but this one shows architecture, product thinking and seniority signals.

Recommended project order:

1. LaunchOps Control Tower — star project / SaaS command center.
2. ServiceFlow Suite — full-stack service operations system.
3. CommerceBridge Studio — e-commerce + Liquid + leads dashboard.
4. InsightOps Dashboard — analytics + SQL + reporting.
