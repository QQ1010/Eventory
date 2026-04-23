/*
app.ts

- 建 MongoDB
- 建立 Repository
- 建立 Service
- 建立 Controller
- 註冊 Routes


*/

import express from "express"

import { connectDatabase } from "./config/mongodb.js";
import { MongodbEventRepository } from "./repositories/mongo-event.repository.js";
import { EventService } from "./services/event.service.js";
import { EventController } from "./controllers/event.controller.js";
import { createEventRoutes } from "./routes/event.routes.js";
import { BullMQEventQueue } from "./queues/bullmq-event.queue.js";
import { IngestEventService } from "./services/ingest-event.service.js";
import { ElasticsearchEventSearchRepository } from "./search/elasticsearch-event.search.repository.js";
import { SearchService } from "./services/search.service.js";
import { AnalyticsService } from "./services/analytics.service.js";
export async function buildApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
  });

  const db = await connectDatabase();

  const eventRepository = new MongodbEventRepository(db);
  const eventService = new EventService(eventRepository);
  const eventQueue = new BullMQEventQueue();
  const ingestEventService = new IngestEventService(eventQueue);
  const searchRepository = new ElasticsearchEventSearchRepository();
  const searchService = new SearchService(searchRepository);
  const analyticsService = new AnalyticsService(eventRepository);
  const eventController = new EventController(eventService, ingestEventService, searchService, analyticsService);

  app.use(createEventRoutes(eventController));

  return app;
}
