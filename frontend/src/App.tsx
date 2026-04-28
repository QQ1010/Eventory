import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import {
  createEvent,
  fetchAnalytics,
  fetchEvents,
  searchEvents,
  type AnalyticsResult,
  type CreateEventPayload,
  type EventItem,
  type EventType,
  type SearchResult,
} from "./api";

const eventTypes: EventType[] = ["learning", "note", "leetcode", "activity"];

type FormState = {
  userId: string;
  type: EventType;
  title: string;
  content: string;
  tags: string;
  occurredAt: string;
  metadata: string;
};

type SearchState = {
  keyword: string;
  tags: string;
  type: EventType | "";
  from: string;
  to: string;
};

const defaultFormState: FormState = {
  userId: "user_1",
  type: "learning",
  title: "",
  content: "",
  tags: "",
  occurredAt: "",
  metadata: "",
};

const defaultSearchState: SearchState = {
  keyword: "",
  tags: "",
  type: "",
  from: "",
  to: "",
};

function App() {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [formMessage, setFormMessage] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult>({
    items: [],
    total: 0,
  });

  const [analyticsState, setAnalyticsState] = useState({
    userId: "user_1",
    from: "",
    to: "",
  });
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
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

  const latestEvents = useMemo(
    () =>
      [...events]
        .sort(
          (left, right) =>
            new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
        )
        .slice(0, 8),
    [events],
  );

  async function loadEvents() {
    setEventsLoading(true);
    setEventsError("");
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  }

  async function loadSearchResults(state: SearchState) {
    setSearchLoading(true);
    setSearchError("");
    try {
      const data = await searchEvents(state);
      setSearchResult(data);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Failed to search events");
    } finally {
      setSearchLoading(false);
    }
  }

  async function loadAnalytics(userId: string, from?: string, to?: string) {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const data = await fetchAnalytics({ userId, from, to });
      setAnalytics(data);
    } catch (error) {
      setAnalyticsError(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormMessage("");

    try {
      const payload: CreateEventPayload = {
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
        payload.metadata = JSON.parse(formState.metadata) as Record<string, unknown>;
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
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add event");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadSearchResults(searchState);
  }

  async function handleAnalytics(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadAnalytics(analyticsState.userId, analyticsState.from, analyticsState.to);
  }

  return (
    <div className="app-shell">
      <header className="top-band">
        <div className="band-copy">
          <p className="eyebrow">Eventory Dashboard</p>
          <h1>Capture quickly. Search clearly. See the pattern.</h1>
          <p className="band-subtitle">
            One place to submit events into the queue, inspect search results, and
            watch your activity shape over time.
          </p>
        </div>
        <div className="band-media">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
            alt="Laptop and notes on a work desk"
          />
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="workspace-band">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Ingestion</p>
              <h2>Add Event</h2>
            </div>
            <button className="ghost-button" onClick={() => void loadEvents()}>
              Refresh events
            </button>
          </div>

          <div className="workspace-layout">
            <form className="tool-panel" onSubmit={handleCreateEvent}>
              <div className="field-row">
                <label>
                  User ID
                  <input
                    value={formState.userId}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        userId: event.target.value,
                      }))
                    }
                    placeholder="user_1"
                  />
                </label>

                <label>
                  Type
                  <select
                    value={formState.type}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        type: event.target.value as EventType,
                      }))
                    }
                  >
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Title
                <input
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Learn Redis TTL"
                />
              </label>

              <label>
                Content
                <textarea
                  rows={5}
                  value={formState.content}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Studied how expiration behaves across Redis commands."
                />
              </label>

              <div className="field-row">
                <label>
                  Tags
                  <input
                    value={formState.tags}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                    placeholder="backend, redis, queue"
                  />
                </label>

                <label>
                  Occurred At
                  <input
                    type="datetime-local"
                    value={formState.occurredAt}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        occurredAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label>
                Metadata (JSON)
                <textarea
                  rows={4}
                  value={formState.metadata}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      metadata: event.target.value,
                    }))
                  }
                  placeholder='{"difficulty":"beginner"}'
                />
              </label>

              <div className="panel-actions">
                <button className="primary-button" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Queue event"}
                </button>
                {formMessage ? <p className="success-text">{formMessage}</p> : null}
                {formError ? <p className="error-text">{formError}</p> : null}
              </div>
            </form>

            <aside className="insight-rail">
              <article className="image-note">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
                  alt="Open notebook beside a keyboard"
                />
                <div>
                  <p className="eyebrow">Daily rhythm</p>
                  <h3>Quick capture keeps the queue honest.</h3>
                  <p>
                    Add events here, then refresh the list and analytics to watch the
                    worker-fed pipeline settle into MongoDB and Elasticsearch.
                  </p>
                </div>
              </article>

              <article className="summary-strip">
                <div>
                  <span className="summary-label">Latest events</span>
                  <strong>{events.length}</strong>
                </div>
                <div>
                  <span className="summary-label">Search hits</span>
                  <strong>{searchResult.total}</strong>
                </div>
                <div>
                  <span className="summary-label">Tracked user</span>
                  <strong>{analytics?.userId ?? analyticsState.userId}</strong>
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className="content-band">
          <div className="panel-group">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Browse</p>
                <h2>Recent Events</h2>
              </div>
            </div>

            {eventsLoading ? <p className="state-copy">Loading events...</p> : null}
            {eventsError ? <p className="error-text">{eventsError}</p> : null}

            <div className="event-list">
              {latestEvents.map((item) => (
                <article key={`${item.id ?? item.title}-${item.occurredAt}`} className="event-card">
                  <div className="event-meta">
                    <span className={`type-pill type-${item.type}`}>{item.type}</span>
                    <span>{formatDate(item.occurredAt)}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={`${item.id}-${tag}`} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
              {!eventsLoading && latestEvents.length === 0 ? (
                <p className="state-copy">No events yet. Queue one from the form above.</p>
              ) : null}
            </div>
          </div>

          <div className="panel-group">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Search</p>
                <h2>Explore Indexed Events</h2>
              </div>
              <button className="ghost-button" onClick={() => void loadSearchResults(searchState)}>
                Refresh search
              </button>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="field-row">
                <label>
                  Keyword
                  <input
                    value={searchState.keyword}
                    onChange={(event) =>
                      setSearchState((current) => ({
                        ...current,
                        keyword: event.target.value,
                      }))
                    }
                    placeholder="redis ttl"
                  />
                </label>
                <label>
                  Type
                  <select
                    value={searchState.type}
                    onChange={(event) =>
                      setSearchState((current) => ({
                        ...current,
                        type: event.target.value as EventType | "",
                      }))
                    }
                  >
                    <option value="">all</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field-row">
                <label>
                  Tags
                  <input
                    value={searchState.tags}
                    onChange={(event) =>
                      setSearchState((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                    placeholder="backend, redis"
                  />
                </label>
                <label>
                  From
                  <input
                    type="date"
                    value={searchState.from}
                    onChange={(event) =>
                      setSearchState((current) => ({
                        ...current,
                        from: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={searchState.to}
                    onChange={(event) =>
                      setSearchState((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="panel-actions">
                <button className="primary-button" type="submit" disabled={searchLoading}>
                  {searchLoading ? "Searching..." : "Run search"}
                </button>
                <span className="muted-copy">{searchResult.total} hits</span>
              </div>
            </form>

            {searchError ? <p className="error-text">{searchError}</p> : null}

            <div className="event-list">
              {searchResult.items.map((item) => (
                <article key={`${item.id ?? item.title}-search`} className="event-card">
                  <div className="event-meta">
                    <span className={`type-pill type-${item.type}`}>{item.type}</span>
                    <span>{item.source}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={`${item.id}-${tag}-search`} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
              {!searchLoading && searchResult.items.length === 0 ? (
                <p className="state-copy">No indexed events matched this search.</p>
              ) : null}
            </div>
          </div>

          <div className="panel-group analytics-group">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Analytics</p>
                <h2>Pattern View</h2>
              </div>
            </div>

            <form className="analytics-form" onSubmit={handleAnalytics}>
              <div className="field-row">
                <label>
                  User ID
                  <input
                    value={analyticsState.userId}
                    onChange={(event) =>
                      setAnalyticsState((current) => ({
                        ...current,
                        userId: event.target.value,
                      }))
                    }
                    placeholder="user_1"
                  />
                </label>
                <label>
                  From
                  <input
                    type="date"
                    value={analyticsState.from}
                    onChange={(event) =>
                      setAnalyticsState((current) => ({
                        ...current,
                        from: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={analyticsState.to}
                    onChange={(event) =>
                      setAnalyticsState((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="panel-actions">
                <button className="primary-button" type="submit" disabled={analyticsLoading}>
                  {analyticsLoading ? "Loading..." : "Refresh analytics"}
                </button>
              </div>
            </form>

            {analyticsError ? <p className="error-text">{analyticsError}</p> : null}

            <div className="analytics-layout">
              <div className="chart-panel">
                <div className="chart-header">
                  <h3>Events per day</h3>
                  <p>Actual occurrence dates, not ingestion timestamps.</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={analytics?.eventsPerDay ?? []}>
                    <defs>
                      <linearGradient id="eventCountFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f25c54" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f25c54" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#d7ded6" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f25c54"
                      fill="url(#eventCountFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-panel">
                <div className="chart-header">
                  <h3>Top tags</h3>
                  <p>Most frequent labels in the selected range.</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics?.topTagItem ?? []} layout="vertical">
                    <CartesianGrid stroke="#d7ded6" strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="tag"
                      width={90}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2a9d8f" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {!analyticsLoading &&
            !analyticsError &&
            analytics &&
            analytics.eventsPerDay.length === 0 &&
            analytics.topTagItem.length === 0 ? (
              <p className="state-copy">
                No analytics data matched the current filters yet.
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function splitTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default App;
