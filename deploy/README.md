# Carvia deployment preparation

Prepared for a single Linux Docker host, one domain, and the existing MongoDB database. No cloud service has been provisioned and no live data has been migrated.

## Architecture

Caddy serves HTTPS for the configured domain. `/api/*` and `/uploads/*` go to the API; all other requests go to Next.js. The API and web containers expose no host ports. This keeps login cookies on the same public origin. Server-rendered pages call `http://api:5050/api` using the server-only environment setting.

Photos live in the named `carvia_uploads` volume mounted at `/data/uploads`. Uploads, static serving, catalogue import and publication checks use the same directory. Existing database paths remain `/uploads/filename`; no database rewrite is required. The volume survives container replacement, but is not a backup and does not survive loss of the host.

## Before starting

- Use Node 22 for local installs and builds; Docker images already select Node 22. The current system Node 20.15 is below Mongoose's supported minimum.
- Select the host and domain. Point domain DNS to the host and allow ports 80 and 443.
- Copy `deploy/.env.example` to `deploy/.env`; supply the real domain, original database connection and a strong random JWT secret. Keep this file private. Do not use the example values.
- Allow the host's outbound IP in Atlas. Retain the existing database and accounts.
- Back up the database and all current `server/uploads` files before migration. Publication requires those existing photos to exist on the new host.

## Reproducible checks

From `server`: `npm ci`, then `npm test`.
From `car-platform-web`: `npm ci`, then `npm run build`.
From `deploy`: `docker compose --env-file .env config --quiet`, then `docker compose --env-file .env build`.
The public origin is embedded in the frontend build, so rebuild the web image when changing domain.

## Migrate photos before serving traffic

Transfer a copy of the current `server/uploads` directory to a private staging directory on the host. Preserve filenames exactly. After building images, use a one-off API container with that staging folder mounted read-only at `/import`; copy its contents into `/data/uploads` and set ownership to UID/GID 1000. The one-off container must use the same Compose project and uploads volume. Verify file counts and checksums against the source before starting the gateway. Keep the source copy until launch verification and backup recovery are complete.

Do not run the catalogue import to migrate existing photos: its existing-batch guard intentionally makes it a no-op.

## Start and validate

From `deploy`, run `docker compose --env-file .env up -d` only after storage and secrets are configured. Check API health, sign in as the existing owner, view an existing vehicle photo, create a private draft, upload, reload, publish/unpublish an explicitly disposable listing, and confirm public visibility follows its state. Restart the API container and verify photos remain readable. Backups/restoration and live HTTPS/cookies require verification on the selected host.

## Backups and rollback

Back up both MongoDB and the uploads volume to storage outside the server. Keep a manifest of photo filenames and checksums with each backup and perform a restore drill into an isolated environment. Never use `docker compose down -v` or volume-prune commands against the production project: those remove stored data. Rolling back app images must retain the uploads volume and original database connection.

## Current verification boundary

Compose configuration can be validated without a running engine. A full Docker build/restart test requires Docker to be running. No deployment, DNS change, credential change, remote resource purchase or data migration is included in this preparation.

References: [Docker volume lifecycle](https://docs.docker.com/engine/storage/volumes/), [Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy).
