import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyticsService } from "../../src/services/analytics.service.js";
import { IEventRepository } from "../../src/repositories/event.repository.interface.js";

describe("AnalyticsService", () => {
    let fakeEventRepository!: IEventRepository;
    let analyticsService!: AnalyticsService;
    beforeEach(() => {
        fakeEventRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findMany: vi.fn(),
            countEventsPerDay: vi.fn(),
            getTopTags: vi.fn(),
        } as unknown as IEventRepository;
        analyticsService = new AnalyticsService(fakeEventRepository);
    });

    it("should return analytics result successfully", async() => {
        // Arrange
        const eventsPerDay = [
            { date: "2026-04-21", count: 2},
            { date: "2026-04-22", count: 3},
        ];

        const topTagItem = [
            { tag: "backend", count: 4},
            { tag: "redis", count: 2},
        ];
        (fakeEventRepository.countEventsPerDay as ReturnType<typeof vi.fn>).mockResolvedValue(eventsPerDay);
        (fakeEventRepository.getTopTags as ReturnType<typeof vi.fn>).mockResolvedValue(topTagItem);
        // Act
        
        const result = await analyticsService.getAnalytics({
            userId: "user_1",
        });
        // Assert
        expect(fakeEventRepository.countEventsPerDay).toHaveBeenCalledTimes(1);
        expect(fakeEventRepository.getTopTags).toHaveBeenCalledTimes(1);

        expect(fakeEventRepository.countEventsPerDay).toHaveBeenCalledWith(
            "user_1",
            undefined,
            undefined,
        );

        expect(fakeEventRepository.getTopTags).toHaveBeenCalledWith(
            "user_1",
            undefined,
            undefined,
            10,
        );
        expect(result).toEqual({
            userId: "user_1",
            eventsPerDay,
            topTagItem,
        });
    });
    it("should throw when userId is empty", async() => {
        await expect(
            analyticsService.getAnalytics({
                userId: "  ",
            }),
        ).rejects.toThrow("userId is required");
    });
});