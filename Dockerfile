# ============================================================
# Dockerfile multi-stage — Next.js 16 (output: standalone)
# Build : docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=... -t triber .
# Run   : docker run -p 3000:3000 --env-file .env.production triber
# ============================================================

# ---- Stage 1 : dépendances de production uniquement ----
FROM node:20-alpine AS deps
WORKDIR /app

# Copie les manifestes avant le code source pour maximiser le cache Docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# ---- Stage 2 : build de production ----
FROM node:20-alpine AS builder
WORKDIR /app

# Installe TOUTES les dépendances (devDeps nécessaires pour next build)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variables NEXT_PUBLIC_ injectées au build (substitution statique par Next.js)
# Passer via --build-arg ou depuis les secrets CI/CD
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Désactive la télémétrie Next.js pendant le build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ---- Stage 3 : image de production minimale ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Utilisateur non-root pour limiter la surface d'attaque
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Assets publics (images, fonts…)
COPY --from=builder /app/public ./public

# Output standalone : serveur autonome sans node_modules complet
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Fichiers statiques Next.js (JS, CSS compilés)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Lance le serveur standalone généré par next build (output: standalone)
CMD ["node", "server.js"]
