# 🚀 Hyperniche — B2B2C Creator-Brand Platform

Production-ready B2B2C platform connecting D2C brands with hyper-niche creators.

## 🛠️ Tech Stack (Strict Rulebook)

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Java 17+, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Hibernate, OpenAPI / Swagger
- **Database:** Supabase PostgreSQL, Relational Constraints, Indexes & Row Level Security (RLS)
- **Auth & Realtime:** Supabase Auth (JWT verified by Spring Security) & Supabase Realtime
- **Code Optimization:** Ponytail (`@dietrichgebert/ponytail`) Anti-Bloat Rules

---

## 📁 Project Structure

```
hyperniche_official/
├── backend/                       # Java Spring Boot REST API
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/hyperniche/
│       │   ├── config/            # Spring Security, OpenAPI, CORS
│       │   ├── users/             # User entity, sync, roles (RBAC)
│       │   ├── creators/          # Creator directory & profile management
│       │   ├── brands/            # Brand profiles
│       │   ├── campaigns/         # Campaign briefs & lifecycle
│       │   ├── applications/      # Creator applications & review pipeline
│       │   ├── messaging/         # In-app chat persistence
│       │   ├── safety/            # Anti-circumvention moderation
│       │   └── payments/          # Creator verification fees & transactions
│       └── main/resources/
│           └── application.yml
├── frontend/                      # Next.js App Router Frontend
│   ├── package.json
│   ├── src/
│   │   ├── app/                   # App Router pages (/campaigns, /creators, /applications, /messages, /profile)
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components (Button, Input, Card, Badge)
│   │   │   └── features/          # Navbar, Hero, CampaignCard, CreatorCard
│   │   ├── lib/                   # Supabase client, typed REST API client
│   │   └── types/                 # Strict TypeScript models
└── database/
    └── migrations/
        └── V1__initial_schema.sql # Supabase PostgreSQL schema with RLS
```

---

## 🚀 Running Locally

### 1. Database
Run `database/migrations/V1__initial_schema.sql` in your Supabase SQL editor.

### 2. Backend (Java Spring Boot)
```bash
cd backend
mvn spring-boot:run
# Swagger UI available at: http://localhost:8080/swagger-ui.html
```

### 3. Frontend (Next.js)
```bash
cd frontend
npm run dev
# Application available at: http://localhost:3000
```

## Deploying the Backend to Render

Create a **Web Service** from this repository with:

- **Root Directory:** `backend`
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`
- **Health Check Path:** `/actuator/health`

First create a **Render PostgreSQL** database in the same region as the web service. In its **Connect** details, use the internal host, database name, username, and password. Add these environment variables to the web service:

- `DATABASE_URL`: `jdbc:postgresql://<internal-host>:5432/<database>`
- `DATABASE_USER`: the PostgreSQL user shown in Render
- `DATABASE_PASSWORD`: the PostgreSQL password shown in Render
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `FRONTEND_URL`: your deployed frontend origin

The Render Docker image always activates the `render` profile, which requires the PostgreSQL settings above and cannot fall back to H2. Render supplies `PORT`; the backend listens on it automatically. Keep H2 for local development only. If the service has already run against a temporary database, its data will not transfer automatically; migrate or import it into PostgreSQL before switching the frontend to this backend.
