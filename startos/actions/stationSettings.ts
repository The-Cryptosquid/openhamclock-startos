import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  callsign: Value.text({
    name: i18n('Callsign'),
    description: i18n(
      'Your amateur radio callsign. Used on the dashboard and to log in to DX cluster servers.',
    ),
    required: true,
    default: null,
    maxLength: 15,
    patterns: [
      {
        regex: '^[A-Za-z0-9/]{3,15}$',
        description: i18n('Letters, digits and "/" only'),
      },
    ],
  }),
  locator: Value.text({
    name: i18n('Grid Square'),
    description: i18n(
      'Your Maidenhead locator, 4 or 6 characters (for example FN31 or FN31pr). Sets your position on the map and for propagation predictions.',
    ),
    required: true,
    default: null,
    maxLength: 6,
    patterns: [
      {
        regex: '^[A-Ra-r]{2}[0-9]{2}([A-Xa-x]{2})?$',
        description: i18n('A 4- or 6-character Maidenhead locator'),
      },
    ],
  }),
  units: Value.select({
    name: i18n('Units'),
    default: 'imperial',
    values: {
      imperial: i18n('Imperial (miles, °F)'),
      metric: i18n('Metric (km, °C)'),
    },
  }),
  timeFormat: Value.select({
    name: i18n('Clock'),
    default: '24',
    values: {
      '24': i18n('24-hour'),
      '12': i18n('12-hour'),
    },
  }),
  timezone: Value.text({
    name: i18n('Time Zone'),
    description: i18n(
      'Your local time zone as a tz database name, for example America/New_York or Europe/Berlin. Leave empty for UTC.',
    ),
    required: false,
    default: null,
    maxLength: 64,
    patterns: [
      {
        regex: '^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$',
        description: i18n('A tz database name, such as Europe/London'),
      },
    ],
  }),
})

export const stationSettings = sdk.Action.withInput(
  'station-settings',
  {
    name: i18n('Station Settings'),
    description: i18n(
      'Set your callsign, grid square, units, clock format and time zone. Saving restarts OpenHamClock if it is running.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,

  async ({ effects }) => {
    const station = await storeJson.read((s) => s.station).once()
    if (!station) return null
    return {
      callsign: station.callsign ?? undefined,
      locator: station.locator ?? undefined,
      units: station.units,
      timeFormat: station.timeFormat,
      timezone: station.timezone,
    }
  },

  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      station: {
        callsign: input.callsign.trim().toUpperCase(),
        locator: input.locator.trim(),
        units: input.units,
        timeFormat: input.timeFormat,
        timezone: input.timezone?.trim() || null,
      },
    })
    return null
  },
)
