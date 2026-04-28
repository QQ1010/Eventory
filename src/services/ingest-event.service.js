/*
收到 CreateEventInput
呼叫 IEventQueue.enqueueEvent(input)
回傳 { jobId }
*/
export class IngestEventService {
    eventQueue;
    constructor(eventQueue) {
        this.eventQueue = eventQueue;
    }
    async ingestEvent(input) {
        const job = await this.eventQueue.enqueueEvent(input);
        return job;
    }
}
//# sourceMappingURL=ingest-event.service.js.map