/*
event.model.ts
  - 定義 Event / CreateEventInput type
*/
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

export class Event {
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

  constructor(props: EventProps) {
    if (props.id !== undefined) {
      this.id = props.id;
    }
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.content = props.content;
    this.tags = props.tags;
    this.source = props.source;
    this.occurredAt = props.occurredAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.metadata = props.metadata;
  }
};