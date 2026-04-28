import { elasticsearchClient } from "../config/elasticsearch.js";
import { EVENTS_INDEX_NAME } from "./search.constants.js";
import type { IEventSearchRepository, ElasticsearchEventDocument, SearchEventInput, SearchEventResult } from "./event.search.repository.interface.js";
import { Event } from "../models/event.model.js";

export class ElasticsearchEventSearchRepository implements IEventSearchRepository {
    public async ensureIndex(): Promise<void> {
        const indexCheck = await elasticsearchClient.indices.exists({
            index: EVENTS_INDEX_NAME,
        });
        console.log("Checking Elasticsearch index...");
        if(indexCheck) {
            return ;
        }
        await elasticsearchClient.indices.create({
            index: EVENTS_INDEX_NAME,
            mappings: {
                properties: {
                    id : { type: "keyword"},
                    userId: { type: "keyword"},
                    type: { type: "keyword"},
                    title: { type: "text"},
                    content: { type: "text"},
                    tags: { type: "keyword"},
                    source: { type: "keyword"},
                    occurredAt: { type: "date"},
                    createdAt: { type: "date"},
                    updatedAt: { type: "date"},
                    metadata: { type: "object"},
                }
            }
        });
    }

    public async indexEvent(event: Event): Promise<void> {
        if (!event.id) {
            throw new Error("Cannot index event without id");
        }

        const document = this.toElasticsearchDocument(event);
        
        await elasticsearchClient.index({
            index: EVENTS_INDEX_NAME,
            id: event.id,
            document,
        });
    }

    public async searchEvents(input: SearchEventInput): Promise<SearchEventResult> {
        const query = this.buildSearchQuery(input);
        const response = await elasticsearchClient.search<ElasticsearchEventDocument>({
            index: EVENTS_INDEX_NAME,
            query,
            sort: [
                {
                    occurredAt: "desc",
                },
            ],
        });

        const items = response.hits.hits
                                .map((hit) => hit._source)
                                .filter(
                                (document): document is ElasticsearchEventDocument =>
                                    document !== undefined,
                                )
                                .map((document) => this.toEvent(document));
        const total = typeof response.hits.total === "number"
                        ? response.hits.total
                        : response.hits.total?.value ?? 0;
        return {
            items,
            total
        };
    }

    private buildSearchQuery(input: SearchEventInput) {
        const must: any[] = [];
        const filter: any[] = [];

        if(input.keyword && input.keyword.trim().length > 0) {
            must.push({
                multi_match: {
                    query: input.keyword.trim(),
                    fields: ['title', 'content'],
                },
            });
        }
        if(input.tags && input.tags.length > 0) {
            filter.push({
                terms: {
                    tags: input.tags,
                },
            });
        }
        if(input.type) {
            filter.push({
                term: {
                    type: input.type,
                },
            });
        }
        if(input.from || input.to) {
            const range: Record<string, string> = {};
            if (input.from) {
                range.gte = input.from.toISOString();
            }
            if (input.to) {
                range.lte = input.to.toISOString();
            }
            filter.push({
                range: {
                occurredAt: range,
                },
            });
        }
        return {
            bool: {
                must,
                filter,
            },
        };
    }
    private toElasticsearchDocument(event: Event): ElasticsearchEventDocument {
        return {
            id: event.id ?? "",
            userId: event.userId,
            type: event.type,
            title: event.title,
            content: event.content,
            tags: event.tags,
            source: event.source,
            occurredAt: this.toIsoString(event.occurredAt),
            createdAt: this.toIsoString(event.createdAt),
            updatedAt: this.toIsoString(event.updatedAt),
            metadata: event.metadata,
        };
    }
    private toEvent(document: ElasticsearchEventDocument): Event {
        return new Event({
            id: document.id,
            userId: document.userId,
            type: document.type as Event["type"],
            title: document.title,
            content: document.content,
            tags: document.tags,
            source: document.source as Event["source"],
            occurredAt: new Date(document.occurredAt),
            createdAt: new Date(document.createdAt),
            updatedAt: new Date(document.updatedAt),
            metadata: document.metadata,
        });
    }

    private toIsoString(value: Date | string): string {
        if (value instanceof Date) {
            return value.toISOString();
        }

        return new Date(value).toISOString();
    }

}
