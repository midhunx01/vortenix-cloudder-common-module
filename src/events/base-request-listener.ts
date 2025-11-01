// events/base-request-listener.ts
import { NatsConnection, StringCodec, SubscriptionOptions } from "nats";
import { logger } from "../util/logger/index.js";
import { RequestEvent } from "./request-event.js";

export abstract class RequestListener<T extends RequestEvent> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  protected client: NatsConnection;
  private sc = StringCodec();

  constructor(client: NatsConnection) {
    this.client = client;
  }

  abstract onRequest(data: T["request"]): Promise<T["response"]>;

  async listen() {
    const opts: SubscriptionOptions = { queue: this.queueGroupName };
    const sub = this.client.subscribe(this.subject, opts);

    logger.info(
      `Listening for RPC requests on subject [${this.subject}] in queue [${this.queueGroupName}]`
    );

    for await (const msg of sub) {
      try {
        const data = JSON.parse(this.sc.decode(msg.data));
        const response = await this.onRequest(data);
        msg.respond(this.sc.encode(JSON.stringify(response)));
      } catch (err) {
        logger.error(
          `Failed to process RPC [${this.subject}]: ${(err as Error).message}`
        );
        msg.respond(
          this.sc.encode(JSON.stringify({ error: (err as Error).message }))
        );
      }
    }
  }
}
