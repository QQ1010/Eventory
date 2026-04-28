import { EventsPerDayItem, TopTagItem } from "../repositories/event.repository.interface.js";
export type GetAnalyticsInput = {
    userId: string;
    from?: Date;
    to?: Date;
};
export type GetAnalyticsResult = {
    userId: string;
    eventsPerDay: EventsPerDayItem[];
    topTagItem: TopTagItem[];
};
export interface IAnalyticsService {
    getAnalytics(input: GetAnalyticsInput): Promise<GetAnalyticsResult>;
}
//# sourceMappingURL=analytics.service.interface.d.ts.map