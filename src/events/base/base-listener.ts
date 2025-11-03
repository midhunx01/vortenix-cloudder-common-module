import {
  AckPolicy,
  JetStreamClient,
  JetStreamManager,
  JsMsg,
  NatsConnection,
  StorageType,
  ConsumerConfig,
  DeliverPolicy,
} from "nats";
import { Subjects } from "./subjects.js";
import { logger } from "../../util/logger/index.js";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: JsMsg): void;

  protected client: JetStreamClient;
  protected manager!: JetStreamManager;
  protected ackWait = 30_000_000_000; // 30 seconds in nanoseconds

  constructor(protected nc: NatsConnection) {
    this.client = nc.jetstream();
  }

  async init() {
    this.manager = await this.nc.jetstreamManager();
  }

  subscriptionOptions(): Partial<ConsumerConfig> {
    return {
      durable_name: this.queueGroupName,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      ack_wait: this.ackWait,
      max_ack_pending: 100,
      max_deliver: 5,
    };
  }

  async listen() {
    if (!this.manager) await this.init();

    const streamName = `STREAM_${this.subject}`;
    const durableName = this.queueGroupName;

    // Ensure the stream exists
    try {
      await this.manager.streams.info(streamName);
    } catch {
      logger.info(`Creating stream: ${streamName}`);
      await this.manager.streams.add({
        name: streamName,
        subjects: [this.subject],
        storage: StorageType.File,
      });
    }

    // Ensure the consumer (durable queue group) exists
    try {
      await this.manager.consumers.info(streamName, durableName);
    } catch {
      logger.info(`Creating durable consumer: ${durableName}`);
      await this.manager.consumers.add(streamName, this.subscriptionOptions());
    }

    logger.info(
      `Listening for subject "${this.subject}" with queue group "${durableName}"`
    );

    const consumer = await this.client.consumers.get(streamName, durableName);

    // Use next() in a loop - simplest and works reliably
    while (true) {
      try {
        const msg = await consumer.next({ expires: 30000 });
        if (msg) {
          const parsedData = this.parseMessage(msg);
          this.onMessage(parsedData, msg);
        }
      } catch (err: any) {
        // Handle timeout or other errors
        if (err.code !== "408") {
          // 408 is timeout, which is normal
          logger.info("Error getting message:", err);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }

  private parseMessage(msg: JsMsg) {
    const data = msg.data;
    return JSON.parse(new TextDecoder().decode(data));
  }
}
