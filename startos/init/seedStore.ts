import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// Writes store.json with its defaults, so main.ts always has a station and a
// keys object to read.
export const seedStore = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await storeJson.merge(effects, {})
})
