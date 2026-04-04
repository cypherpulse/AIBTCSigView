const BASE_URL = import.meta.env.VITE_AIBTC_API_BASE_URL ?? "https://aibtc.news/api";
const HIRO_API = import.meta.env.VITE_HIRO_API_BASE_URL ?? "https://api.mainnet.hiro.so";

const STX_ADDRESS_REGEX = /^S[PM][A-Z0-9]{20,}$/i;
const BTC_ADDRESS_REGEX = /^(bc1|[13])[a-zA-Z0-9]{20,}$/i;

function isLikelyPlaceholderAddress(address: string): boolean {
  const cleaned = address.trim();
  return cleaned.includes("...") || cleaned.length < 20;
}

function isSupportedAddress(address: string): boolean {
  const cleaned = address.trim();
  return STX_ADDRESS_REGEX.test(cleaned) || BTC_ADDRESS_REGEX.test(cleaned);
}

export interface Signal {
  id: string | number;
  headline?: string;
  body?: string;
  content?: string;
  beat?: string;
  beat_slug?: string;
  beatSlug?: string;
  status?: string;
  tags?: string[];
  sources?: Array<{ url: string; title?: string }>;
  disclosure?: string;
  publisherFeedback?: string;
  timestamp?: string;
  createdAt?: string;
  pacificDate?: string;
  correction_of?: string | null;
  [key: string]: unknown;
}

interface SignalsResponse {
  signals: Signal[];
  [key: string]: unknown;
}

