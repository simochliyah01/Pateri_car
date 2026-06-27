# PATERI CAR

[![CI](https://github.com/simochliyah01/Pateri_car/actions/workflows/ci.yml/badge.svg)](https://github.com/simochliyah01/Pateri_car/actions/workflows/ci.yml)

Car rental management system for a single agency in Taza, Morocco.

## Description

PATERI CAR is a full-stack SaaS application that lets a car rental agency manage its fleet, bookings, clients, and contracts from a single dashboard, while exposing a public-facing client website for online reservations.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Java 17, Maven |
| Database | PostgreSQL 15, Flyway migrations |
| Frontend (client) | Angular 17 |
| Frontend (admin) | Angular 17 |
| Containerization | Docker, Docker Compose |

## Prerequisites

- **Java 17** — [adoptium.net](https://adoptium.net)
- **Maven 3.9+** — bundled via Maven Wrapper (`./mvnw`)
- **Node 20 + npm** — [nodejs.org](https://nodejs.org)
- **Angular CLI 17** — `npm install -g @angular/cli@17`
- **Docker Desktop** — [docker.com](https://www.docker.com/products/docker-desktop)

## Quick Start with Docker (recommended)

The entire stack (PostgreSQL + Spring Boot backend + Angular frontend) runs with a single command.

### 1. Copy the environment template
```bash
cp .env.example .env
# Edit .env and set real values, especially JWT_SECRET
```

### 2. Start everything
```bash
docker compose up -d
```

### 3. Access the application
- Frontend (client): http://localhost
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/docs
- PostgreSQL: localhost:5432

### 4. View logs
```bash
docker compose logs -f
```

### 5. Stop and clean up
```bash
docker compose down              # stop containers, keep data
docker compose down -v           # stop containers AND delete volumes (full reset)
```

---

## Manual Setup (without Docker)

### 1. Start the database

```bash
docker compose up postgres -d
```

PostgreSQL will be available on `localhost:5432`.  
Health status: `docker compose ps`

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

API available at `http://localhost:8090`  
Swagger UI: `http://localhost:8090/api/docs`  
Health check: `http://localhost:8090/api/actuator/health`

### 3. Start the admin dashboard

```bash
cd frontend-admin
npm install
ng serve
```

Available at `http://localhost:4200`

### 4. Start the client website

```bash
cd frontend-client
npm install
ng serve --port 4201
```

Available at `http://localhost:4201`

## Folder Structure

```
pateri-car/
├── backend/                  # Spring Boot API
│   └── src/
│       └── main/
│           └── resources/
│               └── db/migration/  # Flyway SQL migrations
├── frontend-client/          # Public-facing booking website (Angular 17)
├── frontend-admin/           # Internal management dashboard (Angular 17)
├── docker/
│   └── postgres/
│       └── init.sql          # DB initialization (extensions, etc.)
├── docs/                     # Architecture decisions, API specs, wireframes
├── docker-compose.yml        # Local development services
└── .gitignore
```

## Database

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `patericar_db` |
| User | `patericar` |
| Password | `patericar_dev_2026` (local dev only) |

Schema changes are managed with **Flyway** — add migration scripts under `backend/src/main/resources/db/migration/` following the `V{version}__{description}.sql` naming convention.

## License

Private — all rights reserved.
