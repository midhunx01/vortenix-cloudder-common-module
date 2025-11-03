import { Subjects } from "./subjects.js";

export interface RequestEvent {
  subject: Subjects;
  request: any;
  response: any;
}
