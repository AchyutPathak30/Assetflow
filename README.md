# ⚡ AssetFlow — Enterprise Asset & Resource Management ERP

> 🔗 **Live Vercel Application:** [https://assetflow-rose.vercel.app/](https://assetflow-rose.vercel.app/)
>
> 🚀 **Supabase Backend Deployed:** Connected and secured with RLS & DB triggers.

---

## 🛠️ Complete Technology Stack

AssetFlow is built with a modern, secure, and highly optimized stack designed for speed, visual excellence, and relational integrity.

| Layer | Technology | Usage & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React (v18+)** | Component-based UI structure, React Context API for global state coordination, custom Typewriter hooks. |
| **Build System** | **Vite** | Lightning-fast development server, asset bundling, and production-optimized code-splitting. |
| **Styling & UI** | **Vanilla CSS3** | Sleek glassmorphism, HSL custom variables for instant color themes, fully responsive CSS grids/flexbox. |
| **Background Art** | **HTML5 Canvas API** | Custom dynamic mouse-tracking fluid animation executing on render loop. |
| **Backend Service** | **Supabase** | Managed PostgreSQL server, real-time sync, and auth session providers. |
| **Authentication** | **Supabase Auth** | Secure email/password login and user sign-ups mapped dynamically to employee metadata. |
| **Security Layer** | **PostgreSQL RLS** | Row Level Security policies securing tables so employees can only execute authorized operations. |
| **Business Logic** | **PL/pgSQL RPCs** | Server-side transactional functions (e.g. overlap checks for bookings and asset return states). |
| **Hosting & CI/CD** | **Vercel** | Automated building and deploying synchronized directly with the GitHub repository. |

---

## 🎨 Key Features & Modules

### 1. 🛡️ Portal-based Authentication & Sign Up
* **Staff Login Portal**: Built for regular staff, featuring an access role dropdown select option (**Employee**, **Department Head**, **Asset Manager**).
* **Admin Login Portal**: A secure login route exclusively for Administrator accounts.
* **Sign-Up Constraints**: Users choose their starting role and department. Business rules are enforced at both frontend and database triggers:
  * Maximum **1 Administrator** allowed globally.
  * Maximum **1 Department Head** per department.
  * Maximum **1 Asset Manager** per department.
* **Staff Role Mismatch Block**: If a user selects the wrong role during login, the system automatically signs them out and blocks entry.

### 2. 📊 KPI Dashboard
* Real-time metrics including **Assets Available**, **Assets Allocated**, **Active Bookings**, and **Pending Transfers**.
* Role-specific views (Employees see only their assigned equipment and upcoming bookings; managers see organization-wide metrics).
* Interactive conic-gradient donut chart showing asset status breakdown.
* Quick lists of overdue returns and pending approvals.

### 3. ⚙️ Org Setup (Admin Only)
* **Department Hierarchy**: Build departments, assign parents/sub-departments, and choose department heads.
* **Asset Categories**: Register categories with dynamic JSONB custom attributes (e.g. adding "Warranty" to Electronics).
* **Employee Directory**: Complete overview of active/inactive accounts and promotion drawer to adjust access privileges with conflict checking.

### 4. ▤ Asset Registry (Directory)
* Full overview of all registered equipment, auto-generating unique asset tags (`AF-0001`...).
* Filter assets by status: **Available**, **Allocated**, **Reserved**, **Under Maintenance**, **Lost**, **Retired**, or **Disposed**.
* Add assets with serial numbers, cost, acquisition date, location, and custom metadata fields.

### 5. ⇄ Allocation & Transfer Requests
* Allocate assets directly to employees with a specified expected return date.
* **Conflict Resolution**: Attempting to allocate an already assigned asset prompts a transfer request form instead of failing silently.
* Approve, reject, or cancel active transfers through a dedicated approvals workflow.

### 6. ▦ Resource Booking
* Calendar-based time-slot reservation system for shared spaces (meeting rooms) and equipment (vehicles, test devices).
* **Double-Booking Validation**: Rejects booking requests that overlap with existing time slots for the selected asset.

### 7. 🔧 Maintenance Workflows
* Employees can file maintenance requests for assigned equipment, attaching descriptions and simulated photo files (Base64 file reader).
* Managers review tickets, approve budgets, assign technicians, and track statuses (**Pending** $\rightarrow$ **Under Repair** $\rightarrow$ **Resolved**).
* Assets are automatically set to **Under Maintenance** when repairs begin and return to **Available** upon resolution.

### 8. ✓ Audit Cycles
* Define scheduled audit cycles specifying target departments and date ranges.
* Scoped checklists where designated auditors mark items as **Verified**, **Missing**, or **Damaged**.
* Automated discrepancy reports compiled instantly upon closing a cycle (confirmed missing items lock and flip status to **Lost**).

### 9. ▣ Reports & Analytics
* Interactive graphs showing monthly maintenance costs, asset category distributions, and booking frequencies.
* Full CSV-style table exports for auditing.

### 10. ≡ Logs & Notifications
* **Audit Trail Logs**: Immutable activity ledger recording who did what and when.
* **Role-Relevant Notifications**: Real-time popups alerting users of asset assignments, transfer requests, booking approvals, and overdue returns.

---

## ⚙️ Robustness & Fallback Strategy

* **Defensive Proxy Mock Client**: A custom-built recursive thenable Proxy interceptor. If Supabase keys are missing or unconfigured (such as on initial Vercel deploy), the client replaces Supabase API chains with safe, resolve-on-await methods to prevent application crashes, falling back to a fully operational `localStorage` prototype mode.

---

## 🚀 Database Setup & Seeding

All database schema structures, functions, and RLS policies are version-controlled under `/supabase/migrations`.

### Step 1: Initialize Database Tables & Rules
If setting up a new Supabase project, execute the SQL files inside `supabase/migrations/` in chronological order using your Supabase SQL editor:
1. `20260712064615_core_schema.sql` (Creates core tables)
2. `20260712065105_auth_trigger_and_rls.sql` (Auth triggers and RLS policies)
3. `20260712070615_asset_tag_generator.sql` (Auto tag triggers)
4. `20260712073717_allocation_logic.sql` (Transactional allocation RPCs)
5. `20260712075131_booking_logic.sql` (Booking overlap check functions)
6. `20260712080000_additional_tables.sql` (Maintenance, audit, and log tables)
7. `20260712081000_triggers_and_constraints.sql` (Role limits trigger checking)

### Step 2: Seed the Database
To quickly test the application with a pre-populated workspace, copy and execute the queries from **`supabase/seed.sql`** in the Supabase SQL editor. This inserts:
* **Admin Account**: `admin@gmail.com` (password: `password123`)
* **14 Other Users**: Distributed among IT, HR, Operations, Marketing, and Finance.
* **Mock Data**: Setup allocations, upcoming meeting room bookings, and active maintenance repairs.

---

## 💻 Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AchyutPathak30/Assetflow.git
   cd Assetflow
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_api_key
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
