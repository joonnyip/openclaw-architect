/**
 * OpenClaw Skill Template
 * Replace this with your own implementation.
 */

import type { SkillContext, ToolResult } from "../../packages/core/types";

/**
 * fetch_data — example tool that fetches JSON from a URL
 *
 * Permissions required: network:fetch
 */
export async function fetch_data(
  ctx: SkillContext,
  params: { url: string; field?: string }
): Promise<ToolResult> {
  ctx.logger.info(`fetch_data called with url=${params.url}`);

  try {
    const response = await fetch(params.url);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Optionally extract a specific field
    const output = params.field ? data[params.field] : data;

    return {
      success: true,
      output,
    };
  } catch (error) {
    ctx.logger.error(`fetch_data failed: ${error}`);
    return {
      success: false,
      error: String(error),
    };
  }
}
