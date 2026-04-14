import { CreateEventInput } from "../models/event.model.js";

export interface IEventService {
    createEvent(input: CreateEventInput): Promise<Event>;
    getEventById(id: string): Promise<Event | null>;
    getEvents(): Promise<Event[]>;
}