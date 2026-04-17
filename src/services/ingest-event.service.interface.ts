import { CreateEventInput } from "../models/event.model.js";
import { IngestEventResult } from "../queues/event.queue.interface.js";
export interface IIngestEventService {
    ingestEvent(input: CreateEventInput): Promise<IngestEventResult>;
}