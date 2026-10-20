/** 场景：技术选型 / ADR */
export default {
  id: 'tech-select',
  title: '这个技术选型，帮我做决定',
  category: '开发',
  icon: '⚖️',
  whenToUse: '在两个库/框架/方案之间纠结，怕选了之后回不了头。',
  keywords: ['选型', '技术选型', '对比', '选哪个', '框架', '数据库', 'adr', '纠结'],
  questions: [
    {
      key: 'decision',
      ask: '要决定什么？一句话，比如「前端框架选 Vue 还是 React」。',
      why: '把纠结写成选择题，才有可能做决定。',
      required: true,
      examples: ['后端选 Cloudflare D1 还是 Supabase'],
    },
    {
      key: 'options',
      ask: '候选方案有哪些？包括你现在已有的技术栈。',
      why: '「保持现状」也是一个选项，常常最优。',
      required: true,
      examples: ['A. D1（已绑定 Workers）B. Supabase（免费额度大）C. 不做后端'],
    },
    {
      key: 'criteria',
      ask: '最重要的 3 个标准是什么？（成本 / 学习成本 / 生态 / 性能 / 锁定风险）',
      why: '标准不清，对比表就没有意义。',
      required: true,
      examples: ['免费、我能学得会、以后换起来不痛苦'],
    },
    {
      key: 'constraint',
      ask: '有没有硬约束？必须用某个平台、不能花钱、时间只有几天。',
      why: '硬约束常常直接排除一半选项。',
      required: false,
      examples: ['不能花钱，一周内要能上线'],
    },
  ],
  template: `你是一位技术负责人。请按 ADR（架构决策记录）的格式帮我做决定，不要和稀泥。

## 要决定的问题
{{decision}}

## 候选方案
{{options}}

## 我的判断标准
{{criteria}}

## 硬约束
{{constraint}}

## 输出要求
1. **决策建议**：先给结论（选哪个 + 一句话理由）。
2. **对比表**：行是标准，列是候选方案，单元格写具体事实（价格、限额、学习时间），不确定的标「待核实」。
3. **决策依据**：为什么这个标准权重最高，用我的实际约束解释。
4. **后果**：选它之后，我会失去什么（锁定、迁移成本、维护负担）。
5. **放弃的方案**：写清为什么不选，以及什么情况下应该重新考虑它。
6. **验证方式**：在正式采用前，我用一天时间能做的验证试验是什么。

## 禁止
- 不要编造价格、限额、性能数字；不确定就标「待核实」。
- 不要说「都可以，看需求」——必须给推荐。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'ckelsoe/prompt-architect',
      what: '先选框架、再填内容，避免模型泛泛而谈',
      how: '强制用 ADR 框架输出，禁止开放式回答',
    },
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '不确定信息要显式标注',
      how: '表格里所有数字必须标来源或用「待核实」',
    },
  ],
};
