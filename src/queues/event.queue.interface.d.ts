import { CreateEventInput } from "../models/event.model.js";
export type IngestEventResult = {
    jobId: string;
};
export interface IEventQueue {
    enqueueEvent(input: CreateEventInput): Promise<IngestEventResult>;
}
//# sourceMappingURL=event.queue.interface.d.ts.map