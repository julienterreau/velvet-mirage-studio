# Velvet Mirage Studio

A dark romantic cinematic character generator and story prompt studio.

## Local development

1. Install dependencies:
   npm install
2. Create a local environment file from `.env.example`
3. Start the frontend:
   npm run dev
4. Start the API server:
   npm run server

The frontend is served by Vite at http://localhost:3000 and the API is served at http://localhost:3001.

## Production deployment

- Frontend: deploy the built `dist` folder on Vercel or Netlify
- Backend: deploy this repo's `server.js` on Render, Railway, or Fly.io
- Set environment variables from `.env.example`

## Required environment variables

- `DIGEN_API_KEY` — your Digen API key
- `DIGEN_API_URL` — the full endpoint URL to your Digen chat completions endpoint
- `PORT` — optional backend port, default 3001

## Frontend/backend split

- Vite handles local UI development
- Express serves `/api/*` endpoints and static build output in production
- The browser should only talk to the backend, never directly to Digen
