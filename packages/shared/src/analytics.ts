// Stub analytics interface per AGENTS.md §2 [DECISION NEEDED]
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface AnalyticsClient {
  track(event: AnalyticsEvent): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}

class StubAnalyticsClient implements AnalyticsClient {
  track(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Stub]', event);
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Stub Identify]', userId, traits);
    }
  }
}

export const analytics: AnalyticsClient = new StubAnalyticsClient();
