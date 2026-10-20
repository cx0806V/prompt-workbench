/** 场景：学习新技术计划 */
export default {
  id: 'learn-tech',
  title: '帮我排一个学新技术的计划',
  category: '学习',
  icon: '🎓',
  whenToUse: '想学一个新东西（语言/框架/工具），但一打开教程就迷路，学完又不会用。',
  keywords: ['学习', '计划', '入门', '教程', '学会', '新技术', '自学', '路线'],
  questions: [
    {
      key: 'target',
      ask: '要学什么？具体到版本或具体用法。',
      why: '「学 Python」和「用 Python 处理 Excel」是两件事。',
      required: true,
      examples: ['学 Node + 写一个能跑的命令行工具'],
    },
    {
      key: 'background',
      ask: '你现在已会什么？哪些相关的基础有、哪些没有。',
      why: '决定从哪一层开始讲，避免重复或跳步。',
      required: true,
      examples: ['会 HTML/CSS/一点 JS，没写过后端，没用过命令行'],
    },
    {
      key: 'time',
      ask: '每天能投入多少时间？能持续多少天。',
      why: '计划必须放进真实时间是可行的。',
      required: true,
      examples: ['每天 1 小时，两周'],
    },
    {
      key: 'goal',
      ask: '做到什么算学会？给一个能交付的产物。',
      why: '「学会」没有标准，产物才有。',
      required: true,
      examples: ['能独立写出一个读 CSV 并输出统计的命令行工具'],
    },
  ],
  template: `你是一位带过很多新人的工程师。请按我的真实时间和基础排计划，不要给我一堆教程链接。

## 要学的东西
{{target}}

## 我的基础
{{background}}

## 每天可投入时间 / 周期
{{time}}

## 学会的标准
{{goal}}

## 输出要求
1. **第一步先做什么**：只给一个动作，今天就能做（≤30 分钟）。
2. **阶段计划**：拆成 3–4 个阶段，每阶段包含：
   - 要解决的问题（为什么学这块）
   - 每天做什么（一天一件事，不要「看第 1–3 章」）
   - **可验证的产物**（能跑的东西 / 能输出的结果）
3. **最常见的坑**：3 条，每条给「出现什么现象就说明掉坑了」。
4. **检验方式**：怎么在不看教程的情况下，验证自己真的学会了。
5. 明确说明：哪些内容这个阶段**先不学**，为什么。

## 禁止
- 不要推荐超过 3 个资源链接。
- 不要给「7 天精通」这种不现实的安排。
- 不要把「看教程」当成一个阶段的产物。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '从基础到进阶的分层路径',
      how: '借「分层学习」结构，但把每一层绑上可验证产物',
    },
    {
      repo: 'anthropics/prompt-eng-interactive-tutorial',
      what: '每章带练习与失败模式',
      how: '每阶段强制配「最常见的坑 + 检验方式」',
    },
  ],
};
