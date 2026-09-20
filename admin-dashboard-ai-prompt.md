# Prompt: Build the Admin Dashboard Web App

Copy everything below into your AI coding tool (Claude Code, Cursor, etc.) as the project brief.

---

## Project Context

I'm building a **web admin dashboard** for an existing ride-hailing/taxi platform operating in Aswan, Egypt (mobile apps for riders and drivers already exist and are live). I currently have a **mobile admin app** and want a full **web version** with more depth (data tables, charts, multi-admin support). This is an internal back-office tool for platform operators, not a customer-facing product.

**Primary language:** Arabic (RTL) as default, with English (LTR) as a secondary language toggle — mirror the mobile app's language switcher.

## Tech Stack

- **Frontend:** React + TypeScript, Vite
- **Styling:** Tailwind CSS (with RTL support via `tailwindcss-rtl` or logical properties)
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table (sortable, filterable, paginated, exportable to CSV)
- **State/data fetching:** React Query (TanStack Query)
- **Routing:** React Router
- **Backend:** [tell the AI your actual backend — Firebase/Node+Express/Supabase/etc. The mobile app uses Firebase, so likely Firestore + Cloud Functions]
- **Auth:** Role-based admin login (super admin, ops admin, support agent — see Roles section below)
- **Deployment target:** Web app, installable as a PWA (offline shell + push notifications for new tickets/verifications)

## Design System

Match the existing mobile admin app's branding exactly:

**Colors**
| Token | Hex | Use |
|---|---|---|
| `--bg-dark` | `#0E1512` | Sidebar / header background |
| `--surface` | `#FFFFFF` | Card / content background |
| `--surface-alt` | `#F5F5F0` | Secondary surface |
| `--primary-green` | `#1B4D3E` | Primary actions, active nav state, brand |
| `--accent-gold` | `#E8B923` | CTAs, highlights, badges, toggle-on state |
| `--text-primary` | `#1C1C1C` | Body text on light surfaces |
| `--text-inverse` | `#F5F5F0` | Text on dark surfaces |
| `--text-muted` | `#7A8A82` | Secondary/help text |
| `--success` | `#1B7A4D` | Completed / approved / online states |
| `--danger` | `#D8342A` | Cancelled / rejected / offline states |
| `--warning` | `#E8B923` | Pending / in-review states |

**Layout**
- RTL-first sidebar navigation (right side), collapsible
- Top bar: global search, admin profile menu, notification bell with unread count
- Content area: white/light cards on a light gray page background
- Logo: gold-and-green "R" mark (Islamic geometric pattern + road/pin motif) — reuse as-is

## Roles & Permissions

- **Super Admin** — full access, including pricing/policy settings and role management
- **Ops Admin** — driver verification, trips, fleet management (no pricing edits)
- **Support Agent** — support tickets and broadcast notifications only

Include an **audit log** recording who changed what (verification approvals/rejections, pricing edits, broadcast sends) with timestamp and admin name.

## Pages & Features

### 1. Overview / Dashboard (`/`)
Top-line KPI cards (see full stat list below) + charts:
- Revenue trend (daily/weekly/monthly line chart, date-range picker)
- Trips by status (donut: completed/cancelled/ongoing/pending)
- Fleet status breakdown (online/offline/idle)
- Peak-hours heatmap (trip volume by hour × day of week)
- Recent activity feed (new tickets, new verification requests, flagged trips)

### 2. Driver Verification (`/verification`)
- Left panel: queue of pending verification requests (name, phone, vehicle, docs submitted count e.g. "2/9")
- Right panel: document viewer with zoom/rotate, side-by-side ID front/back, license front/back
- Approve / Reject actions with a required rejection reason (dropdown + free text)
- Status badges: بانتظار الفحص / تم الرفع / معتمد / مرفوض

### 3. Drivers & Riders (`/drivers`, `/riders`)
- Data table: name, phone, vehicle (model/year/plate), rating, status (موثق ومعتمد / قيد المراجعة / موقوف), total trips, join date
- Filters: status, vehicle type, rating range, active/inactive
- Search by name, phone, or plate number
- Row click → detail drawer: full profile, trip history, documents, support history, ability to suspend/reactivate
- Bulk actions: export selected to CSV, bulk suspend

