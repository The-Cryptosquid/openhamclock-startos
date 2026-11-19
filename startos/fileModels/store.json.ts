import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const optionalString = z.string().nullable().catch(null)

const stationShape = z
  .looseObject({
    callsign: optionalString,
    locator: optionalString,
    units: z.enum(['imperial', 'metric']).catch('imperial'),
    timeFormat: z.enum(['12', '24']).catch('24'),
    timezone: optionalString,
  })
  .catch({
    callsign: null,
    locator: null,
    units: 'imperial',
    timeFormat: '24',
    timezone: null,
  })

const keysShape = z
  .looseObject({
    qrzUsername: optionalString,
    qrzPassword: optionalString,
    hamqthUsername: optionalString,
    hamqthPassword: optionalString,
    spaceTrackUsername: optionalString,
    spaceTrackPassword: optionalString,
  })
  .catch({
    qrzUsername: null,
    qrzPassword: null,
    hamqthUsername: null,
    hamqthPassword: null,
    spaceTrackUsername: null,
    spaceTrackPassword: null,
  })

const shape = z.looseObject({
  // Credential for the reverse-proxy auth gate on the web UI (interfaces.ts).
  uiPassword: z.string().optional().catch(undefined),
  // Passed to OpenHamClock as environment variables (utils.ts, main.ts).
  station: stationShape,
  keys: keysShape,
})

export type Station = z.infer<typeof stationShape>
export type Keys = z.infer<typeof keysShape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
