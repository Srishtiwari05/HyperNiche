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

Set these environment variables in Render. Use your PostgreSQL provider's connection details; `DATABASE_URL` must be a JDBC URL:

- `DATABASE_URL`: `jdbc:postgresql://<host>:5432/<database>?sslmode=require`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_DRIVER`: `org.postgresql.Driver`
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `FRONTEND_URL`: your deployed frontend origin

Render supplies `PORT`; the backend listens on it automatically. Do not use the default file-based H2 database for production because Render's container filesystem is ephemeral.
