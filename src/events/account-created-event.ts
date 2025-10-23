import { Subjects } from "./subjects";

export interface AccountCreatedEvent {
  subject: Subjects.AccountCreated;
  data: {
    id: string;
    email: string;
    password: string;
  };
}
