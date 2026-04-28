import { Event, CreateEventInput } from "../models/event.model.js";
import { IEventRepository } from "../repositories/event.repository.interface.js";
import { IEventService } from "./event.service.interface.js";
export declare class EventService implements IEventService {
    private readonly eventRepository;
    constructor(eventRepository: IEventRepository);
    createEvent(input: CreateEventInput): Promise<Event>;
    getEventById(id: string): Promise<Event | null>;
    getEvents(): Promise<Event[]>;
    private normalizeTags;
}
//# sourceMappingURL=event.service.d.ts.map