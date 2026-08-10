<div align="center">

# HelpDesk Pro

### An AI-Augmented IT Support & Ticketing Platform

*Structured ticketing, real-time collaboration, and OpenAI-powered triage — in one centralized workspace.*

<br>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![.NET 9](https://img.shields.io/badge/.NET_9-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![SignalR](https://img.shields.io/badge/SignalR-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

<br>

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API Reference](#api-reference) · [Roadmap](#roadmap)

</div>

---

## Overview

**HelpDesk Pro** replaces informal support channels — email, chat, walk-ins — with a single structured workflow where every request is logged, categorized, assigned, and tracked from creation to resolution.

Employees submit and follow their own tickets. IT agents and managers triage, prioritize, assign, and resolve them through a live dashboard. An OpenAI integration sits underneath the workflow, suggesting categories and priorities on submission, drafting troubleshooting replies for agents, and answering employee questions through a self-service assistant.

Built as a full-stack internship project modeling a real enterprise support platform, with production-minded auth, role scoping, real-time notifications, and a secrets-first configuration approach.

---

## Features

### Authentication & Access Control
JWT-based authentication over ASP.NET Identity, with four roles — **Admin**, **IT Support Agent**, **Manager**, and **Employee** — enforced at the API layer. Every data query is role-scoped: employees see only their own tickets, staff see the full queue. Self-service profile, password, and notification-preference management is available to every signed-in user.

### Ticket Management
End-to-end lifecycle with auto-generated reference numbers, full-text search, and filtering.

| Dimension | Values |
|---|---|
| **Categories** | Hardware · Software · Network · Email · Access Request · Other |
| **Priorities** | Low · Medium · High · Critical |
| **Statuses** | Open · In Progress · Pending · Resolved · Closed |

### Assignment & Workflow
Manual and priority-based assignment, one-click escalation, reassignment, internal (agent-only) notes, and a complete per-ticket audit trail recording every state change.

### Real-Time Collaboration
Threaded comments and replies, secure file attachments (images, PDFs, Office and text formats, 10 MB cap), and **SignalR-powered live notifications** delivered over an authenticated WebSocket hub — no polling.

### Dashboard & Reporting
Animated summary widgets, a ticket-volume trend line, and category/priority breakdowns. The dedicated **Reports** view adds selectable time ranges (30 / 90 / 180 days) and one-click **CSV export** for trend and breakdown data.

### AI-Powered Features
Powered by the OpenAI API through a single server-side service — the API key never reaches the browser.

- **Automatic categorization** — infers the best-fit category from the ticket description, constrained to your seeded taxonomy so it can never invent a value.
- **Priority suggestion** — reasons about business impact and urgency (many-user outages → Critical, routine requests → Low).
- **Agent reply drafting** — generates an editable troubleshooting response an agent reviews before sending.
- **Self-service assistant** — a chat companion that walks employees through common fixes and offers to open a ticket when a technician is genuinely needed.

> Categorization and priority run as a **suggestion** the user can override, and **auto-apply** for staff when model confidence is high — the human always stays in control.

### Knowledge Base
A searchable, category-filterable article library. Everyone browses published articles; staff create, edit, and publish (or save drafts); Admins and Managers can delete.

---

## Architecture

A layered, separation-of-concerns design:

| Layer | Responsibility | Technology |
|---|---|---|
| **Client** | Single-page app consuming REST + WebSocket APIs | React, Tailwind CSS, GSAP, Recharts |
| **API** | Business logic, auth, validation, real-time hub | ASP.NET Core 9 Web API |
| **Data** | Persistence and migrations | SQL Server + EF Core |
| **AI** | Categorization, prioritization, drafting, chat | OpenAI API (server-side service) |

**Request flow:** the React client calls REST endpoints with a JWT bearer token; the API authenticates, applies role scoping, executes business logic against SQL Server via EF Core, and — for AI actions — delegates to a typed `AiService` that calls OpenAI and maps results back to your domain. Live updates are pushed from the API to connected clients over a SignalR hub authenticated with the same token.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React · Tailwind CSS · React Router · GSAP · Recharts |
| **Backend** | ASP.NET Core 9 · Entity Framework Core · SignalR |
| **Database** | SQL Server |
| **Auth** | JWT · ASP.NET Identity (int-keyed) |
| **AI** | OpenAI API (typed `HttpClient` service) |
| **Deployment** | IIS · Azure · Docker |

---

## Getting Started

### Prerequisites

- **Node.js** (LTS)
- **.NET 9 SDK**
- **SQL Server** (Express or full instance)
- An **OpenAI API key** with billing enabled (required only for the AI features)

### 1 · Clone

```bash
git clone https://github.com/your-username/it-helpdesk-ticketing-system.git
cd it-helpdesk-ticketing-system
```

### 2 · Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

The database is seeded automatically on first run with the category, priority, and status lookups, the four roles, and a development admin account:

| Field | Value |
|---|---|
| Email | `admin@test.com` |
| Password | `Test1234!` |

### 3 · Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects the API's base URL in the frontend `.env`.

---

## Configuration

Secrets are kept out of source control. **Do not** place the OpenAI key or JWT signing key in `appsettings.json`.

### Backend secrets (user-secrets)

```bash
cd backend
dotnet user-secrets init
dotnet user-secrets set "OpenAI:ApiKey" "sk-proj-..."
dotnet user-secrets set "Jwt:Key" "your-signing-key"
```

### Non-secret backend config — `appsettings.json`

```jsonc
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=HelpDeskDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "HelpDeskPro",
    "Audience": "HelpDeskProClient"
  },
  "OpenAI": {
    "ClassifierModel": "gpt-4.1-nano",
    "AssistantModel": "gpt-4.1-mini",
    "MaxOutputTokens": 700
  }
}
```

> **Model names change often.** Set `ClassifierModel` to a current low-cost model and `AssistantModel` to a current mid-tier model from your OpenAI dashboard. They are configuration, not code — no rebuild required to switch. Secrets load at **startup**, so restart the backend after changing them.

### Frontend — `.env`

```
VITE_API_BASE_URL=https://localhost:5001/api
```

---

## Project Structure

```
it-helpdesk-ticketing-system/
├── backend/
│   ├── Controllers/      Auth, Tickets, Dashboard, KnowledgeBase, Account, Ai, ...
│   ├── Models/           ApplicationUser, Ticket, KnowledgeArticle, Notification, ...
│   ├── DTOs/             Request/response contracts
│   ├── Services/         TokenService, NotificationService, AiService, ...
│   ├── Hubs/             NotificationHub (SignalR)
│   ├── Helpers/          ClaimsPrincipal extensions, workflow, activity log
│   ├── Data/             ApplicationDbContext
│   ├── Migrations/
│   └── Program.cs
├── frontend/
│   └── src/
│       ├── components/   AppLayout, NotificationBell, ProtectedRoute, StatusTimeline
│       ├── context/      AuthContext
│       ├── pages/        Dashboard, Tickets, Reports, KnowledgeBase, Settings, Assistant
│       ├── api/          Axios service modules (one per domain)
│       ├── realtime/     SignalR connection
│       └── App.jsx
└── README.md
```

---

## API Reference

All endpoints require a JWT bearer token unless noted. Staff-only endpoints require **Admin**, **IT Support Agent**, or **Manager**.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Authenticate, receive a JWT |

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | List (role-scoped) |
| `POST` | `/api/tickets` | Create |
| `GET` | `/api/tickets/{id}` | Detail |
| `PUT` | `/api/tickets/{id}` | Update · *staff* |
| `DELETE` | `/api/tickets/{id}` | Delete · *staff* |

### Dashboard & Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Status counts |
| `GET` | `/api/dashboard/volume-trend?days=` | Volume over time |
| `GET` | `/api/dashboard/by-category` | Category breakdown |
| `GET` | `/api/dashboard/by-priority` | Priority breakdown |

### AI
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/classify` | Suggest category + priority |
| `POST` | `/api/ai/draft-reply` | Draft a troubleshooting reply · *staff* |
| `POST` | `/api/ai/chat` | Self-service assistant |

### Knowledge Base
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/knowledge-base` | List / search / filter |
| `GET` | `/api/knowledge-base/{id}` | Article detail |
| `GET` | `/api/knowledge-base/categories` | Distinct categories |
| `POST` | `/api/knowledge-base` | Create · *staff* |
| `PUT` | `/api/knowledge-base/{id}` | Update · *staff* |
| `DELETE` | `/api/knowledge-base/{id}` | Delete · *Admin / Manager* |

### Account (self-service)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/me` | Own profile |
| `PUT` | `/api/users/me` | Update profile |
| `PUT` | `/api/users/me/password` | Change password |
| `PUT` | `/api/users/me/preferences` | Notification preferences |

### Real-Time
| Transport | Endpoint | Description |
|---|---|---|
| WebSocket | `/hubs/notifications` | Live notification stream (JWT via `access_token`) |

---

## Security Notes

- **Secrets never ship to the client.** The OpenAI key lives only in user-secrets / server environment; all AI calls are server-side.
- **Constrained AI output.** Categorization is limited to values that exist in the database; unparseable model responses fail soft to a manual choice rather than corrupting data.
- **Role enforcement at the API.** UI gating is convenience; authorization is enforced server-side on every request.
- **The assistant never requests credentials**, and the UI reinforces that guidance.

---

## Roadmap

- [ ] SLA timers with breach alerts
- [ ] Email-to-ticket ingestion
- [ ] Preference-aware notification routing (honor per-user email/in-app toggles at send time)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] CI/CD pipeline and containerized deployment

---

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes
4. Push — `git push origin feature/your-feature`
5. Open a pull request

---

## License

Developed for educational and internship purposes. License terms to be determined by the project owner.

---

<div align="center">

**HelpDesk Pro** — built with React, ASP.NET Core, and OpenAI.

</div>
