/*
1. 建立 BullMQ Queue instance
2. 定義 queue name
3. 提供 enqueueEvent 方法
4. 把 event ingestion input 加成 BullMQ job
5. 設定 job options，例如 attempts / backoff / removeOnComplete
6. 回傳 jobId
*/
import { Queue } from 'bullmq';
import { redisConnection } from "../config/redis.js";
import { EVENT_INGESTION_QUEUE_NAME, INGEST_EVENT_JOB_NAME } from "../queues/event-queue.constants.js";
export class BullMQEventQueue {
    queue;
    constructor() {
        this.queue = new Queue(EVENT_INGESTION_QUEUE_NAME, {
            connection: redisConnection,
        });
    }
    async enqueueEvent(input) {
        const job = await this.queue.add(INGEST_EVENT_JOB_NAME, input, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
        if (!job.id) {
            throw new Error("Failed to create queue job");
        }
        return {
            jobId: job.id,
        };
    }
}
//# sourceMappingURL=bullmq-event.queue.js.map