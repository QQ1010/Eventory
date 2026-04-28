/*
event.service.ts
  - normalize tags
  - 設定 occurredAt / createdAt / updatedAt
  - 建立完整 Event object
  - 呼叫 repository
*/
import { Event } from "../models/event.model.js";
export class EventService {
    eventRepository;
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async createEvent(input) {
        if (!input.userId.trim()) {
            throw new Error("userId is required");
        }
        if (!input.title.trim()) {
            throw new Error("title is required");
        }
        if (!input.content.trim()) {
            throw new Error("content is required");
        }
        const now = new Date();
        const event = new Event({
            userId: input.userId.trim(),
            type: input.type,
            title: input.title.trim(),
            content: input.content.trim(),
            tags: this.normalizeTags(input.tags ?? []),
            source: "api",
            occurredAt: input.occurredAt ?? now,
            createdAt: now,
            updatedAt: now,
            metadata: input.metadata ?? {},
        });
        return this.eventRepository.create(event);
    }
    async getEventById(id) {
        return this.eventRepository.findById(id);
    }
    async getEvents() {
        return this.eventRepository.findMany();
    }
    normalizeTags(tags) {
        return [
            ...new Set(tags
                .map((tag) => tag.trim().toLowerCase())
                .filter((tag) => tag.length > 0)),
        ];
    }
}
//# sourceMappingURL=event.service.js.map