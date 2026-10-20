/** 场景：让 AI 讲清一段代码 */
export default {
  id: 'code-explain',
  title: '让 AI 把这段代码讲清楚',
  category: '开发',
  icon: '📖',
  whenToUse: '接手别人的代码、看开源项目源码、或者自己以前写的代码看不懂了。',
  keywords: ['看懂', '解释', '源码', 'reading', '讲解', '学习', '调用链', '看不懂'],
  questions: [
    {
      key: 'code',
      ask: '把要看的代码贴上来（或给仓库路径 + 入口文件）。',
      why: '讲解必须基于真实代码，不是基于名字猜。',
      required: true,
      examples: ['贴出 src/render.js 全文，约 120 行'],
    },
    {
      key: 'purpose',
      ask: '你为什么读它？要改它、要学它的写法、还是要找 bug。',
      why: '目的不同，讲解的深度和侧重点完全不同。',
      required: true,
      examples: ['我要在它上面加一个功能，得先搞清数据怎么流动'],
    },
    {
      key: 'level',
      ask: '要讲到什么程度？一句话概括 / 逐段讲 / 讲到能自己改。',
      why: '「讲清楚」没有标准，必须自己定。',
      required: true,
      examples: ['讲到我能自己改，关键数据结构要讲明白'],
    },
    {
      key: 'known',
      ask: '你已经看懂哪部分了？哪里开始卡住？',
      why: '从卡点开始讲，比从第一行讲起省一半时间。',
      required: false,
      examples: ['前面配置能看懂，从 handleSubmit 开始不知道数据去哪了'],
    },
  ],
  template: `你是一位善于讲清复杂代码的工程师。讲解要给出证据，不要凭函数名猜。

## 代码
{{code}}

## 我读它的目的
{{purpose}}

## 需要讲到的深度
{{level}}

## 我已经看懂/卡在哪
{{known}}

## 输出要求
1. **一句话结论**：这段代码整体在干什么。
2. **调用链**：从入口到出口，按顺序列出关键函数，每个函数一句话说明它负责什么。
3. **关键数据结构**：列出最重要的 1–3 个对象/变量，说明它的字段从哪来、到哪去。
4. **设计取舍**：这段代码为什么这样组织，有没有明显的替代方案。
5. **可改进点**：只列真正影响维护的 1–2 条。
6. 每一节都用「结论先行 + 代码行号佐证」的写法；如果代码里看不出来，明确说「这里看不出来，需要看 X」。

## 禁止
- 不要逐行翻译代码。
- 不要把没在代码里出现的行为说成事实。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'langgptai/LangGPT',
      what: '结构化提示词模块（Role / Workflow / Output）',
      how: '借它的模块化结构，把讲解拆成结论、调用链、数据结构、取舍四块',
    },
    {
      repo: 'anthropics/prompt-eng-interactive-tutorial',
      what: '要求模型先给结论、再给证据，减少幻觉',
      how: '规定每节必须带行号佐证，看不出来就明说',
    },
  ],
};
