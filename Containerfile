# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: build the Vue 3 frontend into lib/Resque/Web/public
# ---------------------------------------------------------------------------
FROM docker.io/node:22-trixie-slim AS frontend

WORKDIR /app/client

# Install deps first (better layer caching)
COPY client/package.json client/yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the SPA. vue.config.js outputDir is '../lib/Resque/Web/public',
# so the assets land in /app/lib/Resque/Web/public.
COPY client/ ./
RUN mkdir -p /app/lib/Resque/Web/public && yarn build

# ---------------------------------------------------------------------------
# Stage 2: Perl/Mojolicious runtime serving the API + built SPA
# ---------------------------------------------------------------------------
FROM docker.io/perl:5.42-trixie AS runtime

WORKDIR /app

# Perl deps (matches Makefile.PL: Mojolicious >= 9.17, Resque >= 0.42; Redis client)
RUN cpanm --notest --no-man-pages Mojolicious Resque Redis \
    && rm -rf /root/.cpanm

# Backend source
COPY lib/ ./lib/
COPY script/ ./script/

# Built frontend from stage 1
COPY --from=frontend /app/lib/Resque/Web/public ./lib/Resque/Web/public

# Point the app at the redis service (see setup_plugins in lib/Resque/Web.pm)
COPY container/resque-web.conf /etc/resque-web.conf

EXPOSE 8888

CMD ["perl", "script/resque-web", "daemon", "-l", "http://*:8888"]
