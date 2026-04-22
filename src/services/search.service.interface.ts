
import type { SearchEventInput, SearchEventResult, } from "../search/event.search.repository.interface.js";

export interface ISearchService {
    searchEvents(input: SearchEventInput) : Promise<SearchEventResult>;
}
