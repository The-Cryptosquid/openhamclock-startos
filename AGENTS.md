# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- Don't replace the `Dockerfile` symlinks with file bind mounts: upstream unlinks the
  credential files on sign-out, and unlinking a bind-mounted file fails.
- Don't set `API_WRITE_KEY` to protect writes: upstream's web UI never sends it, so settings
  sync from the dashboard would stop working. The proxy's basic auth is the protection.
- Keep the `check` job in `.github/workflows/tagAndRelease.yml`. The shared workflow decides whether
  a version is new by asking `REFERENCE_REGISTRY`, which never lists this package, so without the
  check every push to `master` rebuilds and re-releases the current version.
