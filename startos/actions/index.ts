import { sdk } from '../sdk'
import { onlineAccounts } from './onlineAccounts'
import { setPassword } from './setPassword'
import { stationSettings } from './stationSettings'

export const actions = sdk.Actions.of()
  .addAction(setPassword)
  .addAction(stationSettings)
  .addAction(onlineAccounts)
