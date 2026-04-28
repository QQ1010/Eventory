export class SearchService {
    searchRepository;
    constructor(searchRepository) {
        this.searchRepository = searchRepository;
    }
    async searchEvents(input) {
        const normalizedInput = {};
        if (input.keyword && input.keyword.trim().length > 0) {
            normalizedInput.keyword = input.keyword.trim().replace(/\s+/g, " ");
        }
        if (input.tags && input.tags.length > 0) {
            const normalizedTags = this.normalizeTags(input.tags);
            if (normalizedTags.length > 0) {
                normalizedInput.tags = normalizedTags;
            }
        }
        if (input.type) {
            normalizedInput.type = input.type;
        }
        if (input.from && input.to && input.from > input.to) {
            throw new Error("from date cannot be later than to date");
        }
        if (input.from) {
            normalizedInput.from = input.from;
        }
        if (input.to) {
            normalizedInput.to = input.to;
        }
        return this.searchRepository.searchEvents(normalizedInput);
    }
    normalizeTags(tags) {
        return [
            ...new Set(tags
                .map((tag) => tag.trim().toLowerCase())
                .filter((tag) => tag.length > 0)),
        ];
    }
}
//# sourceMappingURL=search.service.js.map