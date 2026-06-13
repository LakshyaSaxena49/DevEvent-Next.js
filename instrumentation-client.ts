import { initPostHog, posthog } from './lib/posthog'

initPostHog()

export function onRouterTransitionStart(url: string, _navigationType: 'push' | 'replace' | 'traverse') {
  posthog.capture('$pageview', { $current_url: url })
}

