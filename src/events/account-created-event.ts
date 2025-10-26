import { Subjects } from "./subjects.js";

export interface AccountCreatedEvent {
  subject: Subjects.AccountCreated;
  data: {
    id: string;
    fullname: string;
    email: string;
    password: string;
  };
}
