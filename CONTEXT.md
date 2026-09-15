# Portfolio context

## Purpose

Fugue is Abheet Singh Isher's public engineering portfolio. It presents eight
projects and three roles as a single scroll-led story, then lets visitors open
live demos, source repositories, a résumé, contact links, and a local
fact-bounded portfolio assistant.

## Architecture

- `public/index.html`: the complete responsive UI, Three.js scene, navigation,
  lazy demo reels, expandable project proof, theme state, and local retrieval.
- `server.js`: zero-dependency Node static server with byte ranges, hardened
  path handling, security headers, `/health`, and `/version`.
- `public/assets/reels`: current GIF posters and MP4 demonstrations for Weft,
  Vantage, glass, HealthFlow, Textify, and ShieldAI.
- `Dockerfile` and `fly.toml`: non-root Node 22 image and Fly deployment.

The assistant never calls a model or network service. It retrieves from the
fixed `RAG_FACTS` array, caps queries and history, detects common instruction
override patterns, and renders all user and answer text through `textContent`.

## User flows and CTAs

1. Start at the hero and use **View projects**, **Download résumé**, or
   **Contact**.
2. Use Work, Projects, Skills, and Contact navigation anchors.
3. Expand **Problem · contribution · proof** on project cards.
4. Play a lazy-loaded reel, open a live demo, or open source.
5. Toggle the theme; the preference persists locally.
6. Open **Ask about the work**, use every suggested question, enter a custom
   project/career question, and close the panel.
7. Copy the email address or use GitHub, LinkedIn, Email, Résumé, and Helm links.

## Trust boundaries

- The site accepts only GET/HEAD and has no account, mutation, upload, or remote
  model surface.
- The assistant is informational and limited to visible embedded facts. User
  input is treated as text, never HTML or executable instructions.
- A live release identity is accepted only when `/version.sourceRevision`
  exactly matches the reviewed commit supplied at image build time.
- Project claims follow each project's documented public scope. Zeno is a local
  Windows application and is never presented as publicly deployed.

## Run and verify

```bash
node server.js
# http://127.0.0.1:8080
node --check server.js
git diff --check
```

Complete release verification covers:

- hero actions, all anchors, all project disclosures, demo reels, live/source
  links, theme persistence, assistant suggestions/custom/refusal paths, email
  copy, résumé response, and browser console/network health;
- 375×812, 768×1024, 1366×768, and 1920×1080 with no horizontal overflow,
  reachable 44px controls, keyboard focus, reflow, and reduced-motion behavior;
- `/health`, `/version`, PDF/media byte ranges, traversal rejection, unsupported
  methods, CSP and other response headers;
- exact local HEAD, pushed remote HEAD, image build input, and live `/version`
  identity equality.

## Deploy

```bash
fly deploy --build-arg SOURCE_REVISION=$(git rev-parse HEAD)
curl https://abheet-isher.fly.dev/health
curl https://abheet-isher.fly.dev/version
```

## Limits

This is a portfolio, not a hosted implementation of Zeno or a production RUM
collector. Lab accessibility/performance checks do not constitute independent
WCAG certification or field Web Vitals. External links can change outside this
repository; verify them again for each release.
