/**
 * Lightweight analytics utility for data-event tracking.
 * Events are logged to console in development and ready for external SDK integration.
 */

type AnalyticsEvent = {
  event: string;
  timestamp: number;
  path: string;
  properties?: Record<string, unknown>;
};

const isDev = import.meta.env.DEV;

/**
 * Track a custom event with optional properties
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  const event: AnalyticsEvent = {
    event: eventName,
    timestamp: Date.now(),
    path: window.location.pathname,
    properties,
  };

  if (isDev) {
    console.log('[Analytics]', event);
  }

  // Ready for external SDK integration:
  // window.gtag?.('event', eventName, { path: event.path, ...properties });
  // window.posthog?.capture(eventName, { ...event, ...properties });
}

/**
 * Initialize click tracking for all elements with data-event attributes.
 * Call once on app mount.
 */
export function initDataEventTracking() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const eventElement = target.closest('[data-event]') as HTMLElement | null;
    
    if (eventElement) {
      const eventName = eventElement.getAttribute('data-event');
      if (eventName) {
        trackEvent(eventName, { element: eventElement.tagName?.toLowerCase() });
      }
    }
  }, { passive: true });

  if (isDev) {
    console.log('[Analytics] Data-event tracking initialized');
  }
}
