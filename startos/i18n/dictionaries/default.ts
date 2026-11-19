export const DEFAULT_LANG = 'en_US'

const dict = {
  // actions/onlineAccounts.ts
  'QRZ.com Username': 0,
  'Callbook login for richer callsign lookups (name, location, more). Needs both username and password.': 1,
  'QRZ.com Password': 2,
  'HamQTH Username': 3,
  'A free alternative callbook for callsign lookups. Needs both username and password.': 4,
  'HamQTH Password': 5,
  'Space-Track Username': 6,
  'Optional account at space-track.org. When set, Space-Track becomes the main source of satellite orbit data.': 7,
  'Space-Track Password': 8,
  'Online Accounts': 9,
  'Optional logins for callsign lookups (QRZ.com, HamQTH) and satellite data (Space-Track). Leave both fields of an account empty to stop using it. Saving restarts OpenHamClock if it is running.': 10,
  // actions/setPassword.ts
  'Reset Password': 11,
  'Set Password': 12,
  'Generate the password your browser asks for when you open OpenHamClock. The username is always "admin". Running this again replaces the existing password.': 13,
  'The current password stops working as soon as this runs.': 14,
  'Password Set': 15,
  'Your browser asks for these the next time you open OpenHamClock. Save the password now. It is not shown again.': 16,
  Username: 17,
  Password: 18,
  // actions/stationSettings.ts
  Callsign: 19,
  'Your amateur radio callsign. Used on the dashboard and to log in to DX cluster servers.': 20,
  'Letters, digits and "/" only': 21,
  'Grid Square': 22,
  'Your Maidenhead locator, 4 or 6 characters (for example FN31 or FN31pr). Sets your position on the map and for propagation predictions.': 23,
  'A 4- or 6-character Maidenhead locator': 24,
  Units: 25,
  'Imperial (miles, °F)': 26,
  'Metric (km, °C)': 27,
  Clock: 28,
  '24-hour': 29,
  '12-hour': 30,
  'Time Zone': 31,
  'Your local time zone as a tz database name, for example America/New_York or Europe/Berlin. Leave empty for UTC.': 32,
  'A tz database name, such as Europe/London': 33,
  'Station Settings': 34,
  'Set your callsign, grid square, units, clock format and time zone. Saving restarts OpenHamClock if it is running.': 35,
  // init/watchSettings.ts
  'OpenHamClock has no login of its own. Set a password before starting it.': 36,
  'Enter your callsign and grid square.': 37,
  // interfaces.ts
  'Web Interface': 38,
  'The OpenHamClock dashboard. Your browser asks for the username and password set by the Set Password action.': 39,
  'WSJT-X UDP': 40,
  'Where WSJT-X or JTDX on your network sends decodes and status. Use the first port (2237) as the UDP server port in WSJT-X.': 41,
  'N1MM / DXLog UDP': 42,
  'Where N1MM Logger+ or DXLog on your network broadcasts logged contacts. Use the first port (12060).': 43,
  // main.ts
  'Starting OpenHamClock!': 44,
  'The package settings file is missing.': 45,
  'The web interface is ready': 46,
  'The web interface is not ready': 47,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
