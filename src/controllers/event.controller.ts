/*
event.controller.ts
  - 讀 request.body
  - 做基本 request validation
  - 呼叫 service
  - 設定 HTTP status code
  - 回傳 response

create => POST /events
POST /events
  → EventController
  → IngestEventService
  → BullMQEventQueue
  → Redis
  → 202 Accepted + jobId

getById => GET /events/:id
getMany => GET /events

request body
{
  "userId": "user_1",
  "type": "learning",
  "title": "Learn MongoDB Repository",
  "content": "Practiced how Controller, Service, and Repository work together.",
  "tags": ["backend", "mongodb"],
  "occurredAt": "2026-04-14T10:00:00.000Z",
  "metadata": {
    "difficulty": "beginner"
  }
}
*/

import { Request, Response } from "express";
import { IEventService } from "../services/event.service.interface.js";
import { EventType, CreateEventInput } from "../models/event.model.js";
import { IIngestEventService } from "../services/ingest-event.service.interface.js";

const validEventTypes: EventType[] = [
  "learning",
  "note",
  "leetcode",
  "activity",
];

type CreateEventRequestBody = {
  userId?: unknown;
  type?: unknown;
  title?: unknown;
  content?: unknown;
  tags?: unknown;
  occurredAt?: unknown;
  metadata?: unknown;
};

function validateCreateEventBody(body: CreateEventRequestBody): CreateEventInput {
  if(typeof body.userId !== "string" || body.userId.trim().length === 0) {
    throw new Error("userId is required");
  }
  if(typeof body.type !== "string" || !validEventTypes.includes(body.type as EventType)) {
    throw new Error("type must be one of learning, note, leetcode, activity");
  }

  if(typeof body.title !== "string" || body.title.trim().length === 0) {
    throw new Error("title is required");
  }
  if (body.title.trim().length > 120) {
    throw new Error("title must be less than 120 characters");
  }

  if(typeof body.content !== "string" || body.content.trim().length === 0) {
    throw new Error("content is required");
  }


  const input: CreateEventInput = {
    userId: body.userId,
    type: body.type as EventType,
    title: body.title,
    content: body.content,
  };

  if(body.tags !== undefined) {
    if (!Array.isArray(body.tags) || !body.tags.every((tag) => typeof tag === "string")) {
      throw new Error("tags must be an array of strings");
    }
    if (body.tags.length > 10) {
      throw new Error("tags cannot contain more than 10 items");
    }

    input.tags = body.tags;
  }

  if(body.occurredAt !== undefined) {
    if (typeof body.occurredAt !== "string") {
      throw new Error("occurredAt must be a valid date string");
    }

    const occurredAt = new Date(body.occurredAt);

    if (Number.isNaN(occurredAt.getTime())) {
      throw new Error("occurredAt must be a valid date string");
    }

    input.occurredAt = occurredAt;
  }

  if (body.metadata !== undefined) {
    if (typeof body.metadata !== "object" || body.metadata === null || Array.isArray(body.metadata)) {
      throw new Error("metadata must be an object");
    }

    input.metadata = body.metadata as Record<string, unknown>;
  }

  return input;
}

type GetEventByIdParams = {
  id: string;
};

export class EventController {
  private readonly ingestEventService: IIngestEventService;
  private readonly eventService: IEventService;
  constructor(eventService: IEventService, ingestEventService: IIngestEventService) {
    this.eventService = eventService;
    this.ingestEventService = ingestEventService;
  }

  public async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const input = validateCreateEventBody(req.body as CreateEventRequestBody);
      const result = await this.ingestEventService.ingestEvent(input);

      res.status(202).json({
        status: "accepted",
        jobId: result.jobId,
      });
    } catch(error) {
      console.error(error);
      res.status(400).json({
        message: error instanceof Error ? error.message: "Fail to enqueue event",
      });
    }
  }
  
  public async getEventById(req: Request<GetEventByIdParams>, res: Response): Promise<void> {
    try {
      const event = await this.eventService.getEventById(req.params.id);
      if(!event) {
        res.status(400).json({
          message: "Event not found",
        });
      }
      res.status(200).json(event);
    } catch(error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to get event",
      });
    }
  }

  public async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await this.eventService.getEvents();
      res.status(200).json(events);
    } catch(error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to get event",
      });
    }
  }
}