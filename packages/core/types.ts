/**
 * OpenClaw Architect — Core Gateway Types
 * Based on the OpenClaw hub-and-spoke architecture
 */

// ─── Session Types ────────────────────────────────────────────────────────────

export type SessionMode = "main" | "group" | "workspace";
export type ActivationMode = "always-on" | "mention-gated" | "keyword-gated";
export type QueueMode = "serial" | "parallel" | "priority";

export interface Session {
  id: string;
  mode: SessionMode;
  activation: ActivationMode;
  queue: QueueMode;
  workspace: string;
  channel: string;
  createdAt: Date;
  lastActive: Date;
  metadata: Record<string, unknown>;
}

// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MediaType = "image" | "audio" | "video" | "file";

export interface InboundMessage {
  id: string;
  sessionId: string;
  channel: string;
  from: string;
  content: string;
  media?: MediaAttachment[];
  timestamp: Date;
  isGroup: boolean;
  groupId?: string;
  replyTo?: string;
}

export interface OutboundMessage {
  sessionId: string;
  channel: string;
  to: string;
  content: string;
  media?: MediaAttachment[];
  replyTo?: string;
  chunkStrategy?: "auto" | "none" | "forced";
}

export interface MediaAttachment {
  type: MediaType;
  url?: string;
  base64?: string;
  mimeType: string;
  filename?: string;
  size?: number;
}

// ─── Gateway Config ───────────────────────────────────────────────────────────

export interface GatewayConfig {
  host: string; // Should always be 127.0.0.1 (not 0.0.0.0)
  port: number; // Default: 18789
  auth: {
    token?: string;
    enabled: boolean;
  };
  channels: Record<string, ChannelConfig>;
  workspaces: Record<string, WorkspaceConfig>;
}

export interface ChannelConfig {
  enabled: boolean;
  workspace: string;
  activation: ActivationMode;
  groupMode?: ActivationMode;
  credentials?: Record<string, string>;
}

export interface WorkspaceConfig {
  name: string;
  model: string; // e.g. "claude-sonnet-4-20250514", "gpt-4o", "ollama/llama3"
  soulPath?: string; // Path to SOUL.md
  agentsPath?: string; // Path to AGENTS.md
  toolsPath?: string; // Path to TOOLS.md
}

// ─── Channel Adapter Interface ────────────────────────────────────────────────

export type MessageHandler = (message: InboundMessage) => Promise<void>;

export interface ChannelAdapter {
  name: string;
  connect(config: ChannelConfig): Promise<void>;
  disconnect(): Promise<void>;
  onMessage(handler: MessageHandler): void;
  send(message: OutboundMessage): Promise<void>;
  sendMedia(media: OutboundMessage): Promise<void>;
  getStatus(): "connected" | "disconnected" | "error";
}

// ─── Tool Types ───────────────────────────────────────────────────────────────

export type ToolPermission =
  | "files:read"
  | "files:write"
  | "network:fetch"
  | "shell:exec"
  | "browser:control"
  | "browser:read"
  | "canvas:push"
  | "sessions:read";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  permissions: ToolPermission[];
}

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ToolResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
}

// ─── Skill Interface ──────────────────────────────────────────────────────────

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  permissions: ToolPermission[];
  tools: string[];
  author?: string;
}

export interface SkillContext {
  session: Session;
  workspacePath: string;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}

// ─── Agent RPC Types ──────────────────────────────────────────────────────────

export interface AgentRequest {
  sessionId: string;
  messages: AgentMessage[];
  tools: ToolDefinition[];
  model: string;
  streamCallback?: (chunk: string) => void;
}

export interface AgentMessage {
  role: MessageRole;
  content: string | AgentContentBlock[];
}

export interface AgentContentBlock {
  type: "text" | "tool_use" | "tool_result" | "image";
  text?: string;
  toolUseId?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  imageData?: string;
  imageMimeType?: string;
}

export interface AgentResponse {
  message: AgentMessage;
  toolCalls?: ToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}
