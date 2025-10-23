import { JetStreamClient, NatsConnection } from "nats";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];

  private client: JetStreamClient;

  constructor(nc: NatsConnection) {
    this.client = nc.jetstream();
  }

  async publish(data: T["data"]): Promise<void> {
    try {
      const ack = await this.client.publish(this.subject, JSON.stringify(data));
      console.log("Event published to subject", this.subject);
      console.log("Sequence:", ack.seq, "Stream:", ack.stream);
    } catch (err) {
      console.error("Failed to publish:", err);
      throw err;
    }
  }
}
