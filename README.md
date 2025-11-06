# Net Umbrella

A React TypeScript application for managing personal and professional connections.

## Features

- Connection management dashboard
- Social connection tracking
- Modern UI with Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

### Google Maps API key (3 easy options)

This app uses a public browser key for Google Maps JavaScript + Places. Public keys are expected on the client—protect them by adding both:

- HTTP referrer restriction: only allow your domain(s), e.g. `http://localhost:5173/*`, `https://yourdomain.com/*`
- API restriction: limit to “Maps JavaScript API” and “Places API”

You have three ways to provide the key:

1) Environment file (recommended)

	Copy `.env.example` to `.env.local` and set:

	```
	VITE_GOOGLE_MAPS_API_KEY=YOUR_PUBLIC_BROWSER_KEY_HERE
	```

	Restart the dev server after changes.

2) Window global (handy for static hosting/CDN configs)

	Inject a small script on your host to set a global before the app loads:

	```html
	<script>
	  // Public browser key, protected by referrer + API restrictions
	  window.NET_UMBRELLA_MAPS_KEY = 'YOUR_PUBLIC_BROWSER_KEY_HERE';
	</script>
	```

	The app automatically reads `window.NET_UMBRELLA_MAPS_KEY` if the env var isn’t present.

3) URL/local storage (quick dev/testing)

	- URL param: `?mapsKey=YOUR_PUBLIC_BROWSER_KEY_HERE`
	- Or paste it once in the Events page prompt; it’s saved to `localStorage`.

Notes:
- `.env.local` and `.env` are git-ignored, so your keys stay out of the repo.
- If you ever exposed an unrestricted key, add restrictions in Google Cloud and rotate it.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase

## Events page (replaces Locations map)

The `EventsPage` component provides an Events & Plans experience. Key points:

- Create events, tag friends, and view past events. Events are saved locally (localStorage) and, when signed in, persisted to Supabase in the `events` table with tags in `event_tags`.
- LocalStorage key: `net-umbrella:events:v1`.
- A Connection Graph visualizes relationships between tagged friends. Node size = times a friend was tagged; link thickness = number of shared events.
- The graph uses D3 for a force-directed layout with drag and zoom.

If you want to enable server persistence, run the SQL migration in `supabase/migrations/20251106123000_events.sql` against your Supabase project (it creates `events` and `event_tags`). Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your environment.
