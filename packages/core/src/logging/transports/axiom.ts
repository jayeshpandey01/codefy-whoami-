import type {
  AxiomTransportConfig,
  ILogTransport,
  LogEvent,
} from "@whoami/types";

export class AxiomTransport implements ILogTransport {
  public readonly name = "axiom";
  private config: Required<Omit<AxiomTransportConfig, "fetchFn">> & {
    fetchFn?: AxiomTransportConfig["fetchFn"];
  };
  private queue: LogEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  constructor(config: AxiomTransportConfig) {
    if (!config.apiToken || !config.dataset) {
      throw new Error("[AxiomTransport] apiToken and dataset are required");
    }

    const defaultIngestUrl = `https://api.axiom.co/v1/datasets/${config.dataset}/ingest`;

    this.config = {
      apiToken: config.apiToken,
      dataset: config.dataset,
      ingestUrl: config.ingestUrl || defaultIngestUrl,
      batchSize: config.batchSize ?? 25,
      flushIntervalMs: config.flushIntervalMs ?? 1000,
      maxRetries: config.maxRetries ?? 3,
      fetchFn: config.fetchFn,
    };

    this.startTimer();
  }

  private startTimer(): void {
    if (this.config.flushIntervalMs > 0 && typeof setInterval !== "undefined") {
      this.timer = setInterval(() => {
        void this.flush();
      }, this.config.flushIntervalMs);

      // In Node environment, unref timer so it doesn't hold open process
      const t = this.timer as unknown as { unref?: () => void };
      if (t && typeof t.unref === "function") {
        t.unref();
      }
    }
  }

  send(events: LogEvent[]): void {
    this.queue.push(...events);
    if (this.queue.length >= this.config.batchSize) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const batch = this.queue.splice(0, this.config.batchSize);

    // Format events according to Axiom ingestion schema (compatible with next-axiom)
    const payload = batch.map((event) => ({
      _time: event.timestamp,
      level: event.level,
      message: event.message,
      fields: event.fields,
      source: event.source,
      platform: event.platform,
      error: event.error,
      "@app": {
        name: "whoami",
        version: event.platform.appVersion,
      },
    }));

    try {
      await this.dispatchWithRetry(payload);
      // Schedule a follow-on flush if more events arrived while this batch was in-flight.
      if (this.queue.length >= this.config.batchSize) {
        void this.flush();
      }
    } catch (err) {
      // RELIABILITY: Do NOT re-queue the batch on permanent failure and do NOT
      // trigger another flush from `finally`. Re-queuing when dispatchWithRetry
      // has already exhausted all retries causes an infinite loop: re-added
      // events keep queue.length >= batchSize, so the finally-block flush
      // fires again immediately, forever. Failed events are dropped instead.
      console.error("[AxiomTransport] Failed to send logs to Axiom (batch dropped):", err);
    } finally {
      this.isFlushing = false;
    }
  }

  private async dispatchWithRetry(
    payload: Record<string, unknown>[],
  ): Promise<void> {
    const fetchImpl =
      this.config.fetchFn || (typeof fetch !== "undefined" ? fetch : undefined);
    if (!fetchImpl) {
      throw new Error(
        "[AxiomTransport] No fetch implementation available in current environment",
      );
    }

    let attempt = 0;
    let delay = 100;

    while (attempt < this.config.maxRetries) {
      try {
        const response = await fetchImpl(this.config.ingestUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
            "Content-Type": "application/json",
            "User-Agent": `whoami-logger/${this.config.dataset}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok || (response.status >= 200 && response.status < 300)) {
          return;
        }

        // Retry on 429 (rate limit) or 5xx server errors
        if (response.status === 429 || response.status >= 500) {
          attempt++;
          if (attempt >= this.config.maxRetries) {
            throw new Error(`Axiom HTTP error status: ${response.status}`);
          }
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
          continue;
        }

        // 4xx client errors (non-429) shouldn't be retried
        throw new Error(
          `Axiom ingest rejected with status: ${response.status}`,
        );
      } catch (err: unknown) {
        attempt++;
        if (attempt >= this.config.maxRetries) {
          throw err;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  }

  async close(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.flush();
  }
}