export interface AgentInfoResponse {
  found: boolean;
  address?: string;
  addressType?: string;
  level?: number;
  levelName?: string;
  capabilities?: string[];
  checkIn?: {
    lastCheckInAt?: string;
    checkInCount?: number;
    [key: string]: unknown;
  };
  activity?: {
    lastActiveAt?: string;
    unreadInboxCount?: number;
    sentCount?: number;
    [key: string]: unknown;
  };
  agent: {
    stxAddress?: string;
    btcAddress?: string;
    displayName?: string;
    description?: string;
    owner?: string;
    verifiedAt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function extractFirstString(
  source: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function findAddressByKey(obj: unknown, keyPattern: RegExp, valuePattern: RegExp): string | undefined {
  if (!isRecord(obj)) return undefined;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && keyPattern.test(key) && valuePattern.test(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const match = findAddressByKey(item, keyPattern, valuePattern);
        if (match) return match;
      }
      continue;
    }

    if (isRecord(value)) {
      const match = findAddressByKey(value, keyPattern, valuePattern);
      if (match) return match;
    }
  }

  return undefined;
}

function normalizeAgentInfo(raw: unknown, inputAddress: string): AgentInfoResponse {
  const root = isRecord(raw) ? raw : {};
  const nestedAgent = isRecord(root.agent) ? root.agent : root;

  const stxAddress =
    extractFirstString(nestedAgent, ["stxAddress", "stx_address", "stx", "stacksAddress"]) ??
    extractFirstString(root, ["stxAddress", "stx_address", "stx", "stacksAddress"]) ??
    findAddressByKey(root, /stx|stacks/i, STX_ADDRESS_REGEX) ??
    (STX_ADDRESS_REGEX.test(inputAddress) ? inputAddress : undefined);

  const btcAddress =
    extractFirstString(nestedAgent, ["btcAddress", "btc_address", "address", "paymentAddress"]) ??
    extractFirstString(root, ["btcAddress", "btc_address", "address", "paymentAddress"]) ??
    findAddressByKey(root, /btc|bitcoin|payment/i, BTC_ADDRESS_REGEX) ??
    (BTC_ADDRESS_REGEX.test(inputAddress) ? inputAddress : undefined);

  const displayName =
    extractFirstString(nestedAgent, ["displayName", "name", "agentName"]) ??
    extractFirstString(root, ["displayName", "name", "agentName"]);

  const description =
    extractFirstString(nestedAgent, ["description", "bio"]) ??
    extractFirstString(root, ["description", "bio"]);

  const capabilities = Array.isArray(root.capabilities)
    ? root.capabilities.filter((v): v is string => typeof v === "string")
    : Array.isArray(nestedAgent.capabilities)
      ? nestedAgent.capabilities.filter((v): v is string => typeof v === "string")
      : [];

  return {
    ...root,
    address: extractFirstString(root, ["address", "btcAddress", "stxAddress"]),
    addressType: extractFirstString(root, ["addressType"]),
    level: typeof root.level === "number" ? root.level : undefined,
    found: typeof root.found === "boolean" ? root.found : Boolean(displayName || stxAddress || btcAddress),
    levelName:
      (typeof root.levelName === "string" ? root.levelName : undefined) ??
      (typeof nestedAgent.levelName === "string" ? nestedAgent.levelName : undefined),
    capabilities,
    checkIn: isRecord(root.checkIn) ? (root.checkIn as AgentInfoResponse["checkIn"]) : undefined,
    activity: isRecord(root.activity) ? (root.activity as AgentInfoResponse["activity"]) : undefined,
    agent: {
      ...nestedAgent,
      stxAddress,
      btcAddress,
      displayName,
      description,
      owner: extractFirstString(nestedAgent, ["owner"]),
      verifiedAt: extractFirstString(nestedAgent, ["verifiedAt"]),
    },
  };
}

function normalizeSignal(raw: Record<string, unknown>): Signal {
  const rawSources = Array.isArray(raw.sources) ? raw.sources : [];
  const sources = rawSources.reduce<Array<{ url: string; title?: string }>>((acc, source) => {
    if (typeof source === "string") {
      acc.push({ url: source });
      return acc;
    }

    if (source && typeof source === "object") {
      const typed = source as Record<string, unknown>;
      if (typeof typed.url === "string") {
        acc.push(
          typeof typed.title === "string"
            ? { url: typed.url, title: typed.title }
            : { url: typed.url }
        );
      }
    }

    return acc;
  }, []);

  const rawStatus = typeof raw.status === "string" ? raw.status.toLowerCase() : undefined;
  const status =
    rawStatus === "submitted"
      ? "pending"
      : rawStatus === "brief_included"
        ? "brief"
        : rawStatus;

  return {
    ...raw,
    id: (raw.id ?? "") as string | number,
    body: (raw.body ?? raw.content) as string | undefined,
    content: (raw.content ?? raw.body) as string | undefined,
    beat: (raw.beat ?? raw.beat_slug) as string | undefined,
    beat_slug: (raw.beat_slug ?? raw.beat) as string | undefined,
    beatSlug: (raw.beatSlug ?? raw.beat_slug ?? raw.beat) as string | undefined,
    status,
    sources,
    timestamp: (raw.timestamp ?? raw.createdAt) as string | undefined,
    createdAt: (raw.createdAt ?? raw.timestamp) as string | undefined,
    pacificDate: raw.pacificDate as string | undefined,
    correction_of: (raw.correction_of ?? null) as string | null,
  };
}

export async function fetchAgentInfo(address: string): Promise<AgentInfoResponse> {
  const cleaned = address.trim();
  if (!cleaned || isLikelyPlaceholderAddress(cleaned) || !isSupportedAddress(cleaned)) {
    return normalizeAgentInfo({ found: false }, cleaned);
  }

  const encoded = encodeURIComponent(cleaned);
  const res = await fetch(`/api/agents/${encoded}`);
  if (res.status === 404) {
    return normalizeAgentInfo({ found: false }, cleaned);
  }
  if (!res.ok) {
    throw new Error(`Agent lookup failed (${res.status})`);
  }
  const json = await res.json();
  return normalizeAgentInfo(json, cleaned);
}

export async function fetchAgentStatus(address: string) {
  const cleaned = address.trim();
  if (!cleaned || isLikelyPlaceholderAddress(cleaned) || !isSupportedAddress(cleaned)) {
    return {};
  }
  const res = await fetch(`${BASE_URL}/status/${encodeURIComponent(cleaned)}`);
  if (!res.ok) return {};
  return res.json();
}

export async function fetchSignals(params: {
  agent?: string;
  beat?: string;
  tag?: string;
  since?: string;
  limit?: number;
}): Promise<SignalsResponse> {
  const searchParams = new URLSearchParams();
  if (params.agent) searchParams.set("agent", params.agent);
  if (params.beat) searchParams.set("beat", params.beat);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.since) searchParams.set("since", params.since);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const res = await fetch(`${BASE_URL}/signals?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch signals");
  const json = await res.json();
  const rawSignals = Array.isArray(json?.signals)
    ? json.signals
    : Array.isArray(json?.data)
      ? json.data
      : [];

  return {
    ...json,
    signals: rawSignals
      .filter((item: unknown): item is Record<string, unknown> => !!item && typeof item === "object")
      .map(normalizeSignal),
  };
}

export async function fetchSignalById(id: string): Promise<Signal> {
  const res = await fetch(`${BASE_URL}/signals/${id}`);
  if (!res.ok) throw new Error("Failed to fetch signal");
  const json = await res.json();
  const rawSignal = (json?.signal ?? json) as unknown;
  if (!rawSignal || typeof rawSignal !== "object") {
    throw new Error("Invalid signal response");
  }
  return normalizeSignal(rawSignal as Record<string, unknown>);
}

export async function fetchCorrespondents() {
  const res = await fetch(`${BASE_URL}/correspondents`);
  if (!res.ok) throw new Error("Failed to fetch correspondents");
  return res.json();
}

export async function fetchEarnings(address: string) {
  const cleaned = address.trim();
  if (!cleaned || isLikelyPlaceholderAddress(cleaned) || !isSupportedAddress(cleaned)) {
    return { earnings: [], summary: {} };
  }
  const res = await fetch(`${BASE_URL}/earnings/${encodeURIComponent(cleaned)}`);
  if (!res.ok) return { earnings: [], summary: {} };
  return res.json();
}

export async function fetchStxBalances(stxAddress: string) {
  const cleaned = stxAddress.trim();
  if (!STX_ADDRESS_REGEX.test(cleaned)) {
    return { stx: { balance: "0" }, fungible_tokens: {} };
  }
  const res = await fetch(`${HIRO_API}/extended/v1/address/${encodeURIComponent(cleaned)}/balances`);
  if (!res.ok) return { stx: { balance: "0" }, fungible_tokens: {} };
  return res.json();
}
