import type { CreateEventInput } from "../models/event.model.js";
import type { IEventQueue, IngestEventResult } from "../queues/event.queue.interface.js";
import type { IIngestEventService } from "./ingest-event.service.interface.js";
export declare class IngestEventService implements IIngestEventService {
    private readonly eventQueue;
    constructor(eventQueue: IEventQueue);
    ingestEvent(input: CreateEventInput): Promise<IngestEventResult>;
}
//# sourceMappingURL=ingest-event.service.d.ts.map