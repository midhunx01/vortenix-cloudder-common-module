import { RequestEvent } from "../base/request-event.js";
import { Subjects } from "../base/subjects.js";

export interface ManagerCreateRequestEvent extends RequestEvent {
  subject: Subjects.UserCreateManager;
  request: {
    fullname: string;
    email: string;
    role: string;
    contactNumber?: string;
  };
  response: {
    id?: string;
    email?: string;
    role?: string;
    password?: string | null;
    error?: string;
  };
}
