# resque-web

A web UI for [Resque](https://metacpan.org/pod/Resque), built on
[Mojolicious](https://mojolicious.org/) (Perl) with a Vue 3 frontend. It serves
both a JSON API and the compiled single-page app from one process, backed by
Redis.

## Run with Podman (compose)

Brings up the web app plus a Redis service:

```sh
podman-compose up -d --build     # build + start
podman-compose logs -f web       # follow logs
podman-compose down              # stop (add -v to also drop the redis volume)
```

The UI is then available at <http://localhost:8888>.

### Frontend development with hot-reload

The `web` service serves the frontend that was compiled into the image at build
time, so source edits under `client/src/` don't show up without rebuilding. For
fast iteration there is a `dev` service (behind the `dev` profile) that runs the
Vue dev server with hot-reload and proxies the API to `web`:

```sh
podman-compose --profile dev up   # brings up redis + web + dev
```

The dev UI is then available at <http://localhost:8080> and reloads instantly on
source changes. API requests are proxied to the `web` (Mojolicious) service, so
it keeps talking to the real backend and Redis.

## Build & publish a production image

A dedicated makefile drives the image build/publish with Podman. It is separate
from `Makefile.PL`, so invoke it with `make -f image.mk`:

```sh
# Build localhost/resque-web:0.1.0 (+ :latest), amd64
make -f image.mk build

# Publish to any registry (public or private) after logging in
podman login ghcr.io
make -f image.mk release REGISTRY=ghcr.io IMAGE=gonzalo-radio/resque-web TAG=0.1.0
```

Overridable variables: `REGISTRY`, `IMAGE`, `VERSION`, `TAG`, `PLATFORM`
(defaults to `linux/amd64`). Run `make -f image.mk help` for the full list.

## Runtime configuration

The image reads its Redis connection from environment variables at startup, so a
published image can target any Redis without rebuilding:

| Variable           | Default       | Description                     |
| ------------------ | ------------- | ------------------------------- |
| `RESQUE_REDIS`     | `redis:6379`  | Redis `host:port`               |
| `RESQUE_NAMESPACE` | `resque`      | Resque key namespace            |

Run the published image standalone against an external Redis:

```sh
podman run -d --name resque-web -p 8888:8888 \
  -e RESQUE_REDIS=my-redis.internal:6379 \
  ghcr.io/gonzalo-radio/resque-web:0.1.0
```

For more complex config you can instead mount a full config file over
`/etc/resque-web.conf` (a Perl hash passed to `Resque->new`; see
`container/resque-web.conf`).

The container runs as a non-root user in Mojolicious `production` mode with a
built-in healthcheck (`GET /ping`).

## Native Perl install (without containers)

The standard Perl toolchain still works:

```sh
perl Makefile.PL
make
make test
make install     # installs the `resque-web` command and modules
```

This requires a running Redis and the `Mojolicious` and `Resque` CPAN modules.

## Frontend development

The Vue app lives in `client/` (Vue CLI 5). See `client/README.md`. In short:

```sh
cd client
yarn install
yarn serve     # dev server with hot reload, proxies the API to :8888
yarn build     # compiles into ../lib/Resque/Web/public (served by the backend)
yarn lint
```
