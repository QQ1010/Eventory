/*
event.repository.ts
  - 儲存 event
  - 查詢 event
  - 查詢多個 events
  - 第一版用 in-memory array
  - 之後改成 MongoDB
*/
import { ObjectId } from "mongodb";
import { Event } from "../models/event.model.js";
export class MongodbEventRepository {
    collection;
    constructor(db) {
        this.collection = db.collection("events");
    }
    // use mongoDB ObjectId as id
    async create(event) {
        const { id, ...eventData } = event;
        const result = await this.collection.insertOne(eventData);
        return new Event({
            ...eventData,
            id: result.insertedId.toString(),
        });
    }
    async findById(id) {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const document = await this.collection.findOne({
            _id: new ObjectId(id),
        });
        if (!document) {
            return null;
        }
        return new Event({
            id: document._id.toString(),
            userId: document.userId,
            type: document.type,
            title: document.title,
            content: document.content,
            tags: document.tags,
            source: document.source,
            occurredAt: document.occurredAt,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            metadata: document.metadata,
        });
    }
    async findMany() {
        const documents = await this.collection
            .find()
            .sort({ occurredAt: -1 })
            .toArray();
        return documents.map((document) => {
            return new Event({
                id: document._id.toString(),
                userId: document.userId,
                type: document.type,
                title: document.title,
                content: document.content,
                tags: document.tags,
                source: document.source,
                occurredAt: document.occurredAt,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                metadata: document.metadata,
            });
        });
    }
    async countEventsPerDay(userId, from, to) {
        const matchStage = { userId };
        if (from || to) {
            matchStage.normalizedOccurredAt = {};
            if (from) {
                matchStage.normalizedOccurredAt.$gte = from;
            }
            if (to) {
                matchStage.normalizedOccurredAt.$lte = to;
            }
        }
        const documents = await this.collection.aggregate([
            {
                $addFields: {
                    normalizedOccurredAt: { $toDate: "$occurredAt" },
                },
            },
            {
                $match: matchStage,
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$normalizedOccurredAt",
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                },
            },
        ])
            .toArray();
        return documents;
    }
    async getTopTags(userId, from, to, limit) {
        const matchStage = {
            userId,
            tags: { $exists: true, $ne: [] },
        };
        if (from || to) {
            matchStage.normalizedOccurredAt = {};
            if (from) {
                matchStage.normalizedOccurredAt.$gte = from;
            }
            if (to) {
                matchStage.normalizedOccurredAt.$lte = to;
            }
        }
        const documents = await this.collection.aggregate([
            {
                $addFields: {
                    normalizedOccurredAt: { $toDate: "$occurredAt" },
                },
            },
            {
                $match: matchStage,
            },
            {
                $unwind: "$tags",
            },
            {
                $group: {
                    _id: "$tags",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                }
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    _id: 0,
                    tag: "$_id",
                    count: 1
                }
            }
        ])
            .toArray();
        return documents;
    }
}
//# sourceMappingURL=mongo-event.repository.js.map