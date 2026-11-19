FROM ghcr.io/accius/openhamclock:26.11.0

# OpenHamClock writes a few files next to its code in /app, which is not a
# volume. Point them at the package volume (mounted at /data) so they survive
# restarts. Symlinks, not file bind mounts: the app deletes the credential files
# when a user signs out, and a bind-mounted file cannot be unlinked.
RUN ln -s /data/config.json /app/config.json \
 && ln -s /data/.qrz-credentials /app/.qrz-credentials \
 && ln -s /data/.hamqth-credentials /app/.hamqth-credentials
