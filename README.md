# IT Help Desk & Ticketing Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

A full-stack IT Help Desk & Ticketing Management System designed to streamline technical support operations inside an organization. Employees submit and track support requests while IT agents and administrators manage, prioritize, assign, and resolve tickets through a centralized dashboard.

Built as a Full Stack Web Development Internship Project simulating a real-world enterprise support platform.

---

## Overview

This system replaces informal support channels (email, chat, walk-ins) with a structured ticketing workflow. Every request is logged, categorized, assigned, and tracked from creation to resolution, giving both employees and IT teams full visibility into support operations.

---

## Features

### Authentication & User Management
- Secure JWT-based authentication
- Role-based access control (Admin, IT Support Agent, Employee, Manager)
- Profile management and password reset
- User activity logging

### Ticket Management
- Create, update, and cancel support tickets
- Categories: Hardware, Software, Network, Email, Access Request, Other
- Priorities: Low, Medium, High, Critical
- Statuses: Open, In Progress, Pending, Resolved, Closed
- Auto-generated ticket reference numbers
- Search and filtering

### Assignment & Workflow
- Manual and automatic ticket assignment
- Escalation and reassignment support
- Internal notes and full audit trail

### Communication & Notifications
- In-app and email notifications
- Comment and reply threads on tickets
- Agent mentions and tagging

### Dashboard & Reporting
- Real-time widgets for open, resolved, and pending tickets
- Tickets by category and priority
- Agent performance analytics
- Exportable reports (PDF/Excel)

### AI-Powered Features
- Automatic ticket categorization from description text
- AI-suggested priority levels
- AI-generated troubleshooting replies for agents
- AI chat assistant for employee self-service

### Additional Modules
- Knowledge base with searchable articles
- Secure file attachments on tickets
- Admin panel for user, role, and category management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | ASP.NET Core Web API (C#) |
| Database | SQL Server |
| Authentication | JWT, ASP.NET Identity |
| AI Integration | OpenAI API / Azure OpenAI |
| Deployment | IIS / Azure / Docker |

---

## System Architecture

The application follows a layered architecture:

- **Client Layer** — React SPA consuming REST APIs
- **API Layer** — ASP.NET Core Web API handling business logic, auth, and validation
- **Data Layer** — SQL Server with Entity Framework Core for persistence
- **AI Layer** — External AI service calls for categorization, prioritization, and chat assistance

---

## Database Schema

Core tables include:

- `Users`
- `Roles`
- `Tickets`
- `TicketComments`
- `TicketAttachments`
- `Notifications`
- `Categories`
- `Priorities`
- `Statuses`
- `ActivityLogs`

An ERD diagram and SQL scripts are available in `/docs/database`.

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- .NET SDK (latest LTS)
- SQL Server Express or full SQL Server instance
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/it-helpdesk-ticketing-system.git
cd it-helpdesk-ticketing-system
```

**Backend setup:**

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

**Frontend setup:**

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the frontend directory and an `appsettings.Development.json` in the backend directory with the following values:

```
DB_CONNECTION_STRING=
JWT_SECRET=
JWT_ISSUER=
JWT_AUDIENCE=
OPENAI_API_KEY=
```

---

## Project Structure

```
it-helpdesk-ticketing-system/
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Data/
│   └── Program.cs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── docs/
│   ├── database/
│   └── api/
└── README.md
```

---

## API Documentation

Full API endpoint documentation is available in `/docs/api`, including request/response schemas and authentication requirements. A Postman collection is included for local testing.

---

## Roadmap

- [ ] Real-time chat support
- [ ] SLA timer system
- [ ] Email-to-ticket automation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] CI/CD pipeline
- [ ] Docker deployment

---

## Contributing

Contributions are managed through feature branches and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## License

This project is intended for educational and internship purposes. License terms to be determined by the project owner.

---

## Contact

For questions or support regarding this project, please open an issue in the repository.
