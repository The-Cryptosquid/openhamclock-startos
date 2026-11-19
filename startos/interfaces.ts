import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { n1mmPort, uiPort, uiUsername, wsjtxPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // OpenHamClock has no login, and anyone who reaches it can change its shared
  // settings, so the StartOS proxy gates it with HTTP basic auth. Read
  // reactively so the gate follows the password the moment the action writes it.
  const password = await storeJson.read((s) => s.uiPassword).const(effects)

  const uiOrigin = await sdk.MultiHost.of(effects, 'ui').bindPort(uiPort, {
    protocol: 'http',
    // Unset only until the critical set-password task is done, and the service
    // cannot start before then.
    proxy: {
      auth: password
        ? {
            type: 'basic',
            credentials: [{ username: uiUsername, password }],
            realm: 'OpenHamClock',
          }
        : null,
    },
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web Interface'),
    id: 'ui',
    description: i18n(
      'The OpenHamClock dashboard. Your browser asks for the username and password set by the Set Password action.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    // Left null although the gate has a username: the SDK would fold it into
    // the address as admin@<host>, and Chromium refuses userinfo in a top-level
    // navigation. The browser still prompts for it.
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiOrigin.export([ui])

  // StartOS binds UDP only as a range of two or more ports (TCP and UDP
  // together), so each listener gets a two-port range; only the first port is
  // used.
  const wsjtxRange = await sdk.MultiHost.of(effects, 'wsjtx').bindPortRange({
    internalStartPort: wsjtxPort,
    externalStartPort: wsjtxPort,
    numberOfPorts: 2,
  })
  await wsjtxRange.export(
    sdk.createRangeInterface(effects, {
      id: 'wsjtx',
      name: i18n('WSJT-X UDP'),
      description: i18n(
        'Where WSJT-X or JTDX on your network sends decodes and status. Use the first port (2237) as the UDP server port in WSJT-X.',
      ),
    }),
  )

  const n1mmRange = await sdk.MultiHost.of(effects, 'n1mm').bindPortRange({
    internalStartPort: n1mmPort,
    externalStartPort: n1mmPort,
    numberOfPorts: 2,
  })
  await n1mmRange.export(
    sdk.createRangeInterface(effects, {
      id: 'n1mm',
      name: i18n('N1MM / DXLog UDP'),
      description: i18n(
        'Where N1MM Logger+ or DXLog on your network broadcasts logged contacts. Use the first port (12060).',
      ),
    }),
  )

  return [uiReceipt]
})
