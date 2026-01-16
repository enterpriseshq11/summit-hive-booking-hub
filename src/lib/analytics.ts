/**
 * Lightweight analytics utility for data-event tracking.
 * Events are logged to console in development and ready for external SDK integration.
 * 
 * Tracked Events (Coworking Launch):
 * - coworking_inquiry_submitted: Fires when any coworking inquiry form is submitted
 * - coworking_inquiry_emails_sent: Fires when email notifications are successfully dispatched
 * - coworking_inquiry_email_failed: Fires when email notification fails (for monitoring)
 * - hive_request_workspace_click: CTA click on coworking page
 * - hive_schedule_tour_click: Tour CTA click on coworking page
 */

type AnalyticsEvent = {
  event: string;
  timestamp: number;
  path: string;
  properties?: Record<string, unknown>;
};

const isDev = import.meta.env.DEV;

// Event queue for batching (future SDK integration)
const eventQueue: AnalyticsEvent[] = [];

/**
 * Track a custom event with optional properties
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  const event: AnalyticsEvent = {
    event: eventName,
    timestamp: Date.now(),
    path: window.location.pathname + window.location.hash,
    properties,
  };

  // Add to queue for potential batching
  eventQueue.push(event);

  if (isDev) {
    console.log('[Analytics]', event);
  }

  // Ready for external SDK integration:
  // window.gtag?.('event', eventName, { path: event.path, ...properties });
  // window.posthog?.capture(eventName, { ...event, ...properties });
}

/**
 * Initialize click tracking for all elements with data-event attributes.
 * Also listens for custom analytics:track events from hooks.
 * Call once on app mount.
 */
export function initDataEventTracking() {
  // Track click events on data-event elements
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

  // Listen for programmatic analytics events (from hooks, edge functions, etc.)
  window.addEventListener('analytics:track', ((e: CustomEvent<{ event: string; properties?: Record<string, unknown> }>) => {
    if (e.detail?.event) {
      trackEvent(e.detail.event, e.detail.properties);
    }
  }) as EventListener);

  if (isDev) {
    console.log('[Analytics] Data-event tracking initialized');
  }
}

/**
 * Get queued events (for debugging or batch sending)
 */
export function getEventQueue(): AnalyticsEvent[] {
  return [...eventQueue];
}

/**
 * Clear event queue after successful batch send
 */
export function clearEventQueue(): void {
  eventQueue.length = 0;
}
