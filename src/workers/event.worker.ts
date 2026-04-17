/*
從 BullMQ queue 拿 job
呼叫 EventService.createEvent()
寫入 MongoDB
*/

import "dotenv/config";

import { Worker } from "bullmq";

import { connectDatabase } from "../config/database.js";
import { redisConnection } from "../config/redis.js";
import { EVENT_INGESTION_QUEUE_NAME } from "../queues/event-queue.constants.js";
import { MongodbEventRepository } from "../repositories/mongo-event.repository.js";
import { EventService } from "../services/event.service.js";
import { CreateEventInput } from "../models/event.model.js";

async function startWorker(): Promise<void> {
    const db = await connectDatabase();
    
    const eventRepository = new MongodbEventRepository(db);
    const eventService = new EventService(eventRepository);
    const worker = new Worker<CreateEventInput>(
        EVENT_INGESTION_QUEUE_NAME,
        async (job) => {
            console.log(`Processing job ${job.id}`);

            const event = await eventService.createEvent(job.data);

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