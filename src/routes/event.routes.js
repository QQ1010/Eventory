/*
event.routes.ts
  - 註冊 API endpoint
  - 把 request 交給 controller

POST /events
  → IngestEventService
  → Queue
  → Worker

GET /events
GET /events/:id
  → EventService
  → MongoDB

GET /search
  → SearchService
  → Elasticsearch

GET /analytics
  → AnalyticsService
  → MongoDB aggregation

*/
import { Router } from "express";
export function createEventRoutes(eventController) {
    const router = Router();
    router.post("/events", eventController.createEvent.bind(eventController));
    router.get("/events", eventController.getEvents.bind(eventController));
    router.get("/events/:id", eventController.getEventById.bind(eventController));
    router.get("/search", eventController.searchEvents.bind(eventController));
    router.get("/analytics", eventController.getAnalytics.bind(eventController));
    return router;
}
//# sourceMappingURL=event.routes.js.map