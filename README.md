<p align="center">
  <img src="icon.png" alt="OpenHamClock Logo" width="21%">
</p>

# OpenHamClock on StartOS

> Everything not listed in this document should behave the same as upstream
> OpenHamClock. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[OpenHamClock](https://github.com/accius/openhamclock) is a real-time amateur radio dashboard (space weather, band predictions, DX and RBN spots, POTA/SOTA, satellites, weather) written in Node.js and React. This package runs it as a single-station, self-hosted instance behind a StartOS password gate.

Upstream also runs a public instance at openhamclock.com, with the same panels and data sources. The self-hosted instance differs from it in five ways:

- **Logging software reports to it directly.** WSJT-X, JTDX, N1MM Logger+ and DXLog on the local network send UDP straight to the server. The public site cannot receive UDP from a home network and needs upstream's relay program running on the operator's computer.
- **Every screen shares one layout.** Settings sync is on, so layout, panels and filters are stored on the server. The public site keeps them in each browser.
- **Dashboard state is backed up.** Layout, spot history, station settings and account logins live on the `main` volume and are included in StartOS backups.
- **Logins and station details stay on the server.** QRZ.com, HamQTH and Space-Track credentials, callsign and grid square are held by this server, not a third-party site. The public data feeds still see the server's IP address.
- **Updates follow the package.** The instance changes only when a new package is installed, independent of the public site's deployments and uptime.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package builds a thin image on top of upstream's published image. It adds three symlinks and changes nothing else.

| Item          | Value                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image source  | `Dockerfile`: `FROM ghcr.io/accius/openhamclock` plus symlinks from `/app/config.json`, `/app/.qrz-credentials` and `/app/.hamqth-credentials` into `/data` |
| Architectures | x86_64, aarch64                                                                                                                                             |
| Entrypoint    | Upstream's (`docker-entrypoint.sh`, which runs `node server.js`)                                                                                            |
| User          | root, as upstream                                                                                                                                           |

One subcontainer, `openhamclock-sub`, runs the single daemon `openhamclock`. To inspect a running install: `start-cli package attach openhamclock -n openhamclock-sub -- sh`.

The symlinks exist because upstream writes those three files next to its code in `/app`, which is not a volume. They are symlinks rather than file bind mounts because the app deletes the credential files when a user signs out in the UI, and a bind-mounted file cannot be unlinked.

## Volume and Data Layout

Everything lives on one volume, `main`, which is mounted twice.

| Path in container | Volume subpath | Contents                                                                                                                                                                                                                              |
| ----------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/data`           | (root)         | `store.json` (package state), `settings.json` (synced UI settings), `stats.json`, `spot-history.json` and the other JSON stores upstream keeps in `/data`; `config.json` and the QRZ/HamQTH credential files via the image's symlinks |
| `/app/data`       | `app-data/`    | Upstream's `ROOT_DIR/data`: Meshtastic settings and an optional `satellites.json` override                                                                                                                                            |

There is no database; every store is a JSON file the app reads and writes itself.

## File Models

The package owns one file, `store.json`. It writes no OpenHamClock config file.

- **`store.json`** (`/data/store.json`, JSON). Seeded with defaults at install. Written only by the package's actions. Holds the password for the proxy gate, the station settings and the online account logins. A hand edit survives, and `main` reads it reactively, so any change restarts the daemon.

Every OpenHamClock setting the package controls is passed as an **environment variable on every start**. Upstream reads them only at launch, and the environment always wins over `config.json` and the in-UI settings for the same keys:

- **Always set:** `PORT=3000`, `TRUST_PROXY=true`, `SETTINGS_SYNC=true`, `AUTO_UPDATE_ENABLED=false`, `WSJTX_ENABLED=true`, `WSJTX_UDP_PORT=2237`, `N1MM_UDP_ENABLED=true`, `N1MM_UDP_PORT=12060`, `UNITS` / `DISTUNITS` / `TEMPUNITS` / `PRESSUNITS`, `TIME_FORMAT`.
- **Set only when the user has given a value:** `CALLSIGN`, `LOCATOR`, `TZ`, `QRZ_USERNAME` + `QRZ_PASSWORD`, `HAMQTH_USERNAME` + `HAMQTH_PASSWORD`, `SPACE_TRACK_USERNAME` + `SPACE_TRACK_PASSWORD` (each pair only when both halves are set).

Because the environment wins, a QRZ or HamQTH login set by **Online Accounts** takes priority over one a user typed into the dashboard. Upstream's `config.json` (written by the dashboard's N3FJP bridge settings) belongs to the app and the package never touches it.

## Dependencies

None. OpenHamClock needs no other StartOS service. It fetches its data directly from public internet sources (NOAA SWPC, PSKReporter, the Reverse Beacon Network, DX cluster nodes, POTA/SOTA, CelesTrak/AMSAT/SatNOGS and others), so it needs outbound internet access to show anything.

## Network Access and Interfaces

The package exports one web interface and two UDP/TCP port ranges for logging software.

| Interface id | Name             | Type  | Port(s)     | Protocol                        | Purpose                                                     |
| ------------ | ---------------- | ----- | ----------- | ------------------------------- | ----------------------------------------------------------- |
| `ui`         | Web Interface    | `ui`  | 3000        | HTTP, behind StartOS basic auth | The dashboard and its API                                   |
| `wsjtx`      | WSJT-X UDP       | `api` | 2237–2238   | UDP (+TCP), range               | WSJT-X / JTDX UDP reporting. Only 2237 is used              |
| `n1mm`       | N1MM / DXLog UDP | `api` | 12060–12061 | UDP (+TCP), range               | N1MM Logger+ / DXLog contact broadcasts. Only 12060 is used |

The basic-auth gate covers every address of the `ui` binding, including LAN addresses. The username is always `admin`. The password comes from **Set Password**. Until one exists, the gate is off, but the critical task keeps the service from starting.

StartOS binds UDP only as port ranges of two or more ports, which is why each logging interface spans two ports. The second port of each range has no listener. The UDP ports are not behind the password gate: anyone who can reach them can inject decodes or contacts into the dashboard. Upstream listens on them with `udp4` on `0.0.0.0`, so senders must use IPv4.

## Installation and First-Run Flow

Install seeds `store.json` with defaults: imperial units, 24-hour clock, no callsign, no locator, no time zone, no accounts. Two tasks are raised (see [Tasks](#tasks)). The service cannot start until **Set Password** has run.

Upstream's first-run settings pop-up appears in the browser while no callsign or locator is set. Setting them through **Station Settings** suppresses it. Upstream's `.env` / `.env.example` auto-creation does not happen in this image (no `.env.example` ships in it), so all configuration comes from the environment.

## Actions

All three actions write `store.json` and nothing else. Each can run whether the service is running or stopped.

- **Set Password** (`set-password`; named **Reset Password** once a password exists). Run it at install (required) and whenever the password leaks or someone should lose access. Generates a 32-character password and returns the username `admin` and the password. The interface re-binds with the new credential immediately, without a restart, so every browser is asked again. Destructive on repeat: each run invalidates the previous password, and the action warns about this before running.
- **Station Settings** (`station-settings`). Run it at install and whenever the station moves or the operator changes. Sets `CALLSIGN`, `LOCATOR`, units, clock and `TZ`. Saving restarts OpenHamClock, which takes a few seconds; dashboards reconnect on their own. Safe to repeat.
- **Online Accounts** (`online-accounts`). Run it when the user wants callbook lookups (QRZ.com XML subscription, or free HamQTH) or Space-Track as the primary satellite source. Clearing both fields of an account removes it. Saving restarts OpenHamClock. Safe to repeat. The fields are prefilled, passwords masked.

## Tasks

The package raises two tasks, both from an init watcher that re-runs whenever `store.json` changes.

- **Set Password**, `critical`. Raised while `store.json` has no `uiPassword`. Blocks the service from starting, because without it the web interface would have no gate. Cleared by running **Set Password**. It returns only if the password is removed from `store.json` by hand.
- **Station Settings**, `important`. Raised while no callsign is stored. Non-blocking: the dashboard runs as `N0CALL` and shows upstream's setup pop-up. Cleared by saving **Station Settings**. It returns only if the callsign is removed from `store.json` by hand.

## Health Checks

The package has one health check.

- **Web Interface** (`openhamclock`). Passes when something listens on port 3000. Grace period 30 seconds. Startup usually takes under 10 seconds. A failure after the grace period means the Node process died or is crash-looping: check the service logs. Individual data feeds failing (NOAA, RBN, a DX cluster) do not fail this check. They show in the dashboard and in `/api/health`'s `subsystems`.

## Backups and Restore

The whole `main` volume is copied as files (`ofVolumes`); nothing is excluded, because every file on it is small JSON.

A restore brings back the password, station settings, account logins, synced dashboard layout, spot history and statistics. Nothing needs rebuilding: live data (spots, space weather, satellites) is fetched again on start. Layouts kept in a browser's own storage, from before settings sync, are not on the server and are not backed up.

## Limitations and Differences

1. **The dashboard is behind a StartOS password.** Upstream has no login. Anyone with the password can view the dashboard and change its shared settings; there is no read-only viewer role.
2. **Settings sync is forced on.** Upstream defaults to per-browser settings. Here every screen shares one layout. `API_WRITE_KEY` is not set, because upstream's web UI never sends it and setting it would break saving settings from the dashboard. The password gate protects writes instead.
3. **Auto-update is forced off.** StartOS updates the service by replacing the package.
4. **Upstream's downloadable WSJT-X relay and Rig Listener agents are untested behind the password gate.** They post to the server over HTTP and would need to pass basic auth. The WSJT-X UDP interface is the supported way to feed WSJT-X data.
5. **Rig Bridge (rig control, rotators, TNCs) is not included.** It runs on the computer attached to the radio, not on the server.
6. **`OPENWEATHER_API_KEY` is not offered.** In the prebuilt image the weather and cloud panels read the key from the browser, not the server: enter it in the dashboard's own settings. `WINLINK_API_KEY` is not offered either; upstream documents it for cloud deployments only.
7. **The extra port in each UDP range does nothing.** StartOS requires ranges of at least two ports.
8. **No HTTPS port.** Upstream's `HTTPS_PORT` self-signed LAN certificate is unused; StartOS provides TLS on its own addresses.

---

## Quick Reference for AI Consumers

```yaml
package_id: openhamclock
image: ghcr.io/accius/openhamclock
architectures: [x86_64, aarch64]
subcontainers: [openhamclock-sub]
volumes:
  main: /data
  main/app-data: /app/data
file_models:
  - store.json
startos_managed_env_vars:
  - PORT
  - TRUST_PROXY
  - SETTINGS_SYNC
  - AUTO_UPDATE_ENABLED
  - WSJTX_ENABLED
  - WSJTX_UDP_PORT
  - N1MM_UDP_ENABLED
  - N1MM_UDP_PORT
  - UNITS
  - DISTUNITS
  - TEMPUNITS
  - PRESSUNITS
  - TIME_FORMAT
  - CALLSIGN
  - LOCATOR
  - TZ
  - QRZ_USERNAME
  - QRZ_PASSWORD
  - HAMQTH_USERNAME
  - HAMQTH_PASSWORD
  - SPACE_TRACK_USERNAME
  - SPACE_TRACK_PASSWORD
dependencies: none
interfaces:
  ui: { type: ui, port: 3000 }
  wsjtx: { type: api, port: 2237, port_range: 2 }
  n1mm: { type: api, port: 12060, port_range: 2 }
actions:
  - set-password
  - station-settings
  - online-accounts
tasks:
  - { action: set-password, severity: critical }
  - { action: station-settings, severity: important }
health_checks:
  - openhamclock
```
