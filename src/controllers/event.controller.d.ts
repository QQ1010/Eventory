import { Request, Response } from "express";
import { IEventService } from "../services/event.service.interface.js";
import type { EventType } from "../models/event.model.js";
import { IIngestEventService } from "../services/ingest-event.service.interface.js";
import { ISearchService } from "../services/search.service.interface.js";
import { IAnalyticsService } from "../services/analytics.service.interface.js";
export declare const validEventTypes: EventType[];
type GetEventByIdParams = {
    id: string;
};
export declare class EventController {
    private readonly ingestEventService;
    private readonly eventService;
    private readonly searchService;
    private readonly analyticsService;
    constructor(eventService: IEventService, ingestEventService: IIngestEventService, searchService: ISearchService, analyticsService: IAnalyticsService);
    createEvent(req: Request, res: Response): Promise<void>;
    getEventById(req: Request<GetEventByIdParams>, res: Response): Promise<void>;
    getEvents(req: Request, res: Response): Promise<void>;
    searchEvents(req: Request, res: Response): Promise<void>;
    getAnalytics(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=event.controller.d.ts.map