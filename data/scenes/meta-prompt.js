/** 场景：元场景——把任何任务变成一段好提示词 */
export default {
  id: 'meta-prompt',
  title: '把我的任务变成一段提示词',
  category: '提示词',
  icon: '🪄',
  whenToUse: '你要让 AI 做一件具体的事，但不知道该怎么开口，或者以前问过效果很一般。',
  keywords: ['提示词', 'prompt', '怎么写', '问ai', '让我提问', '写一段'],
  questions: [
    {
      key: 'task',
      ask: '你要 AI 帮你做什么？一句话，说人话。',
      why: '先有任务，再谈提示词。',
      required: true,
      examples: ['帮我把这段会议记录整理成待办清单'],
    },
    {
      key: 'context',
      ask: 'AI 需要知道什么背景？材料、格式要求、你的身份。',
      why: '模型没有你的上下文，只能猜。',
      required: true,
      examples: ['会议记录 200 字左右，我要按负责人分组，输出 Markdown 表格'],
    },
    {
      key: 'output',
      ask: '你想要什么形状的结果？长度、格式、要不要举例。',
      why: '输出格式是最容易被忽略、又最容易省时间的一项。',
      required: true,
      examples: ['三列：事项 / 负责人 / 截止时间，不超过 10 条'],
    },
    {
      key: 'failure',
      ask: '以前让 AI 做类似的事，它最常在哪出错？',
      why: '把已知的坑写进提示词，比事后返工便宜。',
      required: false,
      examples: ['它会自己编截止时间，还会漏掉没提负责人的事项'],
    },
  ],
  template: `你是一位提示词工程师。请把我下面的需求，写成一段可以直接复制使用的提示词。

## 我的任务
{{task}}

## 背景与材料
{{context}}

## 期望的输出形状
{{output}}

## AI 以前常犯的错
{{failure}}

## 要求
输出的提示词必须包含以下区块，总长不超过 300 字：
1. **角色**：一句话（做什么领域的什么角色）
2. **任务**：要它完成的动作
3. **输入**：用分隔符标出我要提供的内容位置
4. **输出格式**：精确到结构、长度、字段
5. **约束**：不许做什么（针对我提到的常见错误）
6. **自检**：让它在输出前检查一遍什么

最后用一行说明：这段提示词里，哪一句是最关键的。

## 禁止
- 不要写解释性文字，直接给提示词本体。
- 不要在提示词里编造我没提供的材料。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'langgptai/LangGPT',
      what: '结构化提示词模块（Role / Profile / Rules / Workflow）',
      how: '压缩成 6 个必填区块，并要求总长不超过 300 字',
    },
    {
      repo: 'ckelsoe/prompt-architect',
      what: '框架选择 + 评分 + 渐进追问',
      how: '把「以前常犯的错」变成约束区块，替代评分环节',
    },
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '角色、分隔符、输出格式、自检',
      how: '直接落到模板的 6 个区块里',
    },
  ],
};
