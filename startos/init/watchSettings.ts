import { setPassword } from '../actions/setPassword'
import { stationSettings } from '../actions/stationSettings'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchSettings = sdk.setupOnInit(async (effects) => {
  // Critical, so the service cannot start before the proxy gate in
  // interfaces.ts has a credential; setting one retracts the task.
  if (!(await storeJson.read((s) => s.uiPassword).const(effects))) {
    await sdk.action.createOwnTask(effects, setPassword, 'critical', {
      reason: i18n(
        'OpenHamClock has no login of its own. Set a password before starting it.',
      ),
    })
  }

  // Without a callsign the dashboard runs as N0CALL and shows its own setup
  // pop-up on every screen.
  if (!(await storeJson.read((s) => s.station.callsign).const(effects))) {
    await sdk.action.createOwnTask(effects, stationSettings, 'important', {
      reason: i18n('Enter your callsign and grid square.'),
    })
  }
})
