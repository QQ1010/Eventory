async function request(url, init) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
        ...init,
    });
    if (!response.ok) {
        let message = "Request failed";
        try {
            const errorData = (await response.json());
            if (errorData.message) {
                message = errorData.message;
            }
        }
        catch {
            // ignore parse failure and keep generic message
        }
        throw new Error(message);
    }
    return (await response.json());
}
export async function createEvent(payload) {
    return request("/events", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export async function fetchEvents() {
    return request("/events");
}
export async function searchEvents(params) {
    const query = new URLSearchParams();
    if (params.keyword) {
        query.set("keyword", params.keyword);
    }
    if (params.tags) {
        query.set("tags", params.tags);
    }
    if (params.type) {
        query.set("type", params.type);
    }
    if (params.from) {
        query.set("from", params.from);
    }
    if (params.to) {
        query.set("to", params.to);
    }
    const suffix = query.toString();
    return request(suffix ? `/search?${suffix}` : "/search");
}
export async function fetchAnalytics(params) {
    const query = new URLSearchParams({
        userId: params.userId,
    });
    if (params.from) {
        query.set("from", params.from);
    }
    if (params.to) {
        query.set("to", params.to);
    }
    return request(`/analytics?${query.toString()}`);
}
//# sourceMappingURL=api.js.map