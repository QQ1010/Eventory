export type EventType = "learning" | "note" | "leetcode" | "activity";
export type EventItem = {
    id?: string;
    userId: string;
    type: EventType;
    title: string;
    content: string;
    tags: string[];
    source: "api" | "cli";
    occurredAt: string;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, unknown>;
};
export type SearchResult = {
    items: EventItem[];
    total: number;
};
export type AnalyticsResult = {
    userId: string;
    eventsPerDay: Array<{
        date: string;
        count: number;
    }>;
    topTagItem: Array<{
        tag: string;
        count: number;
    }>;
};
export type CreateEventPayload = {
    userId: string;
    type: EventType;
    title: string;
    content: string;
    tags?: string[];
    occurredAt?: string;
    metadata?: Record<string, unknown>;
};
export declare function createEvent(payload: CreateEventPayload): Promise<{
    status: string;
    jobId: string;
}>;
export declare function fetchEvents(): Promise<EventItem[]>;
export declare function searchEvents(params: {
    keyword?: string;
    tags?: string;
    type?: EventType | "";
    from?: string;
    to?: string;
}): Promise<SearchResult>;
export declare function fetchAnalytics(params: {
    userId: string;
    from?: string;
    to?: string;
}): Promise<AnalyticsResult>;
//# sourceMappingURL=api.d.ts.map