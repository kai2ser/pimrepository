# PIM Country Policy Profile Repository

A web application for managing Public Investment Management (PIM) country policy and strategy documents. Each policy record holds rich metadata and links to up to one English PDF and one native-language PDF.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Neon (serverless Postgres) via Drizzle ORM |
| File Storage | Vercel Blob |
| UI | shadcn/ui + Tailwind CSS v4 |
| Data Grid | TanStack Table v8 |
| Forms | React Hook Form + Zod v4 |
| Deployment | Vercel |

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env.local` with real values:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → Project → Connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → Blob → Token |

### 3. Push schema to database

```bash
npm run db:push
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed sample data (optional)

```bash
curl -X POST http://localhost:3000/api/seed
```

Inserts 10 sample country policy records. Safe to call multiple times — skips if data already exists.

---

## Database Commands

```bash
npm run db:push        # Push schema directly to DB (dev)
npm run db:generate    # Generate SQL migration files
npm run db:migrate     # Apply migrations
npm run db:studio      # Open Drizzle Studio browser GUI
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
4. Deploy

---

## Project Structure

```
app/
  page.tsx                     # Repository browse (server component)
  records/
    new/page.tsx               # Create record
    [id]/page.tsx              # Record detail + document management
    [id]/edit/page.tsx         # Edit record metadata
  api/
    records/route.ts           # GET list+filter, POST create
    records/[id]/route.ts      # GET, PATCH, DELETE
    documents/upload/route.ts  # POST PDF → Vercel Blob
    documents/[id]/route.ts    # DELETE document
    countries/route.ts         # GET distinct countries list
    seed/route.ts              # POST seed sample data

components/
  records/
    RecordTable.tsx            # Searchable, filterable table
    RecordForm.tsx             # Create / edit form
    TierBadge.tsx              # Tier classification badge
    DeleteRecordButton.tsx     # Confirm-before-delete dialog
  documents/
    DocumentUpload.tsx         # Upload / replace / delete PDF slots
    DocumentSection.tsx        # Client-side state wrapper

modules/
  records/
    schema.ts                  # Zod schema (shared client + API)
    queries.ts                 # Drizzle DB queries
  documents/
    queries.ts                 # Document DB queries

drizzle/
  schema.ts                    # Database schema definition
  migrate.ts                   # Migration runner script
```

---

## Data Model

### `policy_records`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| country | varchar | Country name |
| name_eng | text | English document title |
| name_orig | text | Native language title |
| year | smallint | Publication year |
| source | text | Issuing body |
| year_revised | smallint | Last revision year |
| overview | text | Description / abstract |
| policy_guidance_tier | smallint | Tier 1–5 |
| strategy_tier | smallint | Tier 1–5 |
| comment | text | Internal notes |
| link | text | External source URL |
| pages | smallint | Page count |
| tokens | integer | Token count (AI use) |

### `documents`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Auto-generated |
| record_id | UUID FK | → policy_records (cascade delete) |
| lang_type | varchar | `ENG` or `ORI` |
| lang_code | varchar | ISO 639 code e.g. `lt`, `vi` |
| lang_label | varchar | Human label e.g. `Lithuanian` |
| blob_url | text | Vercel Blob public URL |
| file_name | text | Original filename |
| file_size | integer | Size in bytes |

A `UNIQUE(record_id, lang_type)` constraint enforces **max one English + one native document per record** at the database level.
