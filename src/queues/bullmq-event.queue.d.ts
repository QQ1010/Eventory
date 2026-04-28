import { IEventQueue, IngestEventResult } from "../queues/event.queue.interface.js";
import { CreateEventInput } from '../models/event.model.js';
export declare class BullMQEventQueue implements IEventQueue {
    private readonly queue;
    constructor();
    enqueueEvent(input: CreateEventInput): Promise<IngestEventResult>;
}
//# sourceMappingURL=bullmq-event.queue.d.ts.map