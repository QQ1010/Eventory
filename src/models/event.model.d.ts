export type EventType = "learning" | "note" | "leetcode" | "activity";
export type EventSource = "api" | "cli";
export type EventProps = {
    id?: string;
    userId: string;
    type: EventType;
    title: string;
    content: string;
    tags: string[];
    source: EventSource;
    occurredAt: Date;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, unknown>;
};
export type CreateEventInput = {
    userId: string;
    type: EventType;
    title: string;
    content: string;
    tags?: string[];
    occurredAt?: Date;
    metadata?: Record<string, unknown>;
};
export declare class Event {
    id?: string;
    userId: string;
    type: EventType;
    title: string;
    content: string;
    tags: string[];
    source: EventSource;
    occurredAt: Date;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, unknown>;
    constructor(props: EventProps);
}
//# sourceMappingURL=event.model.d.ts.map