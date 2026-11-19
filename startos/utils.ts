import type { Keys, Station } from './fileModels/store.json'

// OpenHamClock's web server.
export const uiPort = 3000

// UDP listeners for logging software on the LAN. StartOS exposes UDP only as
// port ranges of two or more, so each is bound as a two-port range starting here.
export const wsjtxPort = 2237
export const n1mmPort = 12060

// Username for the StartOS proxy's basic-auth gate on the web UI.
export const uiUsername = 'admin'

// Everything the volume holds is under /data in the container. The image's
// symlinks (Dockerfile) point /app/config.json and the QRZ/HamQTH credential
// files here too.
export const dataMountpoint = '/data'
// OpenHamClock also reads and writes /app/data (Meshtastic settings, an
// optional satellites.json override).
export const appDataSubpath = 'app-data'

const set = (
  env: Record<string, string>,
  key: string,
  value: string | null,
) => {
  if (value) env[key] = value
}

// Environment for the OpenHamClock daemon. Values the user has not set are left
// out, so upstream's own defaults apply.
export function buildEnv(station: Station, keys: Keys): Record<string, string> {
  const env: Record<string, string> = {
    PORT: String(uiPort),
    // StartOS's proxy is the only client of the web port; trust its
    // X-Forwarded-For so rate limits apply per viewer, not to the proxy.
    TRUST_PROXY: 'true',
    // One layout for every screen, stored on the volume (and so backed up).
    SETTINGS_SYNC: 'true',
    // StartOS replaces the image to update; the app must never update itself.
    AUTO_UPDATE_ENABLED: 'false',
    WSJTX_ENABLED: 'true',
    WSJTX_UDP_PORT: String(wsjtxPort),
    N1MM_UDP_ENABLED: 'true',
    N1MM_UDP_PORT: String(n1mmPort),
    UNITS: station.units,
    DISTUNITS: station.units,
    TEMPUNITS: station.units,
    PRESSUNITS: station.units,
    TIME_FORMAT: station.timeFormat,
  }
  set(env, 'CALLSIGN', station.callsign?.toUpperCase() ?? null)
  set(env, 'LOCATOR', station.locator)
  set(env, 'TZ', station.timezone)

  if (keys.qrzUsername && keys.qrzPassword) {
    env.QRZ_USERNAME = keys.qrzUsername
    env.QRZ_PASSWORD = keys.qrzPassword
  }
  if (keys.hamqthUsername && keys.hamqthPassword) {
    env.HAMQTH_USERNAME = keys.hamqthUsername
    env.HAMQTH_PASSWORD = keys.hamqthPassword
  }
  if (keys.spaceTrackUsername && keys.spaceTrackPassword) {
    env.SPACE_TRACK_USERNAME = keys.spaceTrackUsername
    env.SPACE_TRACK_PASSWORD = keys.spaceTrackPassword
  }
  return env
}
