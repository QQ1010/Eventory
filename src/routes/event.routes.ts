/*
event.routes.ts
  - 註冊 API endpoint
  - 把 request 交給 controller

POST /events → controller.createEvent
GET /events → controller.getEvents
GET /events/:id → controller.getEventById

*/

import { Router } from "express";
import { EventController } from "../controllers/event.controller.js";

export function createEventRoutes(eventController: EventController): Router {
  const router = Router();
  router.post(
    "/events",
    eventController.createEvent.bind(eventController),
  );

  router.get(
    "/events",
    eventController.getEvents.bind(eventController),
  );

  router.get(
    "/events/:id",
    eventController.getEventById.bind(eventController),
  );

  router.get(
    "/search",
    eventController.searchEvents.bind(eventController),
  );

  return router;
}