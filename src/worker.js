/**
 * Cloudflare Worker 入口。
 * 部署后：https://<worker>.<account>.workers.dev/mcp
 */

import { allScenes } from '../data/scenes/index.js';
import { VERSION, sceneStats } from './core.js';
import { SERVER_NAME, handleMessage } from './mcp.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === '/health') {
      return json({ ok: true, ...sceneStats(allScenes) });
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return json({
        name: SERVER_NAME,
        version: VERSION,
        what: '跨 AI 的提示词工作台（MCP Server）',
        endpoint: '/mcp',
        tools: ['list_scenes', 'recommend_scene', 'get_questionnaire', 'render_prompt'],
        scenes: sceneStats(allScenes),
      });
    }

    if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
      if (request.method !== 'POST') {
        return json({ error: 'Post JSON-RPC to /mcp' }, 405);
      }
      let message;
      try {
        message = await request.json();
      } catch {
        return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400);
      }
      const response = handleMessage(allScenes, message);
      if (response === null) {
        return new Response(null, { status: 202, headers: CORS });
      }
      return json(response);
    }

    return json({ error: 'Not found' }, 404);
  },
};
