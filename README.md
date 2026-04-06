# Phonics Buddy

Phonics Buddy is an interactive reading tutor for early learners. It uses playful word and sentence practice, progress tracking, and celebration effects to make phonics practice feel fun and motivating.

## Features

- Word, sentence, and paragraph practice modes
- Animated progress tracking
- Celebratory confetti and sound feedback
- Built with React, Vite, and Tailwind CSS
- Configured for GitHub Pages deployment

## Local development

```bash
npm install
npm run dev
```

Open the dev server URL shown in the terminal and start practicing.

## Build

```bash
npm install
npm run build:docs
```

This produces the production app in the `docs/` folder.

## Preview production build locally

```bash
npm install
npm run preview
```

## Future deployment instructions

The app is set up to deploy with either `docs/` on `main` or with an automated `gh-pages` workflow.

### Option 1: GitHub Pages from `main/docs`

1. Build the app locally:

```bash
npm install
npm run build:docs
```

2. Commit and push the generated `docs/` folder to `main`:

```bash
git add docs
git commit -m "Build docs for GitHub Pages"
git push origin main
```

3. In GitHub repo settings → Pages, select:
   - Branch: `main`
   - Folder: `/docs`

The site will be available at:

```text
https://JunaidBabu.github.io/Phonics-Buddy/
```

### Option 2: Automatic deployment to `gh-pages`

The GitHub Actions workflow at `.github/workflows/deploy.yml` is configured to:

- install dependencies
- run `npm run build:docs`
- publish `./docs` to the `gh-pages` branch

To enable this option:

1. Push your code to `main`.
2. In GitHub repo settings → Pages, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`

Once the workflow completes, the site will also be available at:

```text
https://JunaidBabu.github.io/Phonics-Buddy/
```

## Notes

- `vite.config.ts` now outputs the production build to `docs/`.
- `npm run build:docs` removes `docs/` and rebuilds it cleanly.
- `npm run deploy` runs the same build command.
- `homepage` in `package.json` is configured for GitHub Pages.
