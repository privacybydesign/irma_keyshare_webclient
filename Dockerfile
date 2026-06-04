FROM node:24-alpine AS build
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
FROM joseluisq/static-web-server:2.42.0@sha256:2d67e47e22172235e339908777e692006ffdcf42dc4c531aff5d4337a7559a1e
COPY --from=build /app/build /public
