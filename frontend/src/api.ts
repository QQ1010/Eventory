export type EventType = "learning" | "note" | "leetcode" | "activity";

export type EventItem = {
  id?: string;
  userId: string;
  type: EventType;
  title: string;
  content: string;
  tags: string[];
  source: "api" | "cli";
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
};

export type SearchResult = {
  items: EventItem[];
  total: number;
};

export type AnalyticsResult = {
  userId: string;
  eventsPerDay: Array<{
    date: string;
    count: number;
  }>;
  topTagItem: Array<{
    tag: string;
    count: number;
  }>;
};

export type CreateEventPayload = {
  userId: string;
  type: EventType;
  title: string;
  content: string;
  tags?: string[];
  occurredAt?: string;
  metadata?: Record<string, unknown>;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
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
      const errorData = (await response.json()) as { message?: string };
      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      // ignore parse failure and keep generic message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function createEvent(payload: CreateEventPayload): Promise<{
  status: string;
  jobId: string;
}> {
  return request("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEvents(): Promise<EventItem[]> {
  return request("/events");
}

export async function searchEvents(params: {
  keyword?: string;
  tags?: string;
  type?: EventType | "";
  from?: string;
  to?: string;
}): Promise<SearchResult> {
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
  return request<SearchResult>(suffix ? `/search?${suffix}` : "/search");
}

export async function fetchAnalytics(params: {
  userId: string;
  from?: string;
  to?: string;
}): Promise<AnalyticsResult> {
  const query = new URLSearchParams({
    userId: params.userId,
  });

  if (params.from) {
    query.set("from", params.from);
  }
  if (params.to) {
    query.set("to", params.to);
  }

  return request<AnalyticsResult>(`/analytics?${query.toString()}`);
}
