# Updating the upstream version

Upstream is the `ghcr.io/accius/openhamclock` image, used as the base of the root
`Dockerfile`. Its tags are the release versions without a `v` prefix (GitHub release
`v26.11.0` is image tag `26.11.0`).

## Determining the upstream version

The pin is the tag on the `FROM` line of `Dockerfile`. The latest release:

```sh
gh release view -R accius/openhamclock --json tagName -q .tagName
```

Releases with other names (for example `rig-bridge-*`) are separate components; take only
`v<year>.<month>.<n>` tags. Confirm the image tag exists for both architectures:

```sh
docker buildx imagetools inspect ghcr.io/accius/openhamclock:<version> | grep Platform
```

## Applying the bump

1. Set the `FROM` tag in `Dockerfile`.
2. Set the version in `startos/versions/current.ts` to the same upstream version (e.g.
   `26.12.0:0`).
3. Check that upstream still writes the files the `Dockerfile` symlinks
   (`/app/config.json`, `/app/.qrz-credentials`, `/app/.hamqth-credentials`) and still
   writes everything else under `/data` or `/app/data`:
   `grep -rnE "ROOT_DIR|'/data" server/` in the upstream checkout.
4. Check that the environment variables `startos/utils.ts` sets still exist with the same
   meaning in upstream's `server/config.js` and `.env.example`.
