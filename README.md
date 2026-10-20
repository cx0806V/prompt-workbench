# prompt-workbench

> **跨 AI 的提示词工作台：选场景 → 被追问几句 → 拿到一段能直接用的提示词。**
> 一个 MCP Server，Claude / Cursor / CodeBuddy / WorkBuddy / Trae 等支持 MCP 的客户端都能用；
> 同一份场景数据还能生成 Skill 包和网页工作台。

[![CI](https://github.com/cx0806V/prompt-workbench/actions/workflows/ci.yml/badge.svg)](https://github.com/cx0806V/prompt-workbench/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-2025--06--18-blue.svg)](https://modelcontextprotocol.io)

> **线上服务已上线**：`https://prompt-workbench.cx200809-2022.workers.dev`
> 直接打开 `/health` 可看到 `{"ok":true,"sceneCount":20}`，MCP 端点是 `/mcp`。可以自建（一键部署见下），也可以直接用这个公共实例。

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
npm run bundle        # 打成单文件 Worker（dist/worker.js）
```

### 手动部署（不需要 npm / wrangler / Git 集成）

如果 Deploy 按钮或 Git 集成不可用，这条命令可以绕过它们，直接把 Worker 传到 Cloudflare：

```powershell
$env:CF_API_TOKEN = "你的令牌"      # 权限：Account → Workers Scripts → Edit
$env:CF_ACCOUNT_ID = "你的账户ID"
npm run deploy
```

脚本会：打包 → 上传 script → 开启 `workers.dev` 访问，全程无交互。

### 自动部署（push 即上线）

仓库自带 `.github/workflows/ci.yml`：**push 到 `main` 时先跑测试，测试通过后自动部署**。

只需要在 GitHub 里配两个 Secret（`Settings → Secrets and variables → Actions → New repository secret`）：

| Secret | 值 |
| --- | --- |
| `CF_API_TOKEN` | Cloudflare API 令牌（权限：Account → Workers Scripts → Edit） |
| `CF_ACCOUNT_ID` | 你的 Cloudflare 账户 ID |

没配 Secret 时不会报错，只会跳过部署、只跑测试。

## 在 AI 客户端里使用

把下面的地址填进客户端的 MCP 配置（字段名随客户端版本不同，按你客户端的文档改）：

```json
{
  "mcpServers": {
    "prompt-workbench": {
      "type": "http",
      "url": "https://prompt-workbench.cx200809-2022.workers.dev/mcp"
    }
  }
}
```

> 只支持 stdio 的老客户端：用 `mcp-remote` 之类做 HTTP→stdio 桥接。⚠️ 各客户端支持情况以官方文档为准。
> 想用自己部署的实例，把 URL 换成你的 `<worker>.<子域>.workers.dev/mcp`。

典型对话：

> **你**：帮我写份项目总结报告。
> **AI**：*调用 `recommend_scene`* → 匹配到「写作 / 把一句话要求变成写作提示词」，然后调用 `get_questionnaire` 开始逐个问你。

## 作为 Skill 安装（离线兜底，不需要 MCP）

仓库里的 [`skills/prompt-workbench/`](skills/prompt-workbench) 是**从同一份场景数据自动生成**的 Skill 包（23 个文件 / 33 KB）：

```
skills/prompt-workbench/
├─ SKILL.md                        # 流程与规则（渐进式披露的入口）
└─ references/
   ├─ scenes-index.md              # 20 个场景索引
   ├─ sources.md                   # 来源与致谢
   └─ scenes/<id>.md               # 每个场景的问题清单 + 模板 + 来源
```

**装进 Claude Code / CodeBuddy**（把整个目录拷到 skills 目录）：

```powershell
# Windows
Copy-Item -Recurse skills\prompt-workbench "$env:USERPROFILE\.claude\skills\"
```
```bash
# macOS / Linux
cp -r skills/prompt-workbench ~/.claude/skills/
```

装好后在对话里说「帮我把这个需求说清楚」，Skill 会按场景逐个提问并渲染提示词。

**WorkBuddy / 其他平台**：把 `SKILL.md` 作为技能说明、`references/` 作为知识文件提交到对应平台。⚠️ 各平台技能格式与审核规则不同，以官方文档为准。

**生成方式（不要手改）**：

```bash
npm run build:skills
```

CI 会重新生成并比对：**技能包和场景数据不一致就会失败**，所以不存在「场景改了、Skill 忘了更新」的漂移。

## 工具

| 工具 | 作用 |
| --- | --- |
| `list_scenes` | 列出场景，可按分类/关键词过滤 |
| `recommend_scene` | 只给一句话时，推荐最匹配的 1–3 个场景 |
| `get_questionnaire` | 取某场景的提问清单（**逐个问，不要一次全抛**） |
| `render_prompt` | 把槽位答案渲染成成品提示词，返回 `prompt` / `missing` / `warnings` / `complete` |

## 场景（v0.1 · 20 个）

| 场景 | 分类 | 解决的问题 |
| --- | --- | --- |
| 🎯 把模糊需求说清楚 | 需求 | 想法说不清、需求只有一句话 |
| 🛠️ 把任务变成 AI 能执行的开发任务 | 开发 | 交给 AI 写代码时边界不清、乱改 |
| 🐛 报错了，帮我定位 | 开发 | 卡在报错上，不知道从哪查 |
| 🔍 帮我审这段代码 | 开发 | 写完不确定质量，合并前想被挑一遍 |
| 🧱 这段代码该重构了，给个计划 | 开发 | 越改越难受，但不敢动 |
| 🧪 帮我想测试用例 | 开发 | 功能写完了不知道测什么、怕漏边界 |
| 🔌 要对接第三方 API，怎么开始 | 开发 | 文档看着头大，key 和失败处理都没想清 |
| 📖 让 AI 把这段代码讲清楚 | 开发 | 看不懂别人的代码 / 自己的旧代码 |
| 📝 把这个 bug 写成能复现的 issue | 开发 | 只会说「它坏了」，别人没法复现 |
| ⚡ 它太慢了，怎么优化 | 开发 | 不知道瓶颈在哪，怕瞎改 |
| 🔐 帮我做一次安全自查 | 开发 | 要公开/给别人用，怕泄露 key 和数据 |
| 🚀 部署上线（带自动测试） | 开发 | 本地能跑，不知道怎么发布、每次手动易漏 |
| ⚖️ 技术选型，帮我做决定 | 开发 | 两个方案纠结，怕回不了头 |
| 🤖 把任务交给 AI Agent 执行 | 开发 | 怕 Agent 乱改文件 |
| 📊 这堆数据，帮我分析出结论 | 数据 | 有表格但不知道说明什么 |
| 🧭 调研这几个东西，给个结论 | 调研 | 看不完 20 篇文章还不知道结论 |
| 🎓 帮我排一个学新技术的计划 | 学习 | 一打开教程就迷路，学完不会用 |
| 📚 帮我写技术文档 / README | 写作 | 项目要给人看但没有文档 |
| ✍️ 把一句话要求变成写作提示词 | 写作 | 直接丢给 AI，写出来又空又套话 |
| 🪄 把我的任务变成一段提示词 | 提示词 | 不知道怎么开口，或者以前效果一般 |

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
- [x] **20 个场景** + 20 项测试（场景数据改动会被测试自动校验）
- [x] 来源自动生成（`SOURCES.md`）
- [ ] Skill 包自动生成（同一份数据 → Claude / WorkBuddy Skill）
- [ ] 网页工作台（左侧对话 + 右侧定义卡实时生长）
- [ ] 实测「哪些 AI 客户端能连上」并写进文档

## 来源与致谢

见 **[SOURCES.md](SOURCES.md)**。借鉴的是思路与结构，不是代码；各项目代码许可证以各自仓库为准。

## License

[MIT](LICENSE)
