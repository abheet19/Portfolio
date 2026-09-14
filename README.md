# Abheet Singh Isher — Portfolio ("Fugue")

A cinematic, single-page portfolio. One continuous 3D glyph-particle "lattice"
splits, drifts and converges across every chapter as you scroll — hero,
experience, and each project (Weft, Zeno, Vantage, ShieldAI, Textify,
HealthFlow, glass, Helm) — with a working, client-side, citation-grounded
chatbot ("Ask the lattice") that answers only from a fixed set of facts about
the work. Each shipped project embeds a 60fps demo reel that plays on scroll.

**Live target:** https://abheet-isher.fly.dev (Fly.io, region `sin`)

## Stack

- **Site:** a single static `public/index.html` — no build step.
  - Three.js (r128) InstancedMesh glyph lattice + custom GLSL shader
  - GSAP + ScrollTrigger + Lenis for scroll-driven topology morphs
  - Client-side RAG chatbot (TF‑IDF keyword retrieval over embedded facts, cited)
  - Theme-aware (dark/light), responsive, `prefers-reduced-motion` aware
  - The hero statement is present in the server-sent HTML (visible before JS)
- **Reels:** GIF used as a lazy-loaded poster; MP4 (`preload=none`) lazy-loads
  and plays only while its chapter is in view (IntersectionObserver).
  Dimensions are reserved via `aspect-ratio` so there is zero layout shift.
- **Server:** `server.js` — a zero-dependency Node stdlib HTTP static server
  (correct content types incl. `video/mp4` + `application/pdf`, HTTP Range
  support for video, a `/health` endpoint, path-traversal hardening).
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
server.js               # static file server (port 8080, /health)
Dockerfile
fly.toml                # app = "abheet-isher", primary_region = "sin"
```

## Run locally

```bash
node server.js
# → http://localhost:8080   (health: http://localhost:8080/health)
```

Or in Docker:

```bash
docker build -t abheet-portfolio .
docker run --rm -p 8080:8080 abheet-portfolio
```

## Deploy (Fly.io)

```bash
fly apps create abheet-isher   # once
fly deploy
```

`fly.toml` serves the container on internal port 8080 with an HTTP health
check at `/health`. No secrets or env vars are required.

## Avatar placeholder

`public/assets/avatar.svg` is a tasteful glass monogram — **not** a real
likeness. To use a real photo, drop a square image at
`public/assets/avatar.jpg` (or `.png` / `.webp`) and update the `<img src>`
in the `.about-id` block of `index.html`. If the referenced file is missing,
the CSS gradient orb behind it shows as the fallback.
