# AssetFlow API Handoff Documentation

This document provides guidelines, database schemas, Row Level Security (RLS) details, and custom database function signatures for the frontend development team.

---

## 🔑 Supabase Connection Credentials

Retrieve these values from your Supabase Dashboard under **Project Settings → API** and add them to your frontend environment configuration (e.g., `.env`):

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE
```

---

## 🛡️ Authentication & Role Assignment

> [!IMPORTANT]
> **Do not set `employees.role` during user signup.**
>
> The user role is restricted and managed automatically via database-level triggers. When a new user completes signup via Supabase Auth:
> 1. An entry is automatically created in the `public.employees` table by the `on_auth_user_created` trigger.
> 2. The role is default-assigned to `'Employee'`.
>
> The frontend signup form **must never** expose or send a `role` field. Admins can escalate user roles later if needed.

---

## 🏷️ Asset Tag Auto-Generation

> [!NOTE]
> **Do not send `assets.tag` on insert.**
>
> Asset tags (e.g., `AF-0001`, `AF-0002`) are auto-generated sequentially at the database level using a dedicated sequence to prevent race conditions or collisions.
> The frontend should omit the `tag` field when inserting new assets; the database will populate it automatically.

---

## 📊 Database Schema Reference Table

The following tables are defined in the database under the `public` schema. All interactive query or mutation requests from the frontend should conform to this structure:

| Table Name | Column Name | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| **departments** | `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique department ID |
| | `name` | `text` | `NOT NULL` | Name of the department |
| | `head_employee_id` | `uuid` | Foreign Key to `employees.id` | Reference to the department head |
| | `parent_dept_id` | `uuid` | Foreign Key to `departments.id` | Hierarchy self-reference |
| | `status` | `text` | `NOT NULL`, default `'Active'`, `CHECK (status in ('Active', 'Inactive'))` | Status of the department |
| | `created_at` | `timestamptz` | default `now()` | Date created |
| **employees** | `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique employee ID |
| | `auth_user_id` | `uuid` | `UNIQUE`, Foreign Key to `auth.users(id)` | Linked Supabase auth user |
| | `name` | `text` | `NOT NULL` | Employee full name |
| | `email` | `text` | `NOT NULL`, `UNIQUE` | Employee email |
| | `department_id` | `uuid` | Foreign Key to `departments.id` | Assigned department |
| | `role` | `text` | `NOT NULL`, default `'Employee'`, `CHECK (role in ('Admin', 'AssetManager', 'DeptHead', 'Employee'))` | User security role |
| | `status` | `text` | `NOT NULL`, default `'Active'`, `CHECK (status in ('Active', 'Inactive'))` | Account status |
| | `created_at` | `timestamptz` | default `now()` | Date created |
| **categories** | `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique category ID |
| | `name` | `text` | `NOT NULL` | Name of the category |
| | `extra_fields` | `jsonb` | default `'{}'` | Custom dynamic attributes JSON schema |
| | `created_at` | `timestamptz` | default `now()` | Date created |
| **assets** | `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique asset ID |
| | `tag` | `text` | `UNIQUE` | Auto-generated tag (`AF-0001`) |
| | `name` | `text` | `NOT NULL` | Name or label of the asset |
| | `category_id` | `uuid` | Foreign Key to `categories.id` | Referenced category |
| | `serial_number` | `text` | | Manufacturer serial number |
| | `acquisition_date` | `date` | | Date acquired |
| | `acquisition_cost` | `numeric` | | Purchasing cost |
| | `condition` | `text` | | Notes on current physical state |
| | `location` | `text` | | Storage or placement location |
| | `is_bookable` | `boolean` | `NOT NULL`, default `false` | True if reservable for time blocks |
| | `status` | `text` | `NOT NULL`, default `'Available'`, `CHECK (status in ('Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'))` | Current lifecycle state |
| | `photo_url` | `text` | | Storage URL for asset image |
| | `created_at` | `timestamptz` | default `now()` | Date created |
| **allocations** | `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique allocation ID |
| | `asset_id` | `uuid` | `NOT NULL`, Foreign Key to `assets.id` | Target asset |
| | `employee_id` | `uuid` | Foreign Key to `employees.id` | Target employee (if assigned to person) |
| | `department_id` | `uuid` | Foreign Key to `departments.id` | Target department (if assigned to dept) |
| | `allocated_on` | `timestamptz` | `NOT NULL`, default `now()` | Timestamp of allocation |
| | `expected_return_date`| `date` | | Expected deadline |
| | `returned_on` | `timestamptz` | | Actual return timestamp |
| | `status` | `text` | `NOT NULL`, default `'Active'`, `CHECK (status in ('Active', 'Returned', 'TransferPending'))` | Current allocation status |
| | `condition_notes_on_return`| `text` | | Condition state reported at return |
| | `created_at` | `timestamptz` | default `now()` | Date created |
| **bookings** | `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique booking ID |
| | `asset_id` | `uuid` | `NOT NULL`, Foreign Key to `assets.id` | Target asset |
| | `booked_by_employee_id`| `uuid` | `NOT NULL`, Foreign Key to `employees.id` | Requesting employee |
| | `start_time` | `timestamptz` | `NOT NULL` | Reservation start time |
| | `end_time` | `timestamptz` | `NOT NULL` | Reservation end time |
| | `status` | `text` | `NOT NULL`, default `'Upcoming'`, `CHECK (status in ('Upcoming', 'Ongoing', 'Completed', 'Cancelled'))` | Calendar booking status |
| | `created_at` | `timestamptz` | default `now()` | Date created |

---

## 🔒 Row Level Security (RLS) Policies

All tables have RLS enabled. Clients must authenticate to perform operations. The rules govern tables as follows:

1. **`departments` & `categories`**:
   * **Read (`SELECT`)**: Allowed for all authenticated users.
   * **Write (`INSERT`/`UPDATE`)**: Only allowed for users with role `'Admin'`.

2. **`assets`**:
   * **Read (`SELECT`)**: Allowed for all authenticated users.
   * **Write (`INSERT`/`UPDATE`)**: Allowed for users with role `'Admin'` or `'AssetManager'`.

3. **`employees`**:
   * **Read (`SELECT`)**: Allowed for all authenticated users.
   * **Update (`UPDATE`)**: 
     * Users can edit their own details (e.g. `name`, `email`, `department_id`), but **cannot** alter their own `role` or `status` fields.
     * Users with the `'Admin'` role can update any fields on any employee profile.

4. **`allocations` & `bookings`**:
   * Read and write controls are fully permitted for authenticated users at the RLS level (to facilitate rapid execution), but core transactional workflows should be mediated through the RPC functions defined below to preserve database integrity.

---

## ⚙️ Custom RPC Functions (Postgres Functions)

Always invoke these functions via `supabase.rpc()` to guarantee atomic validation, conflict detection, and status transitions:

---

### 1. `allocate_asset`
Atomically allocates an asset to an employee or department if it is not already active.

* **Signature**:
  ```sql
  public.allocate_asset(
    p_asset_id uuid,
    p_employee_id uuid DEFAULT null,
    p_department_id uuid DEFAULT null,
    p_expected_return_date date DEFAULT null
  ) RETURNS jsonb
  ```
* **Returns**:
  * On Success: `{"success": true, "allocation_id": "<uuid>"}`
  * On Conflict: `{"success": false, "reason": "already_allocated", "held_by_employee_id": "<uuid>", "held_by_department_id": "<uuid>", "held_by_name": "<text>"}`
* **JavaScript / TypeScript Example**:
  ```javascript
  const { data, error } = await supabase.rpc('allocate_asset', {
    p_asset_id: '8ef5c832-7ab9-42b7-a3f2-8924190c1e87',
    p_employee_id: '4b39c094-1a3b-417b-9442-3a55cd913210', // Pass null if allocating to a department
    p_department_id: null,                                  // Pass uuid if allocating to a department
    p_expected_return_date: '2026-08-31'                    // ISO date string or null
  });
  
  if (data.success) {
    console.log('Allocated successfully:', data.allocation_id);
  } else {
    console.warn(`Already allocated to ${data.held_by_name}. Offer request transfer.`);
  }
  ```

---

### 2. `request_transfer`
Initiates a request to transfer an already-allocated asset to another employee. Sets the active allocation status to `'TransferPending'` and creates a new pending allocation row.

* **Signature**:
  ```sql
  public.request_transfer(
    p_asset_id uuid,
    p_requested_by_employee_id uuid
  ) RETURNS jsonb
  ```
* **Returns**:
  * On Success: `{"success": true}`
  * On Error (if no active allocation exists): `{"success": false, "reason": "no_active_allocation"}`
* **JavaScript / TypeScript Example**:
  ```javascript
  const { data, error } = await supabase.rpc('request_transfer', {
    p_asset_id: '8ef5c832-7ab9-42b7-a3f2-8924190c1e87',
    p_requested_by_employee_id: '5f92a3b8-2a1d-4071-884b-ee17812903e1'
  });
  ```

---

### 3. `approve_transfer`
Closes the old allocation as `'Returned'`, activates the new transfer allocation as `'Active'`, and updates the asset history without changing the current holder manually.

* **Signature**:
  ```sql
  public.approve_transfer(
    p_asset_id uuid
  ) RETURNS jsonb
  ```
* **Returns**:
  * On Success: `{"success": true}`
  * On Error (no pending transfer found): `{"success": false, "reason": "no_pending_transfer"}`
* **JavaScript / TypeScript Example**:
  ```javascript
  const { data, error } = await supabase.rpc('approve_transfer', {
    p_asset_id: '8ef5c832-7ab9-42b7-a3f2-8924190c1e87'
  });
  ```

---

### 4. `return_asset`
Returns an allocated asset. Changes the allocation status to `'Returned'`, timestamps `returned_on`, stores check-in notes, and marks the asset `status` as `'Available'`.

* **Signature**:
  ```sql
  public.return_asset(
    p_allocation_id uuid,
    p_condition_notes text DEFAULT null
  ) RETURNS jsonb
  ```
* **Returns**:
  * On Success: `{"success": true}`
  * On Error (allocation not found/active): `{"success": false, "reason": "allocation_not_found_or_not_active"}`
* **JavaScript / TypeScript Example**:
  ```javascript
  const { data, error } = await supabase.rpc('return_asset', {
    p_allocation_id: 'a91d24c0-781e-4501-8b20-c2473950ef12',
    p_condition_notes: 'Slight scratch on outer casing, but functional.'
  });
  ```

---

### 5. `create_booking`
Reserves a bookable asset for a specific time range. Ensures that the timeline does not overlap with any existing `'Upcoming'` or `'Ongoing'` reservation.

* **Signature**:
  ```sql
  public.create_booking(
    p_asset_id uuid,
    p_booked_by_employee_id uuid,
    p_start_time timestamptz,
    p_end_time timestamptz
  ) RETURNS jsonb
  ```
* **Returns**:
  * On Success: `{"success": true, "booking_id": "<uuid>"}`
  * On Overlap Conflict: `{"success": false, "reason": "overlap", "conflicting_start": "<timestamp>", "conflicting_end": "<timestamp>"}`
  * On Configuration/Range Error: `{"success": false, "reason": "invalid_time_range" | "asset_not_found" | "asset_not_bookable"}`
* **JavaScript / TypeScript Example**:
  ```javascript
  const { data, error } = await supabase.rpc('create_booking', {
    p_asset_id: '8ef5c832-7ab9-42b7-a3f2-8924190c1e87',
    p_booked_by_employee_id: '4b39c094-1a3b-417b-9442-3a55cd913210',
    p_start_time: '2026-07-15T09:00:00.000Z', // ISO String
    p_end_time: '2026-07-15T11:00:00.000Z'   // ISO String
  });
  
  if (data.success) {
    console.log('Booked successfully! ID:', data.booking_id);
  } else if (data.reason === 'overlap') {
    console.warn(`Time slot overlaps with an existing booking: ${data.conflicting_start} to ${data.conflicting_end}`);
  }
  ```

---

### 6. `cancel_booking`
Cancels an upcoming or ongoing booking, freeing the reserved slot.

* **Signature**:
  ```sql
  public.cancel_booking(
    p_booking_id uuid
  ) RETURNS jsonb
  ```
* **Returns**:
  * On Success: `{"success": true}`
  * On Error (booking already completed, cancelled, or missing): `{"success": false, "reason": "booking_not_found_or_already_closed"}`
* **JavaScript / TypeScript Example**:
  ```javascript
  const { data, error } = await supabase.rpc('cancel_booking', {
    p_booking_id: 'e3f0194b-1428-40b4-9387-5c219082d2fb'
  });
  ```
