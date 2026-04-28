import { Db } from "mongodb";
import { Event } from "../models/event.model.js";
import { IEventRepository, EventsPerDayItem, TopTagItem } from "./event.repository.interface.js";
export declare class MongodbEventRepository implements IEventRepository {
    private collection;
    constructor(db: Db);
    create(event: Event): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    findMany(): Promise<Event[]>;
    countEventsPerDay(userId: string, from?: Date, to?: Date): Promise<EventsPerDayItem[]>;
    getTopTags(userId: string, from?: Date, to?: Date, limit?: number): Promise<TopTagItem[]>;
}
//# sourceMappingURL=mongo-event.repository.d.ts.map