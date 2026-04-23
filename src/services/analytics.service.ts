import { IAnalyticsService, GetAnalyticsInput, GetAnalyticsResult } from "./analytics.service.interface.js";
import { IEventRepository } from "../repositories/event.repository.interface.js";
export class AnalyticsService implements IAnalyticsService {
    private readonly eventRepository: IEventRepository;
    constructor(eventRepository: IEventRepository) {
        this.eventRepository = eventRepository;
    }

    async getAnalytics(input: GetAnalyticsInput): Promise<GetAnalyticsResult> {
        if(!input.userId.trim()) {
            throw new Error("userId is required");
        }

        if(input.from && input.to && input.from > input.to) {
            throw new Error("from date cannot be later than to date");
        }
        
        const limitation = 10;
        const [eventsPerDay, topTags] = await Promise.all([
            this.eventRepository.countEventsPerDay(input.userId, input.from, input.to),
            this.eventRepository.getTopTags(input.userId, input.from, input.to, limitation),
        ]);

        return {
            userId: input.userId,
            eventsPerDay: eventsPerDay,
            topTagItem: topTags,
        };
    }
}