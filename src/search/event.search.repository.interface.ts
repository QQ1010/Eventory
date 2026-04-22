/*
ensureIndex() : ensure events_v1 index exists
indexEvent(event) : index event document
*/

import { Event } from "../models/event.model.js";

export type SearchEventInput = {
    keyword? : string;
    tags?: string[];
    type?: string;
    from?: Date;
    to?: Date;
};

export type SearchEventResult = {
    items: Event[];
    total: number;
};

export type ElasticsearchEventDocument = {
    id: string;
    userId: string;
    type: string;
    title: string;
    content: string;
    tags: string[];
    source: string;
    occurredAt: string;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, unknown>;
};

export interface IEventSearchRepository {
    ensureIndex(): Promise<void>;
    indexEvent(event: Event): Promise<void>;
    searchEvents(input: SearchEventInput): Promise<SearchEventResult>;
}