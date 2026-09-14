# Abheet Singh Isher — Portfolio ("Fugue")

A single-page portfolio for Abheet's experience and eight projects: Weft,
Zeno, Vantage, ShieldAI, Textify, HealthFlow, glass, and Helm. A continuous 3D
glyph animation connects the sections as you scroll. The client-side portfolio
assistant answers only from a fixed set of cited facts. Six product sections
include a demo reel that plays while its section is in view; the local-only
Zeno and operations-focused Helm sections link to their source or live surface
without implying that a reel exists.

**Live target:** https://abheet-isher.fly.dev (Fly.io, region `sin`)

## Stack

- **Site:** a single static `public/index.html` — no build step.
  - Three.js (r128) InstancedMesh glyph lattice + custom GLSL shader
  - Native scroll drives the page; GSAP + ScrollTrigger animate the lattice and chapter transitions when available (no Lenis)
  - Client-side portfolio assistant (TF‑IDF retrieval over embedded, cited facts; no model or tool execution)
  - Assistant input is capped at 500 characters, rendered with DOM text nodes, and retained only in a 40-message in-page window; questions never leave the browser
  - Theme-aware (dark/light), responsive, `prefers-reduced-motion` aware
  - The hero statement is present in the server-sent HTML (visible before JS)
- **Reels:** GIF used as a lazy-loaded poster; MP4 (`preload=none`) lazy-loads
  and plays only while its chapter is in view (IntersectionObserver).
  Dimensions are reserved via `aspect-ratio` so there is zero layout shift.
- **Server:** `server.js` — a zero-dependency Node stdlib HTTP static server
  (correct content types incl. `video/mp4` + `application/pdf`, HTTP Range
  support for video, `/health` liveness, a build-injected `/version` revision,
  path-traversal hardening, and restrictive
  framing, permissions, referrer, and content-security headers).
- **Container:** `node:22-alpine`, runs as the non-root `node` user, port 8080.

## Layout

```
public/
  index.html            # the whole site
  resume.pdf            # linked from the nav ("Résumé") and Contact
  assets/
    avatar.svg          # PLACEHOLDER monogram — swap for a real photo (see below)
    reels/
      weft-demo.gif / weft-reel.mp4
      vantage-demo.gif / vantage-reel.mp4
      glass-demo.gif / glass-reel.mp4
      healthflow-demo.gif / healthflow-reel.mp4
      textify-demo.gif / textify-reel.mp4
      shieldai-demo.gif / shieldai-reel.mp4
server.js               # static file server (port 8080, /health, /version)
Dockerfile
fly.toml                # app = "abheet-isher", primary_region = "sin"
```

## Run locally

```bash
node server.js
# → http://localhost:8080   (health: /health; identity: /version)
```

Or in Docker:

```bash
docker build --build-arg SOURCE_REVISION=$(git rev-parse HEAD) -t abheet-portfolio .
docker run --rm -p 8080:8080 abheet-portfolio
```

## Deploy (Fly.io)

```bash
fly apps create abheet-isher   # once
fly deploy --build-arg SOURCE_REVISION=$(git rev-parse HEAD)
```

`fly.toml` serves the container on internal port 8080 with an HTTP health
check at `/health`. `/version` reports the validated 40-character
`sourceRevision` supplied at build time; it reports `null` rather than guessing
when that build argument is absent. No secrets or runtime env vars are required.

## Avatar placeholder

`public/assets/avatar.svg` is a tasteful glass monogram — **not** a real
likeness. To use a real photo, drop a square image at
`public/assets/avatar.jpg` (or `.png` / `.webp`) and update the `<img src>`
in the `.about-id` block of `index.html`. If the referenced file is missing,
the CSS gradient orb behind it shows as the fallback.
