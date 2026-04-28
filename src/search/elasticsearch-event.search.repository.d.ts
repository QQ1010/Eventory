import type { IEventSearchRepository, SearchEventInput, SearchEventResult } from "./event.search.repository.interface.js";
import { Event } from "../models/event.model.js";
export declare class ElasticsearchEventSearchRepository implements IEventSearchRepository {
    ensureIndex(): Promise<void>;
    indexEvent(event: Event): Promise<void>;
    searchEvents(input: SearchEventInput): Promise<SearchEventResult>;
    private buildSearchQuery;
    private toElasticsearchDocument;
    private toEvent;
}
//# sourceMappingURL=elasticsearch-event.search.repository.d.ts.map