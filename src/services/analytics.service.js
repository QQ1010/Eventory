export class AnalyticsService {
    eventRepository;
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async getAnalytics(input) {
        if (!input.userId.trim()) {
            throw new Error("userId is required");
        }
        if (input.from && input.to && input.from > input.to) {
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
//# sourceMappingURL=analytics.service.js.map