# BAT (Business Automated Thought)

UI-only preview of the BAT dashboard. The experience is mocked for demo purposes.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repository to GitHub:

   ```bash
   git remote add origin https://github.com/<your-username>/bat.git
   git branch -M main
   git push -u origin main
   ```

2. In Vercel, click **New Project** and import the GitHub repo.
3. Vercel will auto-detect Vite. Keep the defaults:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

After the build completes, Vercel will provide a live preview URL.
