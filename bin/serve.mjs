/**
 * 本地开发服务器：和 Worker 走同一套 handleMessage，不引入任何依赖。
 *   npm start
 *   POST http://127.0.0.1:8787/mcp
 */

import http from 'node:http';
import { allScenes } from '../data/scenes/index.js';
import { VERSION, sceneStats } from '../src/core.js';
import { SERVER_NAME, handleMessage } from '../src/mcp.js';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'content-type': contentType, ...CORS });
  res.end(JSON.stringify(body, null, 2));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { ok: true, ...sceneStats(allScenes) });
  }

  if (req.method === 'GET' && url.pathname === '/') {
    return send(res, 200, {
      name: SERVER_NAME,
      version: VERSION,
      endpoint: '/mcp',
      tools: ['list_scenes', 'recommend_scene', 'get_questionnaire', 'render_prompt'],
      scenes: sceneStats(allScenes),
    });
  }

  if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
    if (req.method !== 'POST') return send(res, 405, { error: 'Post JSON-RPC to /mcp' });
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      let message;
      try {
        message = JSON.parse(raw || '{}');
      } catch {
        return send(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
      }
      const response = handleMessage(allScenes, message);
      if (response === null) {
        res.writeHead(202, CORS);
        return res.end();
      }
      return send(res, 200, response);
    });
    return;
  }

  return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`prompt-workbench ${VERSION} — ${allScenes.length} 个场景`);
  console.log(`  http://${HOST}:${PORT}/        (信息)`);
  console.log(`  http://${HOST}:${PORT}/health  (健康检查)`);
  console.log(`  http://${HOST}:${PORT}/mcp     (MCP JSON-RPC 端点)`);
});
