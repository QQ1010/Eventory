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
search => GET /search


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
export const validEventTypes = [
    "learning",
    "note",
    "leetcode",
    "activity",
];
function validateCreateEventBody(body) {
    if (typeof body.userId !== "string" || body.userId.trim().length === 0) {
        throw new Error("userId is required");
    }
    if (typeof body.type !== "string" || !validEventTypes.includes(body.type)) {
        throw new Error("type must be one of learning, note, leetcode, activity");
    }
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
        throw new Error("title is required");
    }
    if (body.title.trim().length > 120) {
        throw new Error("title must be less than 120 characters");
    }
    if (typeof body.content !== "string" || body.content.trim().length === 0) {
        throw new Error("content is required");
    }
    const input = {
        userId: body.userId,
        type: body.type,
        title: body.title,
        content: body.content,
    };
    if (body.tags !== undefined) {
        if (!Array.isArray(body.tags) || !body.tags.every((tag) => typeof tag === "string")) {
            throw new Error("tags must be an array of strings");
        }
        if (body.tags.length > 10) {
            throw new Error("tags cannot contain more than 10 items");
        }
        input.tags = body.tags;
    }
    if (body.occurredAt !== undefined) {
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
        input.metadata = body.metadata;
    }
    return input;
}
function getSingleQueryValue(value) {
    if (typeof value === "string") {
        return value;
    }
    return undefined;
}
function isValidEventType(value) {
    return validEventTypes.includes(value);
}
export class EventController {
    ingestEventService;
    eventService;
    searchService;
    analyticsService;
    constructor(eventService, ingestEventService, searchService, analyticsService) {
        this.eventService = eventService;
        this.ingestEventService = ingestEventService;
        this.searchService = searchService;
        this.analyticsService = analyticsService;
    }
    async createEvent(req, res) {
        try {
            const input = validateCreateEventBody(req.body);
            const result = await this.ingestEventService.ingestEvent(input);
            res.status(202).json({
                status: "accepted",
                jobId: result.jobId,
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Fail to enqueue event",
            });
        }
    }
    async getEventById(req, res) {
        try {
            const event = await this.eventService.getEventById(req.params.id);
            if (!event) {
                res.status(404).json({
                    message: "Event not found",
                });
                return;
            }
            res.status(200).json(event);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Failed to get event",
            });
        }
    }
    async getEvents(req, res) {
        try {
            const events = await this.eventService.getEvents();
            res.status(200).json(events);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Failed to get event",
            });
        }
    }
    async searchEvents(req, res) {
        try {
            const input = {};
            const keyword = getSingleQueryValue(req.query.keyword);
            if (keyword) {
                input.keyword = keyword;
            }
            const type = getSingleQueryValue(req.query.type);
            if (type) {
                if (!isValidEventType(type)) {
                    res.status(400).json({
                        message: "type must be one of learning, note, leetcode, activity",
                    });
                    return;
                }
                input.type = type;
            }
            const tags = getSingleQueryValue(req.query.tags);
            if (tags) {
                const parseTags = tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                if (parseTags.length > 0) {
                    input.tags = parseTags;
                }
            }
            const from = getSingleQueryValue(req.query.from);
            if (from) {
                const fromDate = new Date(from);
                if (Number.isNaN(fromDate.getTime())) {
                    res.status(400).json({
                        message: "from must be valid date string",
                    });
                    return;
                }
                input.from = fromDate;
            }
            const to = getSingleQueryValue(req.query.to);
            if (to) {
                const toDate = new Date(to);
                if (Number.isNaN(toDate.getTime())) {
                    res.status(400).json({
                        message: "to must be valid date string",
                    });
                    return;
                }
                input.to = toDate;
            }
            const result = await this.searchService.searchEvents(input);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                message: error instanceof Error ? error.message : "Fail to search events"
            });
        }
    }
    async getAnalytics(req, res) {
        try {
            const userId = getSingleQueryValue(req.query.userId);
            if (!userId || userId.trim().length === 0) {
                res.status(400).json({
                    message: "userId is required",
                });
                return;
            }
            const input = {
                userId: userId.trim(),
            };
            const from = getSingleQueryValue(req.query.from);
            if (from) {
                const fromDate = new Date(from);
                if (Number.isNaN(fromDate.getTime())) {
                    res.status(400).json({
                        message: "from must be valid date string",
                    });
                    return;
                }
                input.from = fromDate;
            }
            const to = getSingleQueryValue(req.query.to);
            if (to) {
                const toDate = new Date(to);
                if (Number.isNaN(toDate.getTime())) {
                    res.status(400).json({
                        message: "to must be valid date string",
                    });
                    return;
                }
                input.to = toDate;
            }
            const result = await this.analyticsService.getAnalytics(input);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                message: error instanceof Error ? error.message : "Fail to get analytics"
            });
        }
    }
}
//# sourceMappingURL=event.controller.js.map