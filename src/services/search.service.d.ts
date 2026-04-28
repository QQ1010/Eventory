import { ISearchService } from "./search.service.interface.js";
import { IEventSearchRepository, SearchEventInput, SearchEventResult } from "../search/event.search.repository.interface.js";
export declare class SearchService implements ISearchService {
    private readonly searchRepository;
    constructor(searchRepository: IEventSearchRepository);
    searchEvents(input: SearchEventInput): Promise<SearchEventResult>;
    private normalizeTags;
}
//# sourceMappingURL=search.service.d.ts.map