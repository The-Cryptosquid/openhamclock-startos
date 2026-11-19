import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const text = (name: string, description: string | null, masked: boolean) =>
  Value.text({
    name,
    description,
    required: false,
    default: null,
    masked,
    maxLength: 256,
  })

const inputSpec = InputSpec.of({
  qrzUsername: text(
    i18n('QRZ.com Username'),
    i18n(
      'Callbook login for richer callsign lookups (name, location, more). Needs both username and password.',
    ),
    false,
  ),
  qrzPassword: text(i18n('QRZ.com Password'), null, true),
  hamqthUsername: text(
    i18n('HamQTH Username'),
    i18n(
      'A free alternative callbook for callsign lookups. Needs both username and password.',
    ),
    false,
  ),
  hamqthPassword: text(i18n('HamQTH Password'), null, true),
  spaceTrackUsername: text(
    i18n('Space-Track Username'),
    i18n(
      'Optional account at space-track.org. When set, Space-Track becomes the main source of satellite orbit data.',
    ),
    false,
  ),
  spaceTrackPassword: text(i18n('Space-Track Password'), null, true),
})

export const onlineAccounts = sdk.Action.withInput(
  'online-accounts',
  {
    name: i18n('Online Accounts'),
    description: i18n(
      'Optional logins for callsign lookups (QRZ.com, HamQTH) and satellite data (Space-Track). Leave both fields of an account empty to stop using it. Saving restarts OpenHamClock if it is running.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,

  async ({ effects }) => (await storeJson.read((s) => s.keys).once()) ?? null,

  async ({ effects, input }) => {
    const clean = (v: string | null | undefined) => v?.trim() || null
    await storeJson.merge(effects, {
      keys: {
        qrzUsername: clean(input.qrzUsername),
        qrzPassword: clean(input.qrzPassword),
        hamqthUsername: clean(input.hamqthUsername),
        hamqthPassword: clean(input.hamqthPassword),
        spaceTrackUsername: clean(input.spaceTrackUsername),
        spaceTrackPassword: clean(input.spaceTrackPassword),
      },
    })
    return null
  },
)
