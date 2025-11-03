import { Subjects } from "./subjects.js";

export interface Event {
  subject: Subjects;
  data: any;
}
