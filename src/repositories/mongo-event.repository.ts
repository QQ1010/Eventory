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
import { IEventRepository } from "./event.repository.interface.js";

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
}
