import { IAnalyticsService, GetAnalyticsInput, GetAnalyticsResult } from "./analytics.service.interface.js";
import { IEventRepository } from "../repositories/event.repository.interface.js";
export declare class AnalyticsService implements IAnalyticsService {
    private readonly eventRepository;
    constructor(eventRepository: IEventRepository);
    getAnalytics(input: GetAnalyticsInput): Promise<GetAnalyticsResult>;
}
//# sourceMappingURL=analytics.service.d.ts.map