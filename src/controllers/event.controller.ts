/*
event.controller.ts
  - 讀 request.body
  - 做基本 request validation
  - 呼叫 service
  - 設定 HTTP status code
  - 回傳 response

create => POST /events
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

type CreateEventRequestBody = {
  userId: string;
  type: EventType;
  title: string;
  content: string;
  tags?: string[];
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
};

type GetEventByIdParams = {
  id: string;
};

export class EventController {
  private readonly eventService: IEventService;
  constructor(eventService: IEventService) {
    this.eventService = eventService;
  }

  public async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as CreateEventRequestBody;

      const input: CreateEventInput = {
        userId: body.userId,
        type: body.type,
        title: body.title,
        content: body.content,
      };

      if(body.tags !== undefined) {
        input.tags = body.tags;
      }

      if(body.occurredAt !== undefined) {
        input.occurredAt = body.occurredAt;
      }

      if(body.metadata !== undefined) {
        input.metadata = body.metadata;
      }
      const event = await this.eventService.createEvent(input);
      res.status(201).json(event);
    } catch(error) {
      console.error(error);
      res.status(400).json({
        message: error instanceof Error ? error.message: "Fail to create event",
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