import { NatsConnection, StringCodec } from "nats";
import { RequestEvent } from "./request-event.js";
import { logger } from "../../util/logger/index.js";

export abstract class RequestPublisher<T extends RequestEvent> {
  abstract subject: T["subject"];
  protected client: NatsConnection;
  private sc = StringCodec();

  constructor(client: NatsConnection) {
    this.client = client;
  }

  async send(data: T["request"], timeout = 5000): Promise<T["response"]> {
    const encoded = this.sc.encode(JSON.stringify(data));

    try {
      const msg = await this.client.request(this.subject, encoded, { timeout });
      const response = JSON.parse(this.sc.decode(msg.data));
      logger.info(`RPC response received for [${this.subject}]`);
      return response;
    } catch (err) {
      logger.error(
        `RPC request to [${this.subject}] failed: ${(err as Error).message}`
      );
      throw err;
    }
  }
}
