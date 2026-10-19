# TruthLens AI

TruthLens helps users review news claims. Enter a headline and article text, or provide an article link. The app returns an AI-assisted assessment with related sources when available.

## What it includes

- News analysis using pasted text or an article URL
- A result page with the verdict, explanation, and source links
- Sign-in, saved history, dashboard, and feedback
- Sample articles for trying the app

## Built with

- React, TypeScript, and Vite
- Node.js, Express, and TypeScript
- A server-side AI provider (Gemini or Cloudflare Workers AI)
- JSON file storage for the demo data

## Run locally

You need Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Set the AI provider's environment variables on the server. See `.env.example` for the supported options. Keep API keys in your local environment; do not commit them to GitHub.

Create a production frontend build with:

```bash
npm run build
```

## Note

AI results can be wrong and are not proof that a claim is true or false. Open the source links and verify important claims independently. Demo data uses JSON file storage and may not persist if the hosting service replaces its filesystem.
