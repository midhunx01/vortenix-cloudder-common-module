import { RequestEvent } from "./request-event.js";
import { Subjects } from "./subjects.js";

export interface ManagerCreateRequestEvent extends RequestEvent {
  subject: Subjects.UserCreateManager;
  request: {
    fullname: string;
    email: string;
    contactNumber: string;
  };
  response: {
    id?: string;
    email?: string;
    password?: string | null;
    error?: string;
  };
}