### 4. Trips (`/trips`)
- Data table: trip ID, rider, driver, route (pickup → dropoff), fare breakdown, status, date/time
- Filters: status (الكل/مكتملة/جارية/ملغاة), date range, driver, rider, fare range
- Row click → detail view: route on a map, timeline (requested → accepted → started → completed/cancelled), full fare breakdown (base fare, per-km, platform commission, net driver payout), cancellation reason if applicable

### 5. Support Tickets (`/support`)
- Split view: ticket queue (left, filterable by status: الكل/مفتوحة/قيد المعالجة/تم الحل) + conversation thread (right)
- Admin reply box, internal notes (not visible to user), mark resolved
- Ticket metadata: submitter name/phone, submission time, category tag

### 6. Broadcast Notifications (`/broadcast`)
- Compose: title, message body, target audience (الكل / الركاب / الكباتن)
- Send button + confirmation modal (shows estimated recipient count)
- History log: past broadcasts with date, audience, sender

### 7. Platform Settings (`/settings`)
Tabbed layout:
- **Pricing tab:** base fare, minimum fare, night-hours multiplier, per-km rate — inline-editable fields with save confirmation and change history
- **Policies tab:** cancellation fee, platform commission %
- **Matching tab:** driver search radius, max trip distance, driver response time limit
- All settings show "last edited by [admin] on [date]" 

### 8. Admin Management (`/admins`) — Super Admin only
- List of admin accounts, roles, last login
- Invite new admin, edit role, deactivate

## Full Statistics to Surface (across Overview + dedicated report pages)

**Financial:** total revenue (today/week/month/custom), total commission earned, average commission per trip, total driver payouts, cancellation fee revenue, revenue by payment method, revenue trend chart, outstanding driver balances.

**Trips:** total trips, completed/cancelled/ongoing/pending counts, cancellation rate %, average fare, average distance & duration, peak-hours heatmap, trips by zone/route, average driver acceptance time.

**Fleet/Drivers:** total registered drivers, active/online-now/offline counts, new signups (period), pending verification count, approval vs rejection rate, average driver rating, top/lowest-rated drivers, drivers by vehicle type, churn (inactive 30+ days).

**Riders:** total registered riders, new signups (period), active riders (rode this period), average rides per rider, retention/churn, top riders by volume/spend.

**Support:** total tickets (open/in-progress/resolved), average response time, average resolution time, tickets by category, repeat-ticket users.

**Notifications:** broadcasts sent (count, by audience).

**Geography:** trip density by zone within Aswan, coverage gaps (supply/demand mismatch areas).

**Platform config snapshot:** current pricing values, commission rate history, active geofence/matching settings.

Put the ~10 most-watched metrics (revenue, active trips, pending verifications, open tickets, active drivers, cancellation rate, new signups, average rating) on the Overview page; the rest live on dedicated report pages with date-range filters and CSV export.

## Non-Functional Requirements

- Fully responsive (admins may use tablets)
- Fast initial load — lazy-load routes/charts
- All destructive actions (suspend driver, reject verification, delete admin) require a confirmation modal
- All monetary values displayed in ج.م (EGP) with the existing formatting convention seen in the mobile app
- Dates displayed in the format used by the mobile app (YYYY/MM/DD, 24h time)
- Empty states and loading skeletons for every data table and chart

## What I need from you

1. Set up the project scaffold with the tech stack above
2. Build the design system (Tailwind config with the color tokens, RTL support, shared components: Card, Badge, DataTable, StatCard, Modal, Sidebar)
3. Build pages in this order: Overview → Drivers/Riders → Trips → Verification → Support → Broadcast → Settings → Admin Management
4. Use mock/sample data first so I can review the UI before wiring up the real backend
5. Ask me before making backend/schema decisions — I'll confirm my actual data structure once the UI is approved
