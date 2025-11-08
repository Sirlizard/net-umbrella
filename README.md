# Net Umbrella

A React TypeScript application for managing personal and professional connections.

## Features

- Connection management dashboard
- Social connection tracking
- Events & Plans with connection graph visualization
- Modern UI with Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

### Environment Setup

Copy `.env.example` to `.env.local` and configure your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Note: `.env.local` and `.env` are git-ignored to keep your credentials secure.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- D3.js (for connection graph visualization)

## Features Overview

### Events & Connection Graph

The Events page provides a comprehensive Events & Plans experience:

- **Create and manage events**: Add events with titles, dates, notes, and tag friends who attended
- **Event history**: View and filter past events by date, search terms, or specific friends
- **Local and cloud storage**: Events are saved locally (localStorage key: `net-umbrella:events:v1`) and, when signed in, persisted to Supabase
- **Connection graph visualization**: An interactive graph shows relationships between friends based on shared events
  - Node size represents how often a friend was tagged in events
  - Link thickness shows the number of shared events between friends
  - Built with D3.js using force-directed layout with drag and zoom capabilities

### Database Setup

To enable server persistence for events, run the SQL migration in `supabase/migrations/20251106123000_events.sql` against your Supabase project. This creates the `events` and `event_tags` tables. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in your environment.
