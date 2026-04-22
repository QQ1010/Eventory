/*
從 BullMQ queue 拿 job
建立 ElasticsearchEventSearchRepository.indexEvent(event)
呼叫 EventService.createEvent()
寫入 MongoDB
*/

import "dotenv/config";

import { Worker } from "bullmq";

import { connectDatabase } from "../config/mongodb.js";
import { redisConnection } from "../config/redis.js";
import { EVENT_INGESTION_QUEUE_NAME } from "../queues/event-queue.constants.js";
import { MongodbEventRepository } from "../repositories/mongo-event.repository.js";
import { EventService } from "../services/event.service.js";
import type { CreateEventInput } from "../models/event.model.js";
import { ElasticsearchEventSearchRepository } from "../search/elasticsearch-event.search.repository.js";

async function startWorker(): Promise<void> {
    const db = await connectDatabase();
    
    const eventRepository = new MongodbEventRepository(db);
    const eventService = new EventService(eventRepository);
    const eventSearchRepository = new ElasticsearchEventSearchRepository();
    await eventSearchRepository.ensureIndex();
    const worker = new Worker<CreateEventInput>(
        EVENT_INGESTION_QUEUE_NAME,
        async (job) => {
            console.log(`Processing job ${job.id}, attempt ${job.attemptsMade + 1}`);
            
            const event = await eventService.createEvent(job.data);
            
            await eventSearchRepository.indexEvent(event);
            console.log(`Event indexed in Elasticsearch: ${event.id}`);
            
            console.log(`Event created: ${event.id}`);

            return {
                eventId: event.id,
            };
        },
        {
            connection: redisConnection,
            concurrency: 1,
        },
    );
    worker.on("completed", (job) => {
        console.log(`Job completed: ${job.id}`);
    });
    worker.on("failed", (job, error) => {
        if(job !== undefined) {
            console.error(`Job failed ${job.id}`, error);
        }
        console.error(error);
    });
    console.log("Event worker is running");
}

startWorker().catch((error) => {
  console.error("Failed to start event worker", error);
  process.exit(1);
});