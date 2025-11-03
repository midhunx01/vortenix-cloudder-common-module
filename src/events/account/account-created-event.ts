import { Subjects } from "../base/subjects.js";

export interface AccountCreatedEvent {
  subject: Subjects.AccountCreated;
  data: {
    id: string;
    fullname: string;
    role: string;
    email: string;
    password: string;
  };
}
