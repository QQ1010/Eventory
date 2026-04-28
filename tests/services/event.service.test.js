import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventService } from "../../src/services/event.service.js";
describe("EventService", () => {
    let fakeEventRepository;
    let eventService;
    beforeEach(() => {
        fakeEventRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findMany: vi.fn(),
            countEventsPerDay: vi.fn(),
            getTopTags: vi.fn(),
        };
        eventService = new EventService(fakeEventRepository);
    });
    it("should create event successfully", async () => {
        // Arrange
        const savedEvent = {
            id: "event_1",
            userId: "user_1",
            type: "learning",
            title: "Learn Redis TTL",
            content: "Studied Redis TTL behavior",
            tags: ["backend", "redis"],
            source: "api",
            occurredAt: new Date("2026-04-28T10:00:00.000Z"),
            createdAt: new Date("2026-04-28T10:00:00.000Z"),
            updatedAt: new Date("2026-04-28T10:00:00.000Z"),
            metadata: {},
        };
        fakeEventRepository.create.mockResolvedValue(savedEvent);
        // Act
        const result = await eventService.createEvent({
            userId: "user_1",
            type: "learning",
            title: "Learn Redis TTL",
            content: "Studied Redis TTL behavoir",
            tags: ["Backend", "redis", "REDIS", ""],
        });
        // Assert
        expect(fakeEventRepository.create).toHaveBeenCalledTimes(1);
        const firstCall = fakeEventRepository.create.mock.calls[0];
        expect(firstCall).toBeDefined();
        const createdEvent = firstCall[0];
        expect(createdEvent.tags).toEqual(["backend", "redis"]);
        expect(result).toEqual(savedEvent);
    });
    it("should throw when title is empty", async () => {
        await expect(eventService.createEvent({
            userId: "user_1",
            type: "learning",
            title: "  ",
            content: "Studied Redis TTL behavior",
            tags: [],
        })).rejects.toThrow("title is required");
    });
});
//# sourceMappingURL=event.service.test.js.map