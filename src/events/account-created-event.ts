import { Subjects } from "./subjects.js";

export interface AccountCreatedEvent {
  subject: Subjects.AccountCreated;
  data: {
    id: string;
    email: string;
    password: string;
  };
}
