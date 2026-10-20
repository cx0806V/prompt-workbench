# prompt-workbench

> **跨 AI 的提示词工作台：选场景 → 被追问几句 → 拿到一段能直接用的提示词。**
> 一个 MCP Server，Claude / Cursor / CodeBuddy / WorkBuddy / Trae 等支持 MCP 的客户端都能用；
> 同一份场景数据还能生成 Skill 包和网页工作台。

[![CI](https://github.com/cx0806V/prompt-workbench/actions/workflows/ci.yml/badge.svg)](https://github.com/cx0806V/prompt-workbench/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-2025--06--18-blue.svg)](https://modelcontextprotocol.io)

---

## 为什么做这个

大多数人的问题不是「不会写提示词」，是**不知道该问自己哪几句**。

网上的提示词库已经很多了，但它们是「一页页模板」：你要先知道自己缺什么，再去翻对应的那条。
本项目反过来：**先选场景（我要干什么），再让 AI 按固定流程问你 5 个问题，最后把答案渲染成一段成品提示词。**

方法不是凭空来的——是把散落在各家开源项目和提示词工程实践里的做法**蒸馏**成一套场景化流程，
每一处借鉴都写在 [SOURCES.md](SOURCES.md) 里（该文件由场景数据自动生成，不手写）。

## 它解决什么

| 角色 | 得到什么 |
| --- | --- |
| 用 AI 的人 | 不用背模板。选场景 → 回答几个问题 → 复制成品提示词走 |
| AI 客户端 | 4 个标准 MCP 工具，任何支持 MCP 的 AI 都能调用 |
| 开发者 | **新增一个场景 = 加一份数据，不动一行逻辑代码** |

**零依赖、零 API key、零成本**：服务端只做模板渲染，真正的「一步步问」由调用它的那个 AI 完成。

---

## 一键部署（自己的 Cloudflare 账号，免费）

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cx0806V/prompt-workbench)

> ⚠️ 仓库公开后按钮才生效。部署完成后你得到一个自己的地址：
> `https://<worker>.<account>.workers.dev/mcp`
> 免费额度足够个人使用；**推广程度高时建议先部署到自己账号**，避免公共服务被刷。

## 快速开始（本地，30 秒）

```bash
npm start
# http://127.0.0.1:8787/        信息
# http://127.0.0.1:8787/health  健康检查
# http://127.0.0.1:8787/mcp     MCP JSON-RPC 端点
```

不需要 `npm install`——本项目零依赖，Node ≥ 20 直接跑。

```bash
npm test              # 20 项测试
npm run build:sources # 从场景数据重新生成 SOURCES.md
```

## 在 AI 客户端里使用

把下面的地址填进客户端的 MCP 配置（字段名随客户端版本不同，按你客户端的文档改）：

```json
{
  "mcpServers": {
    "prompt-workbench": {
      "type": "http",
      "url": "https://<your-worker>.workers.dev/mcp"
    }
  }
}
```

> 只支持 stdio 的老客户端：用 `mcp-remote` 之类做 HTTP→stdio 桥接。⚠️ 各客户端支持情况以官方文档为准。

典型对话：

> **你**：帮我写份项目总结报告。
> **AI**：*调用 `recommend_scene`* → 匹配到「写作 / 把一句话要求变成写作提示词」，然后调用 `get_questionnaire` 开始逐个问你。

## 工具

| 工具 | 作用 |
| --- | --- |
| `list_scenes` | 列出场景，可按分类/关键词过滤 |
| `recommend_scene` | 只给一句话时，推荐最匹配的 1–3 个场景 |
| `get_questionnaire` | 取某场景的提问清单（**逐个问，不要一次全抛**） |
| `render_prompt` | 把槽位答案渲染成成品提示词，返回 `prompt` / `missing` / `warnings` / `complete` |

## 场景（v0.1 · 3 个示例）

| 场景 | 分类 | 解决的问题 |
| --- | --- | --- |
| 🎯 把模糊需求说清楚 | 需求 | 想法说不清、需求只有一句话 |
| 🛠️ 把任务变成 AI 能执行的开发任务 | 开发 | 交给 AI 写代码时边界不清、乱改 |
| ✍️ 把一句话要求变成写作提示词 | 写作 | 直接丢给 AI，写出来又空又套话 |

> 场景目录还在扩充（目标 20 个）。**新增场景只需要加一份数据文件**，见下。

## 加一个场景（约 30 行，0 行逻辑）

1. 在 `data/scenes/` 新建 `your-scene.js`：导出包含 `id / title / category / whenToUse / keywords / questions / template / sources` 的对象；
2. 在 `data/scenes/index.js` 里 import 并加进数组；
3. `npm test` —— 测试会自动校验：id 合法、`questions[].key` 在模板里有 `{{占位符}}`、`sources` 非空。

```js
export default {
  id: 'your-scene',
  title: '场景名',
  category: '分类',
  whenToUse: '什么时候用',
  keywords: ['关键词'],
  questions: [{ key: 'goal', ask: '你的问题文案', required: true, examples: ['示例'] }],
  template: '你是……\n## 已知信息\n- 目标：{{goal}}',
  sources: [{ repo: '借鉴的项目', what: '借鉴了什么', how: '我改了什么' }],
};
```

## 架构：一份核心，多个壳

```
data/scenes/*.js   场景库（数据）           ← 蒸馏产物，唯一内容源
src/core.js        纯函数引擎（无平台 API） ← 校验 / 匹配 / 渲染，可单测
src/mcp.js         MCP 协议层（零依赖）
src/worker.js      Cloudflare Worker 壳
bin/serve.mjs      本地 Node 壳（同一套 handler）
scripts/           从数据生成 SOURCES.md 等
tests/             零依赖测试（node --test）
```

**三条硬规则（防屎山）：**
1. **场景 = 数据，不是代码。** 新增场景 0 行 UI/逻辑代码。
2. **`core.js` 不碰平台 API。** 因此能单测、能被三个壳复用。
3. **来源由数据生成。** `sources` 是每个场景的必填字段，`SOURCES.md` 从它生成，不能手改。

## 路线图

- [x] 核心引擎 + MCP Server（零依赖）
- [x] 3 个示例场景 + 20 项测试
- [ ] 20 个场景（蒸馏清单进行中）
- [ ] Skill 包自动生成（同一份数据 → Claude / WorkBuddy Skill）
- [ ] 网页工作台（左侧对话 + 右侧定义卡实时生长）
- [ ] 实测「哪些 AI 客户端能连上」并写进文档

## 来源与致谢

见 **[SOURCES.md](SOURCES.md)**。借鉴的是思路与结构，不是代码；各项目代码许可证以各自仓库为准。

## License

[MIT](LICENSE)
