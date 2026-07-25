# Auctus

A full-stack MERN auction marketplace featuring role-based dashboards for buyers, sellers, and admins. Supports wallet-based bidding, automatic platform commission settlement, escrow-backed winner handoff, delivery tracking, seller shipment updates, real-time notifications, watchlists, KYC verification, and Gemini-powered AI helpers.

> This repository contains no real `.env` files, no secrets, no `node_modules`, and no generated build output.

---

## Features

- **Role-based dashboards** — separate views for bidders, sellers, and admins
- **Wallet system** — deposit, bid, settle, and withdraw with full ledger tracking
- **Auction lifecycle** — create, bid, auto-close, escrow settlement, and winner handoff
- **Delivery & fulfillment** — address collection, seller shipment updates, dispute management
- **KYC verification** — seller identity review workflow with admin approval
- **Notifications** — real-time in-app alerts for bids, wins, shipments, and admin actions
- **Watchlist & recently viewed** — track auctions across sessions
- **Demo mode** — sandboxed environment with isolated database for live demos
- **AI helpers** — Gemini-powered insights integrated into dashboards

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, HTTP-only cookies, Google OAuth |
| Email | Nodemailer (SMTP) |
| AI | Google Gemini API |
| Deployment | Vercel / Render / Netlify |

---

## Project Structure

```
Auctus/
├── backend/          # Express API — routes, controllers, models, utils
├── frontend/         # Vite + React app — pages, components, store
├── docs/             # Implementation notes, audit docs, roadmap
├── DEPLOYMENT.md     # Vercel, Render, and Netlify deployment guide
├── render.yaml       # Render.com service configuration
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.18.0
- MongoDB Atlas cluster (or local MongoDB)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in required values
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in required values
npm run dev
```

Default local URLs:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |

---

## Environment Variables

Set these in `.env` files locally and in your hosting provider's dashboard for production. **Never commit real `.env` files.**

### Backend

```env
NODE_ENV=production
MONGODB_URL=mongodb+srv://...
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_EXPIRE=7
COOKIE_SECURE=true
CLIENT_URL=https://your-frontend-domain
FRONTEND_URL=https://your-frontend-domain
CRON_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_MAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="Auctus <your-email@gmail.com>"
AI_FEATURES_ENABLED=true
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend

```env
VITE_API_BASE_URL=https://your-backend-domain/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
npm run lint
npm run build
```

---

## API Documentation

Swagger UI is available once the backend server is running:

| URL | Description |
|---|---|
| `http://localhost:8000/api-docs` | Interactive Swagger UI |
| `http://localhost:8000/api-docs.json` | Raw OpenAPI JSON spec |

All **51 endpoints** are documented with request/response schemas, authentication requirements, and examples. Use the **Authorize** button in Swagger UI to set your Bearer token or cookie before testing protected routes.

> Set `SWAGGER_ENABLED=false` in your environment to disable the UI in production if needed.

---

## Running with Docker

Docker Compose runs the full stack — MongoDB, backend, and frontend — with a single command.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker + Docker Compose v2)

### Setup

1. **Create a `.env` file** at the repo root with your secrets (never committed):

```env
JWT_SECRET=replace-with-a-long-random-secret
CRON_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_MAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-api-key
AI_FEATURES_ENABLED=true
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

2. **Build and start all services:**

```bash
docker-compose up --build
```

3. **Access the app:**

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8000/api/v1 |
| Swagger Docs | http://localhost:8000/api-docs |
| MongoDB | mongodb://localhost:27017/auctus |

4. **Stop services:**

```bash
docker-compose down          # stop containers
docker-compose down -v       # stop + delete MongoDB volume (⚠ deletes all data)
```

> MongoDB data is persisted in a named Docker volume (`auctus-mongo-data`) across restarts.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions for Vercel, Render, and Netlify.

**Recommended free-tier setup:**
1. MongoDB Atlas — free M0 cluster
2. Render — backend API (free web service)
3. Vercel or Netlify — frontend (static deployment)

> For accurate auction settlement, configure a reliable cron trigger for `POST /api/v1/cron/all` so ended auctions close on time.

---

## License

This project is for portfolio and demonstration purposes.
