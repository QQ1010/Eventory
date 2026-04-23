import { Event } from "../models/event.model.js";

export type EventsPerDayItem = {
  date: string;
  count: number;
};

export type TopTagItem = {
  tag: string;
  count: number;
};


export interface IEventRepository {
    create(event: Event): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    findMany(): Promise<Event[]>;
    countEventsPerDay(userId: string, from?: Date, to?: Date): Promise<EventsPerDayItem[]>
    getTopTags(userId: string, from?: Date, to?: Date, limit?: number): Promise<TopTagItem[]>;
}