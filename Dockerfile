# Minimal static server image for the Abheet Isher portfolio.
# Zero npm dependencies — just Node's stdlib http server over ./public.
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

WORKDIR /app

# App is dependency-free, so we only need the server and the static site.
COPY server.js ./server.js
COPY public ./public

EXPOSE 8080

# Run as the unprivileged 'node' user shipped in the base image.
USER node

CMD ["node", "server.js"]
