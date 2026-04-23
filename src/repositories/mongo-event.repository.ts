/*
event.repository.ts
  - 儲存 event
  - 查詢 event
  - 查詢多個 events
  - 第一版用 in-memory array
  - 之後改成 MongoDB
*/
import { Collection, Db, ObjectId } from "mongodb";
import { Event } from "../models/event.model.js";
import { IEventRepository, EventsPerDayItem, TopTagItem } from "./event.repository.interface.js";

export class MongodbEventRepository implements IEventRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection("events");
  }

  // use mongoDB ObjectId as id
  async create(event: Event): Promise<Event> {
    const {id, ...eventData} = event;
    const result = await this.collection.insertOne(eventData);
    return new Event({
      ...eventData,
      id: result.insertedId.toString(),
    });
  }

  async findById(id: string): Promise<Event | null> {
    if(!ObjectId.isValid(id)) {
      return null;
    }
    const document = await this.collection.findOne({
      _id: new ObjectId(id),
    });
    if(!document) {
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

  async findMany(): Promise<Event[]> {
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

  async countEventsPerDay(userId: string, from?: Date, to?: Date): Promise<EventsPerDayItem[]> {
    const matchStage: {
      userId: string,
      occurredAt?: {
        $gte?: Date,
        $lte?: Date,
      };
    } = {userId};
    if(from || to) {
      matchStage.occurredAt = {};
      if(from) {
        matchStage.occurredAt.$gte = from;
      }
      if(to) {
        matchStage.occurredAt.$lte = to;
      }
    }
    const documents = await this.collection.aggregate<EventsPerDayItem>([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$occurredAt",
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

  async getTopTags(userId: string, from?: Date, to?: Date, limit?: number): Promise<TopTagItem[]> {
    const matchStage: {
      userId: string,
      tags?: { $exists: boolean; $ne: [] };
      occurredAt?: {
        $gte?: Date,
        $lte?: Date,
      };
    } = {
      userId,
      tags: { $exists: true, $ne: [] },
    };
    if(from || to) {
      matchStage.occurredAt = {};
      if(from) {
        matchStage.occurredAt.$gte = from;
      }
      if(to) {
        matchStage.occurredAt.$lte = to;
      }
    }
    const documents = await this.collection.aggregate<TopTagItem>([
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
          tags: "$_id",
          count: 1
        }
      }
    ])
    .toArray();
    return documents;
  }

}
