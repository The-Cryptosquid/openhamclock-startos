import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { appDataSubpath, buildEnv, dataMountpoint, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OpenHamClock!'))

  // Read reactively: saving Station Settings or Online Accounts restarts the service
  // with the new environment.
  const station = await storeJson.read((s) => s.station).const(effects)
  const keys = await storeJson.read((s) => s.keys).const(effects)
  if (!station || !keys) {
    throw new Error(i18n('The package settings file is missing.'))
  }

  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'openhamclock' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: dataMountpoint,
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: appDataSubpath,
        mountpoint: '/app/data',
        readonly: false,
      }),
    'openhamclock-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('openhamclock', {
    subcontainer: sub,
    exec: {
      command: sdk.useEntrypoint(),
      env: buildEnv(station, keys),
    },
    ready: {
      display: i18n('Web Interface'),
      gracePeriod: 30_000,
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
