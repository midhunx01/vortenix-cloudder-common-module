import { NatsConnection, StringCodec } from "nats";
import { logger } from "../util/logger/index.js";
import { Event } from "./base-event.js";

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  protected client: NatsConnection;
  private sc = StringCodec();

  constructor(client: NatsConnection) {
    this.client = client;
  }

  async publish(data: T["data"]): Promise<void> {
    const encoded = this.sc.encode(JSON.stringify(data));

    this.client.publish(this.subject, encoded);
    await this.client.flush();

    logger.info(
      `Event published to [${this.subject}]: ${JSON.stringify(data)}`
    );
  }
}
