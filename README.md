# Net Umbrella

A React TypeScript application for managing friends and social connections.

## Features

- Friend management dashboard
- Social connection tracking
- Modern UI with Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` (or `.env`) file in the project root and add:

```
VITE_GOOGLE_MAPS_API_KEY="<your Google Maps API key>"
```

Notes:
- `.env.local` and `.env` are git-ignored (see `.gitignore`) so your keys stay out of the repo.
- If you accidentally committed secrets before, remove them from git history and rotate those keys.
- After editing env files, restart the dev server.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
