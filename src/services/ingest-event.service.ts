/*
收到 CreateEventInput
呼叫 IEventQueue.enqueueEvent(input)
回傳 { jobId }
*/

import type { CreateEventInput } from "../models/event.model.js";
import type { IEventQueue, IngestEventResult } from "../queues/event.queue.interface.js";
import type { IIngestEventService } from "./ingest-event.service.interface.js";

export class IngestEventService implements IIngestEventService {
    private readonly eventQueue: IEventQueue;

    constructor(eventQueue: IEventQueue) {
        this.eventQueue = eventQueue;
    }

    async ingestEvent(input: CreateEventInput): Promise<IngestEventResult> {
        const job = await this.eventQueue.enqueueEvent(input);
        return job;
    }
}