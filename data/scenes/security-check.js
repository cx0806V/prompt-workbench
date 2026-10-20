/** 场景：安全自查 */
export default {
  id: 'security-check',
  title: '帮我做一次安全自查',
  category: '开发',
  icon: '🔐',
  whenToUse: '项目要公开、要给同学/客户用、或者代码里有 key 和用户数据。',
  keywords: ['安全', '自查', '泄露', 'key', '权限', '注入', '隐私', 'xss'],
  questions: [
    {
      key: 'target',
      ask: '要自查什么？代码 / 部署配置 / 接口 / 依赖 / key 管理。',
      why: '安全范围太大，必须先圈定。',
      required: true,
      examples: ['一个要公开的纯前端网页 + 一个 Cloudflare Worker'],
    },
    {
      key: 'exposure',
      ask: '谁会访问它？公开互联网 / 班内 / 只有自己。会不会被爬、被刷。',
      why: '公开程度决定风险等级。',
      required: true,
      examples: ['会发到群里，几百人可能点，也可能被搜索引擎抓到'],
    },
    {
      key: 'data',
      ask: '有什么敏感数据？key、token、手机号、用户内容。存在哪。',
      why: '数据在哪，泄露面就在哪。',
      required: true,
      examples: ['前端不能有 key；用户填的内容只存在 localStorage'],
    },
    {
      key: 'stack',
      ask: '技术栈和部署方式，以及最近改过什么。',
      why: '「最近改过什么」是漏洞最常见的入口。',
      required: false,
      examples: ['纯前端 + Worker 代理，最近加了 API 调用'],
    },
  ],
  template: `你是一位应用安全审计员。给我按风险排序的清单，每一项都要能验证，不要说「注意安全」。

## 自查范围
{{target}}

## 暴露面
{{exposure}}

## 敏感数据
{{data}}

## 技术栈
{{stack}}

## 输出要求
1. **必须立刻做的 3 件事**：如果不做，明天就可能出事的。
2. 风险清单，按 🔴高 / 🟡中 / ⚪低 分组，每条包含：
   - 风险点（具体到文件/配置/接口）
   - 攻击者会怎么利用（一句话）
   - **验证方法**（我怎么自己确认它是不是真的有问题）
   - 修复方式（最小改动）
3. 最后给「这次不用管」的清单，说明为什么风险可接受。
4. 涉及前端 key、CORS、注入、依赖漏洞这几类时必须点名检查，如果没有就写「未发现」。

## 禁止
- 不要输出泛泛的安全原则清单。
- 不要建议我引入大型安全框架来解决小问题。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '风险分级与可验证输出',
      how: '强制每条风险都给「验证方法」，避免只列名词',
    },
    {
      repo: 'ttmouse/requirements-clarifier',
      what: '最少追问 + 默认假设的交互模型',
      how: '借它的「先确认范围再展开」思路，把反问压到 4 个',
    },
  ],
};
