import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchService } from "../../src/services/search.service.js";
import { IEventSearchRepository } from "../../src/search/event.search.repository.interface.js";

describe("SearchService", () => {
    let fakeSearchRepository!: IEventSearchRepository;
    let searchService!: SearchService;
    beforeEach(() => {
        fakeSearchRepository = {
            ensureIndex: vi.fn(),
            indexEvent: vi.fn(),
            searchEvents: vi.fn(),
        } as unknown as IEventSearchRepository;
        searchService = new SearchService(fakeSearchRepository);
    });

    it("should normalize keyword and tags before searching", async() => {
        // Arrange
        const searchResult = {
            items: [],
            total: 0,
        };
        (fakeSearchRepository.searchEvents as ReturnType<typeof vi.fn>).mockResolvedValue(searchResult);

        // Act
        const result = await searchService.searchEvents({
            keyword: "   redis  ttl   ",
            tags: [" Backend", "redis", "REDIS", ""],
        });
        
        // Assert
        expect(fakeSearchRepository.searchEvents).toHaveBeenCalledTimes(1);
        const firstCall = (fakeSearchRepository.searchEvents as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(firstCall).toBeDefined;
        const normalizedInput = firstCall![0];
        expect(normalizedInput).toEqual({
            keyword: "redis ttl",
            tags: ["backend", "redis"],
        });
        expect(result).toEqual(searchResult);
    });
    it("should throw when from date is later than to date", async() => {
        await expect(
            searchService.searchEvents({
                from: new Date("2026-04-30"),
                to: new Date("2026-04-01"),
            }),
        ).rejects.toThrow("from date cannot be later than to date");
    });
});