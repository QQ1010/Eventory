import { Event } from "../models/event.model.js";

export interface IEventRepository {
    create(event: Event): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    findMany(): Promise<Event[]>;
}