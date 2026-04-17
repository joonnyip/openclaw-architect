/**
 * OpenClaw Architect — Gateway Bootstrap
 * Reference implementation of the Gateway WebSocket server
 */

import type {
  GatewayConfig,
  InboundMessage,
  OutboundMessage,
  Session,
  ChannelAdapter,
} from "../../packages/core/types";

// ─── Gateway Class ────────────────────────────────────────────────────────────

export class Gateway {
  private config: GatewayConfig;
  private sessions: Map<string, Session> = new Map();
  private channels: Map<string, ChannelAdapter> = new Map();
  private wsServer: unknown = null;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate config before starting.
   * Warns about dangerous settings (e.g. 0.0.0.0 binding).
   */
  private validateConfig(): void {
    if (this.config.host === "0.0.0.0") {
      console.warn(
        "⚠️  WARNING: Gateway is binding to 0.0.0.0 — this exposes it to your entire network.\n" +
          "   Use 127.0.0.1 unless you have a specific reason and have secured access."
      );
    }
    if (!this.config.auth.enabled || !this.config.auth.token) {
      console.warn(
        "⚠️  WARNING: Auth is disabled or token not set.\n" +
          "   Set auth.token in config and enable auth before exposing WebChat."
      );
    }
  }

  /**
   * Start the Gateway WebSocket server.
   */
  async start(): Promise<void> {
    console.log(
      `🦞 OpenClaw Gateway starting on ws://${this.config.host}:${this.config.port}`
    );

    // Initialize channel adapters
    for (const [name, channelConfig] of Object.entries(this.config.channels)) {
      if (channelConfig.enabled) {
        await this.initChannel(name, channelConfig);
      }
    }

    console.log(`✅ Gateway ready — ${this.channels.size} channels connected`);
  }

  /**
   * Stop the Gateway gracefully.
   */
  async stop(): Promise<void> {
    console.log("🛑 Shutting down Gateway...");
    for (const [name, adapter] of this.channels) {
      await adapter.disconnect();
      console.log(`  Disconnected: ${name}`);
    }
    console.log("Gateway stopped.");
  }

  /**
   * Initialize and connect a channel adapter.
   */
  private async initChannel(name: string, config: unknown): Promise<void> {
    console.log(`  Connecting channel: ${name}`);
    // In the real implementation, dynamically load the adapter module
    // e.g. await import(`@openclaw/channel-${name}`)
    console.log(`  ✅ ${name} connected`);
  }

  /**
   * Route an inbound message to the correct agent session.
   */
  async routeMessage(message: InboundMessage): Promise<void> {
    const session = this.getOrCreateSession(message);

    // Log the inbound message
    console.log(
      `📥 [${message.channel}] ${message.from}: ${message.content.substring(0, 80)}`
    );

    // Dispatch to Pi agent via RPC
    await this.dispatchToAgent(session, message);
  }

  /**
   * Send an outbound message through the appropriate channel.
   */
  async sendMessage(message: OutboundMessage): Promise<void> {
    const adapter = this.channels.get(message.channel);
    if (!adapter) {
      throw new Error(`No adapter found for channel: ${message.channel}`);
    }
    await adapter.send(message);
    console.log(
      `📤 [${message.channel}] → ${message.to}: ${message.content.substring(0, 80)}`
    );
  }

  /**
   * Get existing session or create a new one.
   */
  private getOrCreateSession(message: InboundMessage): Session {
    const sessionKey = `${message.channel}:${message.isGroup ? message.groupId : message.from}`;

    if (!this.sessions.has(sessionKey)) {
      const channelConfig = this.config.channels[message.channel];
      const session: Session = {
        id: sessionKey,
        mode: message.isGroup ? "group" : "main",
        activation: channelConfig?.activation ?? "mention-gated",
        queue: "serial",
        workspace: channelConfig?.workspace ?? "default",
        channel: message.channel,
        createdAt: new Date(),
        lastActive: new Date(),
        metadata: {},
      };
      this.sessions.set(sessionKey, session);
      console.log(`🆕 New session: ${sessionKey}`);
    }

    const session = this.sessions.get(sessionKey)!;
    session.lastActive = new Date();
    return session;
  }

  /**
   * Dispatch message to Pi agent runtime via RPC.
   * In production, this is an actual RPC call to the agent process.
   */
  private async dispatchToAgent(
    session: Session,
    message: InboundMessage
  ): Promise<void> {
    console.log(
      `🤖 Dispatching to agent workspace: ${session.workspace} (session: ${session.id})`
    );
    // Real implementation: await piAgentRPC.call({ session, message });
  }

  /**
   * Get current Gateway status.
   */
  getStatus(): object {
    return {
      host: this.config.host,
      port: this.config.port,
      authEnabled: this.config.auth.enabled,
      sessions: this.sessions.size,
      channels: Object.fromEntries(
        [...this.channels.entries()].map(([name, adapter]) => [
          name,
          adapter.getStatus(),
        ])
      ),
    };
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export async function startGateway(configPath: string): Promise<Gateway> {
  // In real usage: load config from configPath
  const config: GatewayConfig = {
    host: "127.0.0.1", // Always 127.0.0.1 in dev
    port: 18789,
    auth: {
      enabled: true,
      token: process.env.OPENCLAW_TOKEN,
    },
    channels: {},
    workspaces: {
      default: {
        name: "default",
        model: "claude-sonnet-4-20250514",
      },
    },
  };

  const gateway = new Gateway(config);
  await gateway.start();
  return gateway;
}
