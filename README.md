<div align="center">

# ⚡ Hackos

### The Hackathon Management Platform Built for Hackers

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.11-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

**From registration to judging, QR check-ins to AI-powered networking — everything you need to run world-class hackathons in one platform.**

[Live Demo](#deployment) · [Features](#-features) · [Setup](#-local-setup) · [API Docs](#-api-endpoints) · [Deploy](#-vercel-deployment)

</div>

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **🎫 Event Creation** | Create and publish hackathon events with custom settings |
| **📝 Public Registration** | Branded registration page with team support |
| **📱 QR Check-in** | Unique QR codes per participant for instant check-in |
| **📸 Selfie Capture** | Face matching for photo tagging using face-api.js |
| **👥 Team Management** | Solo or team registration with team lead management |
| **📢 Announcements** | Targeted announcements via dashboard |
| **🎁 Goodies Tracker** | Track swag distribution per participant |
| **⚖️ Live Judging** | Multi-criteria scoring with real-time pitching mode |
| **🏆 Results** | Auto-computed leaderboard with public results toggle |
| **🤖 AI Networking** | OpenAI-powered participant matching by skills & interests |
| **📧 Email Notifications** | Registration, approval, and rejection emails via Resend |
| **🔗 Share & Copy Links** | One-click share and copy event registration links |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5.3](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma 5.11](https://www.prisma.io/) |
| **Auth** | [NextAuth.js 4](https://next-auth.js.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion 11](https://www.framer.com/motion/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + custom shadcn-style |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Email** | [Resend](https://resend.com/) |
| **AI** | [OpenAI GPT-4](https://openai.com/) |
| **QR Codes** | [qrcode](https://www.npmjs.com/package/qrcode) + [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) |
| **Face Recognition** | [face-api.js](https://github.com/justadudewhohacks/face-api.js) |
| **File Uploads** | [UploadThing](https://uploadthing.com/) |
| **Validation** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |

---

## 📦 Local Setup

### Prerequisites

- **Node.js** ≥ 18.x ([download](https://nodejs.org/))
- **PostgreSQL** ≥ 14 ([install guide](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))

### Step 1: Clone the Repository

```bash
git clone https://github.com/JaneshKapoor/hackos.git
cd hackos
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all 40+ packages including Next.js, Prisma, NextAuth, Radix UI, Framer Motion, and more. The `postinstall` script automatically runs `prisma generate`.

### Step 3: Set Up PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb hackos
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql
sudo -u postgres createdb hackos
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/) and create a `hackos` database via pgAdmin.

### Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Database — use your local PostgreSQL connection
DATABASE_URL=postgresql://youruser@localhost:5432/hackos

# NextAuth — generate a secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Resend — sign up free at https://resend.com
RESEND_API_KEY=re_your_key_here

# OpenAI — get key at https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your_key_here

# UploadThing — sign up free at https://uploadthing.com
UPLOADTHING_TOKEN=eyYour_token_here

# App URL for QR codes and emails
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Push Database Schema

```bash
npx prisma db push
```

### Step 6: Seed Demo Data (Optional)

```bash
npm run db:seed
```

This creates:
- **Host account**: `host@hackos.app`
- **Demo event**: "Demo Hackathon 2026"
- **6 demo participants** with team setup
- **1 judge**: `judge@hackos.app`
- **1 sample announcement**

### Step 7: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** — the app is ready!

**Access from other devices on the same WiFi:**
```bash
npx next dev --hostname 0.0.0.0
```
Then open `http://<your-local-ip>:3000` on your phone.

---

## 🔐 Demo Credentials

| Role | Email | How to login |
|------|-------|-------------|
| **Host** | `host@hackos.app` | Enter email → "Sign In as Host" |
| **Judge** | `judge@hackos.app` | Via Magic Link |
| **Participant** | Register at `/event/demo-hackathon` | Via QR or Magic Link |

---

## 📄 Pages

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, and stats |
| `/login` | Authentication page (email + magic link) |
| `/event/[slug]` | Public event registration with selfie capture |
| `/qr/[token]` | QR code verification page |

### Host Dashboard (`/dashboard`)

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — stats, event list, create event |
| `/dashboard/participants` | Manage registrations (approve/reject) |
| `/dashboard/scan` | QR scanner for check-in |
| `/dashboard/goodies` | Track swag/goodie distribution |
| `/dashboard/announcements` | Send announcements to participants |
| `/dashboard/submissions` | View all project submissions |
| `/dashboard/judging` | Manage judges and scoring configuration |
| `/dashboard/results` | Compile and publish leaderboard |
| `/dashboard/networking` | Trigger AI-powered participant matching |

### Participant Dashboard (`/my`)

| Route | Description |
|-------|-------------|
| `/my` | Home — personal QR code, points, quick actions |
| `/my/submissions` | Submit hackathon project |
| `/my/photos` | AI face matching for event photos |
| `/my/network` | View AI-suggested connections |

### Judge Dashboard (`/judge`)

| Route | Description |
|-------|-------------|
| `/judge` | Scoring overview |
| `/judge/live` | Real-time live pitching and scoring interface |

---

## � API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `*` | `/api/auth/[...nextauth]` | NextAuth.js handler (login, session, callbacks) |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all published events with registration & submission counts |
| `POST` | `/api/events` | Create a new event (requires host session) |

### Registrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/registrations?eventId=xxx` | Fetch registrations for an event. Supports `status` and `search` query params |
| `POST` | `/api/registrations` | Register for an event (creates user, registration, participant records, sends email) |

### Participants

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/participants/[id]/approve` | Approve or reject a registration (`{ action: "approve" | "reject" }`) |
| `POST` | `/api/participants/[id]/checkin` | Mark participant as checked in via QR scan |

### Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/submissions?eventId=xxx` | Fetch submissions for an event |
| `POST` | `/api/submissions` | Submit a project (title, description, repo, demo, presentation URLs) |

### Judging

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/judging?eventId=xxx` | Get judges and scores for an event |
| `POST` | `/api/judging` | Submit a score / manage judges |

### QR Codes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/qr?participantId=xxx` | Generate QR code as base64 data URL |

### Announcements

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/announcements?eventId=xxx` | Get announcements for an event |
| `POST` | `/api/announcements` | Create a new announcement (supports target groups) |

### Goodies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/goodies?eventId=xxx` | Get goodie distribution logs |
| `POST` | `/api/goodies` | Log a goodie distribution to a participant |

### AI Networking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/networking/match` | Run OpenAI-powered matching on participants' bios and LinkedIn profiles |

### Photos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/photos/match-face` | Client-side face descriptor matching against event photos |

---

## �️ Database Schema

12 Prisma models powering the platform:

```
User → Account, Session, Event, Participant, Registration, JudgeAssignment, Score, GoodieLog
Event → Registration, Announcement, Submission, JudgeAssignment, EventPhoto, GoodieLog, NetworkingMatch
Registration → Participant, Submission
Participant → GoodieLog, NetworkingMatch
Submission → Score
```

Key models: `User`, `Event`, `Registration`, `Participant`, `Submission`, `Score`, `Announcement`, `GoodieLog`, `NetworkingMatch`, `JudgeAssignment`, `EventPhoto`, `VerificationToken`

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma)

---

## � Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit — Hackos platform"
git push origin main
```

### Step 2: Set Up a Hosted PostgreSQL Database

You need a cloud PostgreSQL database. **Recommended free options:**

| Provider | Free Tier | Signup |
|----------|-----------|--------|
| **Neon** (recommended) | 0.5 GB, always-on | [neon.tech](https://neon.tech/) |
| **Supabase** | 500 MB, 2 projects | [supabase.com](https://supabase.com/) |
| **Railway** | $5 credit/month | [railway.app](https://railway.app/) |

After creating a database, copy the connection string (`postgresql://...`).

### Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`JaneshKapoor/hackos`)
3. Set the **Framework Preset** to `Next.js`
4. Add **Environment Variables** (same as `.env`):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your hosted PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `RESEND_API_KEY` | Your Resend API key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `UPLOADTHING_TOKEN` | Your UploadThing token |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

5. Click **Deploy**

### Step 4: Push Database Schema to Production

After deployment, run this from your local machine with the production `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://...your-production-url" npx prisma db push
```

Or set up `DATABASE_URL` locally to point to production and run:
```bash
npx prisma db push
```

### Step 5: (Optional) Seed Production Data

```bash
DATABASE_URL="postgresql://...your-production-url" npm run db:seed
```

### Step 6: Update Vercel URLs

After your first deploy, update these env vars in Vercel settings:
- `NEXTAUTH_URL` → `https://hackos-yourname.vercel.app`
- `NEXT_PUBLIC_APP_URL` → `https://hackos-yourname.vercel.app`

Redeploy from the Vercel dashboard.

---

## 🔑 External Services Setup

| Service | What it's used for | Free Tier | Setup |
|---------|-------------------|-----------|-------|
| **[Resend](https://resend.com)** | Sending registration/approval emails | 3,000 emails/month | Sign up → Get API key |
| **[OpenAI](https://platform.openai.com)** | AI networking matching | Pay-per-use ($5 credit) | Sign up → Create API key |
| **[UploadThing](https://uploadthing.com)** | Selfie and file uploads | 2 GB free | Sign up → Get token |
| **[Neon](https://neon.tech)** | Cloud PostgreSQL (for Vercel) | 0.5 GB free | Sign up → Get connection URL |

---

## � Project Structure

```
hackos/
├── prisma/
│   ├── schema.prisma          # Database schema (12 models)
│   └── seed.ts                # Demo data seeder
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (host)/dashboard/  # Host dashboard (9 sub-pages)
│   │   ├── (judge)/judge/     # Judge dashboard (2 sub-pages)
│   │   ├── (participant)/my/  # Participant dashboard (4 sub-pages)
│   │   ├── (public)/event/    # Public event registration
│   │   ├── api/               # 12 API route handlers
│   │   ├── qr/[token]/        # QR verification page
│   │   ├── globals.css        # Global styles + design tokens
│   │   ├── layout.tsx         # Root layout + AuthProvider
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── animations/        # FadeIn, SlideUp, StaggerChildren
│   │   ├── shared/            # Navbar, AuthProvider, QRDisplay, QRScanner
│   │   └── ui/                # Button, Card, Input, Badge, Label, Select, etc.
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── openai.ts          # OpenAI client
│       ├── prisma.ts          # Prisma client singleton
│       ├── resend.ts          # Email templates + Resend client
│       └── utils.ts           # Helpers (cn, slugify, formatDate, etc.)
├── .env.example               # Environment variable template
├── .gitignore                 # Files excluded from git
├── next.config.js             # Next.js + PWA config
├── tailwind.config.ts         # Tailwind theme extensions
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies + scripts
```

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start development server on port 3000 |
| **Build** | `npm run build` | Production build |
| **Start** | `npm start` | Start production server |
| **Lint** | `npm run lint` | Run ESLint |
| **DB Push** | `npm run db:push` | Push Prisma schema to database |
| **DB Seed** | `npm run db:seed` | Seed database with demo data |

---

## 🎨 Design System

- **Background**: `#0a0a0a` (near-black)
- **Cards**: `#111111` with `border-white/5`
- **Primary gradient**: Purple (`#a855f7`) → Cyan (`#06b6d4`)
- **Typography**: System font stack
- **Glassmorphism**: `backdrop-blur-xl` + translucent borders
- **Animations**: Framer Motion `FadeIn`, `SlideUp`, `StaggerChildren`

---

## 📝 License

MIT © [Janesh Kapoor](https://github.com/JaneshKapoor)
