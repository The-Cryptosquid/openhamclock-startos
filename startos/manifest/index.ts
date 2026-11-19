import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openhamclock',
  title: 'OpenHamClock',
  license: 'MIT',
  packageRepo: 'https://github.com/The-Cryptosquid/openhamclock-startos',
  upstreamRepo: 'https://github.com/accius/openhamclock',
  marketingUrl: 'https://openhamclock.com',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    openhamclock: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
