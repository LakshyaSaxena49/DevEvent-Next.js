import { initPostHog, posthog } from './lib/posthog'

initPostHog()

export function onRouterTransitionStart(url: string, navigationType: 'push' | 'replace' | 'traverse') {
  void navigationType
  posthog.capture('$pageview', { $current_url: url })
}

