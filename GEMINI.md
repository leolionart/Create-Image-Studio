# AGENT Guide

## Overview

Creative Image Studio is a Vite + React client that talks directly to Google AI Studio (Generative Language / Imagen APIs). This document lists the steps required to configure local development with Google AI Studio and to deploy the site to Cloudflare Pages via Wrangler.

## Prerequisites

- Node.js 20+
- npm 10+
- Google account with access to Google AI Studio
- Cloudflare account with Pages enabled
- (Optional) Wrangler CLI installed globally (`npm install -g wrangler`)

## 1. Google AI Studio Setup

1. Visit [Google AI Studio API Keys](https://aistudio.google.com/app/apikey).
2. Create a new API key (ensure **Generative Language** access is granted).
3. Remove any restrictions that would block browser usage (no domain/IP restrictions).
4. Copy the key value for later steps.

## 2. Local Environment Configuration

1. Create `.env.local` in the project root if it does not exist.
2. Add the key:

   ```env
   VITE_GEMINI_API_KEY=your_google_ai_studio_key
   ```

3. Install dependencies and start dev mode:

   ```bash
   npm install
   npm run dev
   ```

   Vite exposes variables prefixed with `VITE_` to the browser build, so the app reads the key via `import.meta.env.VITE_GEMINI_API_KEY`.

## 3. Production Build

To generate static assets:

```bash
npm run build
```

Outputs are written to `dist/`.

## 4. Cloudflare Pages Deployment (Wrangler)

1. Authenticate Wrangler (one-time):

   ```bash
   npx wrangler login
   ```

2. Store the production secret:

   ```bash
   npx wrangler pages secret put VITE_GEMINI_API_KEY
   ```

   Paste the same key used locally when prompted.

3. Deploy the latest build:

   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=create-image-studio
   ```

Wrangler uploads the `dist/` directory to Cloudflare Pages. The deployed site reads the secret at runtime, so no key is baked into the bundle.

## 5. Updating Configuration

- To rotate keys, update `.env.local`, restart the dev server, and re-run `wrangler pages secret put VITE_GEMINI_API_KEY`.
- After updating secrets, run a new build and deploy.

## 6. Troubleshooting

- **API key invalid**: Regenerate the key in Google AI Studio, ensure restrictions are disabled, and update both local env and Cloudflare secret.
- **Env changes not picked up**: Restart `npm run dev` so Vite reloads `.env.local`.
- **Wrangler ignoring config**: Ensure `wrangler.toml` includes `pages_build_output_dir = "dist"` or rely on CLI options; the provided deploy command passes the directory explicitly.

Following these steps ensures Creative Image Studio can call Google AI Studio APIs locally and from Cloudflare Pages.
