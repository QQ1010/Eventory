import { elasticsearchClient } from "../config/elasticsearch.js";
import { EVENTS_INDEX_NAME } from "./search.constants.js";
import { Event } from "../models/event.model.js";
export class ElasticsearchEventSearchRepository {
    async ensureIndex() {
        const indexCheck = await elasticsearchClient.indices.exists({
            index: EVENTS_INDEX_NAME,
        });
        console.log("Checking Elasticsearch index...");
        if (indexCheck) {
            return;
        }
        await elasticsearchClient.indices.create({
            index: EVENTS_INDEX_NAME,
            mappings: {
                properties: {
                    id: { type: "keyword" },
                    userId: { type: "keyword" },
                    type: { type: "keyword" },
                    title: { type: "text" },
                    content: { type: "text" },
                    tags: { type: "keyword" },
                    source: { type: "keyword" },
                    occurredAt: { type: "date" },
                    createdAt: { type: "date" },
                    updatedAt: { type: "date" },
                    metadata: { type: "object" },
                }
            }
        });
    }
    async indexEvent(event) {
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
    async searchEvents(input) {
        const query = this.buildSearchQuery(input);
        const response = await elasticsearchClient.search({
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
            .filter((document) => document !== undefined)
            .map((document) => this.toEvent(document));
        const total = typeof response.hits.total === "number"
            ? response.hits.total
            : response.hits.total?.value ?? 0;
        return {
            items,
            total
        };
    }
    buildSearchQuery(input) {
        const must = [];
        const filter = [];
        if (input.keyword && input.keyword.trim().length > 0) {
            must.push({
                multi_match: {
                    query: input.keyword.trim(),
                    fields: ['title', 'content'],
                },
            });
        }
        if (input.tags && input.tags.length > 0) {
            filter.push({
                terms: {
                    tags: input.tags,
                },
            });
        }
        if (input.type) {
            filter.push({
                term: {
                    type: input.type,
                },
            });
        }
        if (input.from || input.to) {
            const range = {};
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
    toElasticsearchDocument(event) {
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
    toEvent(document) {
        return new Event({
            id: document.id,
            userId: document.userId,
            type: document.type,
            title: document.title,
            content: document.content,
            tags: document.tags,
            source: document.source,
            occurredAt: new Date(document.occurredAt),
            createdAt: new Date(document.createdAt),
            updatedAt: new Date(document.updatedAt),
            metadata: document.metadata,
        });
    }
    toIsoString(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return new Date(value).toISOString();
    }
}
//# sourceMappingURL=elasticsearch-event.search.repository.js.map