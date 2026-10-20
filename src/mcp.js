/**
 * MCP 协议层：把纯函数核心暴露成工具。
 *
 * 只实现 Streamable HTTP 下最常被用到的 JSON-RPC 方法：
 *   initialize / notifications/initialized / ping / tools/list / tools/call
 * 不依赖任何 SDK，零依赖，Node 与 Cloudflare Workers 都能跑。
 */

import {
  VERSION,
  findScene,
  getQuestionnaire,
  listScenes,
  matchScenes,
  renderPrompt,
} from './core.js';

export const SERVER_NAME = 'prompt-workbench';
export const PROTOCOL_VERSION = '2025-06-18';

export const TOOLS = [
  {
    name: 'list_scenes',
    description:
      '列出提示词工作台里的场景（场景 = 一类任务的标准提问流程 + 成品模板）。可按分类或关键词过滤。',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: '按分类过滤，例如 需求 / 开发 / 写作' },
        keyword: { type: 'string', description: '按关键词过滤' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'recommend_scene',
    description: '用户只给了一句模糊描述时，推荐最匹配的 1–3 个场景。',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '用户的原话，例如「我想做个能自动整理会议记录的小工具」' },
      },
      required: ['text'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_questionnaire',
    description: '取某个场景的提问清单。按顺序逐个问用户，不要一次全部抛给用户。',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: { type: 'string', description: '场景 id，先用 list_scenes 或 recommend_scene 查' },
      },
      required: ['sceneId'],
      additionalProperties: false,
    },
  },
  {
    name: 'render_prompt',
    description:
      '把用户回答的槽位渲染成成品提示词。返回 prompt（给用户复制走）、missing（必填缺失项）、warnings。',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: { type: 'string', description: '场景 id' },
        answers: {
          type: 'object',
          description: '槽位回答，键为 question.key，值为用户的回答原文',
          additionalProperties: { type: 'string' },
        },
      },
      required: ['sceneId', 'answers'],
      additionalProperties: false,
    },
  },
];

function textResult(payload, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

function callTool(scenes, params = {}) {
  const name = params.name;
  const args = params.arguments || {};

  switch (name) {
    case 'list_scenes':
      return textResult({ scenes: listScenes(scenes, args) });
    case 'recommend_scene': {
      const matches = matchScenes(scenes, args.text).slice(0, 3);
      return textResult({ matches, hint: matches.length ? '选一个场景，调用 get_questionnaire' : '没有匹配的场景，可以调用 list_scenes 看看有哪些' });
    }
    case 'get_questionnaire': {
      const questionnaire = getQuestionnaire(scenes, args.sceneId);
      if (!questionnaire) return textResult({ error: `场景不存在：${args.sceneId}` }, true);
      return textResult(questionnaire);
    }
    case 'render_prompt': {
      if (!findScene(scenes, args.sceneId)) {
        return textResult({ error: `场景不存在：${args.sceneId}` }, true);
      }
      const result = renderPrompt(scenes, args.sceneId, args.answers || {});
      return textResult({ ...result, complete: result.missing.length === 0 });
    }
    default:
      return textResult({ error: `未知工具：${name}` }, true);
  }
}

/**
 * 处理一条 JSON-RPC 消息。
 * 返回响应对象；返回 null 表示这是通知（无需响应）。
 */
export function handleMessage(scenes, message) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request' } };
  }
  const { id, method, params } = message;
  const reply = (result) => ({ jsonrpc: '2.0', id: id === undefined ? null : id, result });
  const fail = (code, errorMessage) => ({
    jsonrpc: '2.0',
    id: id === undefined ? null : id,
    error: { code, message: errorMessage },
  });

  if (typeof method !== 'string') return fail(-32600, 'Invalid Request');

  switch (method) {
    case 'initialize':
      return reply({
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: VERSION },
        instructions:
          '这是一个提示词工作台。先 list_scenes 或 recommend_scene 选场景，再 get_questionnaire 取问题，逐个问用户，最后 render_prompt 渲染成品提示词。',
      });
    case 'notifications/initialized':
      return null;
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools: TOOLS });
    case 'tools/call':
      return reply(callTool(scenes, params));
    default:
      return fail(-32601, `Method not found: ${method}`);
  }
}
