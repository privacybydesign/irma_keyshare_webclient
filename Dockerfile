FROM node:25-alpine AS build
WORKDIR /app
# Enable corepack so the yarn version pinned in package.json's packageManager
# field (currently 4.x via .yarn/releases) is used instead of any classic
# yarn binary that might ship in the base image.
RUN corepack enable

# Install deps in a separate layer keyed on manifest + lockfile + yarn
# release, so Docker only re-runs `yarn install` when one of those actually
# changes. A source-only edit reuses the cached install layer.
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

COPY . /app
RUN yarn build

# Pinned by manifest-list digest so an upstream re-tag of :latest can't flip
# the Anchore scan between green and red without a source change. Bump the
# tag + digest together when a CVE patch warrants it.
FROM joseluisq/static-web-server:2.44.1@sha256:94618e3d17802265a21926217e6f9e7832b311b6fbf5933684001739fafed06a
COPY --from=build /app/build /public
# Attach baseline HTTP security headers (CSP, X-Frame-Options,
# X-Content-Type-Options, Referrer-Policy) to every response. static-web-server
# only applies the [advanced.headers] rules when SERVER_CONFIG_FILE points at
# the config file, so both the COPY and the env var are required.
COPY sws-config.toml /etc/sws/config.toml
ENV SERVER_CONFIG_FILE=/etc/sws/config.toml
