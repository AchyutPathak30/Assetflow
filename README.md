# AssetFlow - Enterprise Asset & Resource Management System

AssetFlow is a user-centric, responsive Enterprise Asset & Resource Management ERP designed to simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources.

## Key Features

1. **Login & Signup Screen**: Role-based access control with secure Employee, Department Head, Asset Manager, and Admin accounts.
2. **Interactive KPI Dashboard**: Real-time summary of assets, active bookings, maintenance tasks, and overdue returns.
3. **Organization Setup (Admin-only)**: Dynamic management of departments, asset categories, and employee directories.
4. **Asset Registry**: Track assets through their full lifecycle (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed).
5. **Asset Allocation & Conflict Handling**: Allocate assets to employees/departments with automated conflict resolution and transfer workflows.
6. **Resource Booking**: Calendar-based time-slot booking of shared resources with overlap validation.
7. **Maintenance Workflow**: Route repairs through a structured approval process before work begins.
8. **Asset Audits**: Scheduled audit cycles with digital verification checklist and auto-generated discrepancy reports.
9. **Reports & Analytics**: Asset utilization trends, maintenance frequency, and resource booking heatmaps.
10. **System Logs & Notifications**: Full audit logging of activities and real-time user notifications.

## Technologies

- **Frontend Framework**: React + Vite (proposed)
- **Styling**: Modern Vanilla CSS with variables and custom styling
- **Database**: LocalStorage for zero-setup local state persistence

## Backend (Supabase)

This repository includes the **Supabase** backend system.

### 🛠️ Architecture & Core Components
- **Supabase Schema**: Declarations for relational tables, relationships, and indexes.
- **Row Level Security (RLS)**: Fine-grained access control policies securing data access at the database level.
- **Business Logic Functions**: Database functions (PL/pgSQL) for complex server-side operations and integrations.
- **Database Migrations**: Version-controlled migration files located under `supabase/migrations/`.

### 📂 Project Structure
```
├── supabase/
│   ├── migrations/      # Database migration SQL files
│   └── config.toml      # Supabase project configuration
```

### ⚙️ Local Development Setup

#### Prerequisites
- Node.js (v18+)
- Supabase CLI

#### Setup CLI and Link Project
1. Log in to Supabase CLI:
   ```bash
   npx supabase login
   ```
2. Link to the remote project:
   ```bash
   npx supabase link --project-ref ymccorpgjqebzwiyensy
   ```
3. Verify migration status:
   ```bash
   npx supabase migration list
   ```
