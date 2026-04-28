import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, } from "recharts";
import { createEvent, fetchAnalytics, fetchEvents, searchEvents, } from "./api";
const eventTypes = ["learning", "note", "leetcode", "activity"];
const defaultFormState = {
    userId: "user_1",
    type: "learning",
    title: "",
    content: "",
    tags: "",
    occurredAt: "",
    metadata: "",
};
const defaultSearchState = {
    keyword: "",
    tags: "",
    type: "",
    from: "",
    to: "",
};
function App() {
    const [formState, setFormState] = useState(defaultFormState);
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState("");
    const [searchState, setSearchState] = useState(defaultSearchState);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [searchResult, setSearchResult] = useState({
        items: [],
        total: 0,
    });
    const [analyticsState, setAnalyticsState] = useState({
        userId: "user_1",
        from: "",
        to: "",
    });
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsError, setAnalyticsError] = useState("");
    useEffect(() => {
        void loadEvents();
    }, []);
    useEffect(() => {
        void loadSearchResults(defaultSearchState);
    }, []);
    useEffect(() => {
        void loadAnalytics(analyticsState.userId, analyticsState.from, analyticsState.to);
    }, []);
    const latestEvents = useMemo(() => [...events]
        .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
        .slice(0, 8), [events]);
    async function loadEvents() {
        setEventsLoading(true);
        setEventsError("");
        try {
            const data = await fetchEvents();
            setEvents(data);
        }
        catch (error) {
            setEventsError(error instanceof Error ? error.message : "Failed to load events");
        }
        finally {
            setEventsLoading(false);
        }
    }
    async function loadSearchResults(state) {
        setSearchLoading(true);
        setSearchError("");
        try {
            const data = await searchEvents(state);
            setSearchResult(data);
        }
        catch (error) {
            setSearchError(error instanceof Error ? error.message : "Failed to search events");
        }
        finally {
            setSearchLoading(false);
        }
    }
    async function loadAnalytics(userId, from, to) {
        setAnalyticsLoading(true);
        setAnalyticsError("");
        try {
            const data = await fetchAnalytics({ userId, from, to });
            setAnalytics(data);
        }
        catch (error) {
            setAnalyticsError(error instanceof Error ? error.message : "Failed to load analytics");
        }
        finally {
            setAnalyticsLoading(false);
        }
    }
    async function handleCreateEvent(event) {
        event.preventDefault();
        setSubmitting(true);
        setFormError("");
        setFormMessage("");
        try {
            const payload = {
                userId: formState.userId.trim(),
                type: formState.type,
                title: formState.title.trim(),
                content: formState.content.trim(),
                tags: splitTags(formState.tags),
            };
            if (formState.occurredAt) {
                payload.occurredAt = new Date(formState.occurredAt).toISOString();
            }
            if (formState.metadata.trim()) {
                payload.metadata = JSON.parse(formState.metadata);
            }
            const result = await createEvent(payload);
            setFormMessage(`Accepted into queue. jobId: ${result.jobId}`);
            setFormState((current) => ({
                ...defaultFormState,
                userId: current.userId,
                type: current.type,
            }));
            await Promise.all([
                loadEvents(),
                loadSearchResults(searchState),
                loadAnalytics(analyticsState.userId, analyticsState.from, analyticsState.to),
            ]);
        }
        catch (error) {
            setFormError(error instanceof Error ? error.message : "Failed to add event");
        }
        finally {
            setSubmitting(false);
        }
    }
    async function handleSearch(event) {
        event.preventDefault();
        await loadSearchResults(searchState);
    }
    async function handleAnalytics(event) {
        event.preventDefault();
        await loadAnalytics(analyticsState.userId, analyticsState.from, analyticsState.to);
    }
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "top-band", children: [_jsxs("div", { className: "band-copy", children: [_jsx("p", { className: "eyebrow", children: "Eventory Dashboard" }), _jsx("h1", { children: "Capture quickly. Search clearly. See the pattern." }), _jsx("p", { className: "band-subtitle", children: "One place to submit events into the queue, inspect search results, and watch your activity shape over time." })] }), _jsx("div", { className: "band-media", children: _jsx("img", { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", alt: "Laptop and notes on a work desk" }) })] }), _jsxs("main", { className: "dashboard-grid", children: [_jsxs("section", { className: "workspace-band", children: [_jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Ingestion" }), _jsx("h2", { children: "Add Event" })] }), _jsx("button", { className: "ghost-button", onClick: () => void loadEvents(), children: "Refresh events" })] }), _jsxs("div", { className: "workspace-layout", children: [_jsxs("form", { className: "tool-panel", onSubmit: handleCreateEvent, children: [_jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["User ID", _jsx("input", { value: formState.userId, onChange: (event) => setFormState((current) => ({
                                                                    ...current,
                                                                    userId: event.target.value,
                                                                })), placeholder: "user_1" })] }), _jsxs("label", { children: ["Type", _jsx("select", { value: formState.type, onChange: (event) => setFormState((current) => ({
                                                                    ...current,
                                                                    type: event.target.value,
                                                                })), children: eventTypes.map((type) => (_jsx("option", { value: type, children: type }, type))) })] })] }), _jsxs("label", { children: ["Title", _jsx("input", { value: formState.title, onChange: (event) => setFormState((current) => ({
                                                            ...current,
                                                            title: event.target.value,
                                                        })), placeholder: "Learn Redis TTL" })] }), _jsxs("label", { children: ["Content", _jsx("textarea", { rows: 5, value: formState.content, onChange: (event) => setFormState((current) => ({
                                                            ...current,
                                                            content: event.target.value,
                                                        })), placeholder: "Studied how expiration behaves across Redis commands." })] }), _jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["Tags", _jsx("input", { value: formState.tags, onChange: (event) => setFormState((current) => ({
                                                                    ...current,
                                                                    tags: event.target.value,
                                                                })), placeholder: "backend, redis, queue" })] }), _jsxs("label", { children: ["Occurred At", _jsx("input", { type: "datetime-local", value: formState.occurredAt, onChange: (event) => setFormState((current) => ({
                                                                    ...current,
                                                                    occurredAt: event.target.value,
                                                                })) })] })] }), _jsxs("label", { children: ["Metadata (JSON)", _jsx("textarea", { rows: 4, value: formState.metadata, onChange: (event) => setFormState((current) => ({
                                                            ...current,
                                                            metadata: event.target.value,
                                                        })), placeholder: '{"difficulty":"beginner"}' })] }), _jsxs("div", { className: "panel-actions", children: [_jsx("button", { className: "primary-button", type: "submit", disabled: submitting, children: submitting ? "Submitting..." : "Queue event" }), formMessage ? _jsx("p", { className: "success-text", children: formMessage }) : null, formError ? _jsx("p", { className: "error-text", children: formError }) : null] })] }), _jsxs("aside", { className: "insight-rail", children: [_jsxs("article", { className: "image-note", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", alt: "Open notebook beside a keyboard" }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Daily rhythm" }), _jsx("h3", { children: "Quick capture keeps the queue honest." }), _jsx("p", { children: "Add events here, then refresh the list and analytics to watch the worker-fed pipeline settle into MongoDB and Elasticsearch." })] })] }), _jsxs("article", { className: "summary-strip", children: [_jsxs("div", { children: [_jsx("span", { className: "summary-label", children: "Latest events" }), _jsx("strong", { children: events.length })] }), _jsxs("div", { children: [_jsx("span", { className: "summary-label", children: "Search hits" }), _jsx("strong", { children: searchResult.total })] }), _jsxs("div", { children: [_jsx("span", { className: "summary-label", children: "Tracked user" }), _jsx("strong", { children: analytics?.userId ?? analyticsState.userId })] })] })] })] })] }), _jsxs("section", { className: "content-band", children: [_jsxs("div", { className: "panel-group", children: [_jsx("div", { className: "section-heading", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Browse" }), _jsx("h2", { children: "Recent Events" })] }) }), eventsLoading ? _jsx("p", { className: "state-copy", children: "Loading events..." }) : null, eventsError ? _jsx("p", { className: "error-text", children: eventsError }) : null, _jsxs("div", { className: "event-list", children: [latestEvents.map((item) => (_jsxs("article", { className: "event-card", children: [_jsxs("div", { className: "event-meta", children: [_jsx("span", { className: `type-pill type-${item.type}`, children: item.type }), _jsx("span", { children: formatDate(item.occurredAt) })] }), _jsx("h3", { children: item.title }), _jsx("p", { children: item.content }), _jsx("div", { className: "tag-row", children: item.tags.map((tag) => (_jsx("span", { className: "tag-pill", children: tag }, `${item.id}-${tag}`))) })] }, `${item.id ?? item.title}-${item.occurredAt}`))), !eventsLoading && latestEvents.length === 0 ? (_jsx("p", { className: "state-copy", children: "No events yet. Queue one from the form above." })) : null] })] }), _jsxs("div", { className: "panel-group", children: [_jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Search" }), _jsx("h2", { children: "Explore Indexed Events" })] }), _jsx("button", { className: "ghost-button", onClick: () => void loadSearchResults(searchState), children: "Refresh search" })] }), _jsxs("form", { className: "search-form", onSubmit: handleSearch, children: [_jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["Keyword", _jsx("input", { value: searchState.keyword, onChange: (event) => setSearchState((current) => ({
                                                                    ...current,
                                                                    keyword: event.target.value,
                                                                })), placeholder: "redis ttl" })] }), _jsxs("label", { children: ["Type", _jsxs("select", { value: searchState.type, onChange: (event) => setSearchState((current) => ({
                                                                    ...current,
                                                                    type: event.target.value,
                                                                })), children: [_jsx("option", { value: "", children: "all" }), eventTypes.map((type) => (_jsx("option", { value: type, children: type }, type)))] })] })] }), _jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["Tags", _jsx("input", { value: searchState.tags, onChange: (event) => setSearchState((current) => ({
                                                                    ...current,
                                                                    tags: event.target.value,
                                                                })), placeholder: "backend, redis" })] }), _jsxs("label", { children: ["From", _jsx("input", { type: "date", value: searchState.from, onChange: (event) => setSearchState((current) => ({
                                                                    ...current,
                                                                    from: event.target.value,
                                                                })) })] }), _jsxs("label", { children: ["To", _jsx("input", { type: "date", value: searchState.to, onChange: (event) => setSearchState((current) => ({
                                                                    ...current,
                                                                    to: event.target.value,
                                                                })) })] })] }), _jsxs("div", { className: "panel-actions", children: [_jsx("button", { className: "primary-button", type: "submit", disabled: searchLoading, children: searchLoading ? "Searching..." : "Run search" }), _jsxs("span", { className: "muted-copy", children: [searchResult.total, " hits"] })] })] }), searchError ? _jsx("p", { className: "error-text", children: searchError }) : null, _jsxs("div", { className: "event-list", children: [searchResult.items.map((item) => (_jsxs("article", { className: "event-card", children: [_jsxs("div", { className: "event-meta", children: [_jsx("span", { className: `type-pill type-${item.type}`, children: item.type }), _jsx("span", { children: item.source })] }), _jsx("h3", { children: item.title }), _jsx("p", { children: item.content }), _jsx("div", { className: "tag-row", children: item.tags.map((tag) => (_jsx("span", { className: "tag-pill", children: tag }, `${item.id}-${tag}-search`))) })] }, `${item.id ?? item.title}-search`))), !searchLoading && searchResult.items.length === 0 ? (_jsx("p", { className: "state-copy", children: "No indexed events matched this search." })) : null] })] }), _jsxs("div", { className: "panel-group analytics-group", children: [_jsx("div", { className: "section-heading", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Analytics" }), _jsx("h2", { children: "Pattern View" })] }) }), _jsxs("form", { className: "analytics-form", onSubmit: handleAnalytics, children: [_jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["User ID", _jsx("input", { value: analyticsState.userId, onChange: (event) => setAnalyticsState((current) => ({
                                                                    ...current,
                                                                    userId: event.target.value,
                                                                })), placeholder: "user_1" })] }), _jsxs("label", { children: ["From", _jsx("input", { type: "date", value: analyticsState.from, onChange: (event) => setAnalyticsState((current) => ({
                                                                    ...current,
                                                                    from: event.target.value,
                                                                })) })] }), _jsxs("label", { children: ["To", _jsx("input", { type: "date", value: analyticsState.to, onChange: (event) => setAnalyticsState((current) => ({
                                                                    ...current,
                                                                    to: event.target.value,
                                                                })) })] })] }), _jsx("div", { className: "panel-actions", children: _jsx("button", { className: "primary-button", type: "submit", disabled: analyticsLoading, children: analyticsLoading ? "Loading..." : "Refresh analytics" }) })] }), analyticsError ? _jsx("p", { className: "error-text", children: analyticsError }) : null, _jsxs("div", { className: "analytics-layout", children: [_jsxs("div", { className: "chart-panel", children: [_jsxs("div", { className: "chart-header", children: [_jsx("h3", { children: "Events per day" }), _jsx("p", { children: "Actual occurrence dates, not ingestion timestamps." })] }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(AreaChart, { data: analytics?.eventsPerDay ?? [], children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "eventCountFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#f25c54", stopOpacity: 0.35 }), _jsx("stop", { offset: "95%", stopColor: "#f25c54", stopOpacity: 0.02 })] }) }), _jsx(CartesianGrid, { stroke: "#d7ded6", strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tickLine: false, axisLine: false }), _jsx(YAxis, { allowDecimals: false, tickLine: false, axisLine: false }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "count", stroke: "#f25c54", fill: "url(#eventCountFill)", strokeWidth: 2 })] }) })] }), _jsxs("div", { className: "chart-panel", children: [_jsxs("div", { className: "chart-header", children: [_jsx("h3", { children: "Top tags" }), _jsx("p", { children: "Most frequent labels in the selected range." })] }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(BarChart, { data: analytics?.topTagItem ?? [], layout: "vertical", children: [_jsx(CartesianGrid, { stroke: "#d7ded6", strokeDasharray: "3 3" }), _jsx(XAxis, { type: "number", allowDecimals: false, tickLine: false, axisLine: false }), _jsx(YAxis, { type: "category", dataKey: "tag", width: 90, tickLine: false, axisLine: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#2a9d8f", radius: [0, 6, 6, 0] })] }) })] })] }), !analyticsLoading &&
                                        !analyticsError &&
                                        analytics &&
                                        analytics.eventsPerDay.length === 0 &&
                                        analytics.topTagItem.length === 0 ? (_jsx("p", { className: "state-copy", children: "No analytics data matched the current filters yet." })) : null] })] })] })] }));
}
function splitTags(input) {
    return input
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}
function formatDate(value) {
    return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export default App;
//# sourceMappingURL=App.js.map