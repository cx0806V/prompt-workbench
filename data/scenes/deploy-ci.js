/** 场景：部署与 CI */
export default {
  id: 'deploy-ci',
  title: '把这个项目部署上线（带自动测试）',
  category: '开发',
  icon: '🚀',
  whenToUse: '本地能跑，但不知道怎么发布到网上；或者每次发布都手动，容易漏。',
  keywords: ['部署', '上线', 'ci', '发布', 'github actions', '服务器', 'workers', '域名'],
  questions: [
    {
      key: 'target',
      ask: '要部署的是什么？纯前端 / 后端服务 / 定时任务。',
      why: '形态不同，部署方案完全不同。',
      required: true,
      examples: ['纯前端网页 + 一个 Cloudflare Worker'],
    },
    {
      key: 'env',
      ask: '打算部署到哪？免费额度、已有账号、要不要国内可访问。',
      why: '预算和可访问性直接决定选哪个平台。',
      required: true,
      examples: ['GitHub Pages / Cloudflare Workers，全部免费；国内访问要能打开'],
    },
    {
      key: 'template',
      ask: '现在手动发布要几步？最容易漏哪一步。',
      why: '自动化的目标就是消灭这些手抖。',
      required: false,
      examples: ['推代码 → 打开 Workers 后台 → 点部署；经常忘了先跑测试'],
    },
    {
      key: 'need',
      ask: '希望自动化做什么？跑测试 / 构建 / 发布 / 通知。',
      why: '决定 CI 的边界，别一开始就想全自动。',
      required: true,
      examples: ['push 后自动跑测试，测试过了自动部署'],
    },
  ],
  template: `你是一位 DevOps 工程师。给我一份能照着做的部署方案：先给结论，再给可复制的命令。

## 部署对象
{{target}}

## 目标环境与限制
{{env}}

## 现在的流程与痛点
{{template}}

## 要自动化的部分
{{need}}

## 输出要求
1. **方案结论**：推荐哪个平台、为什么（用免费额度、访问速度、维护成本三点比较）。
2. **首次部署步骤**：编号，每一步给可直接复制的命令或点击路径；标出「这步会产生什么结果」。
3. **CI 流程**：给一个最小可用的 GitHub Actions 配置（能跑测试），并说明它什么时候触发。
4. **验证清单**：部署完成后，按顺序验证哪 3 件事就算成功。
5. **回滚方式**：出问题怎么退回上一个版本，一条命令或一次点击。
6. 明确说明哪些步骤**只有在我的账号里才能做**，不要假装你能替我完成。

## 禁止
- 不要假设我有付费账号或服务器。
- 不要给超过 30 行的 CI 配置；先跑通最小版。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '分步执行 + 明确的输出格式',
      how: '把部署拆成「结论/首次步骤/CI/验证/回滚」五段固定输出',
    },
    {
      repo: 'promptfoo/promptfoo',
      what: 'CI 里跑校验的思路',
      how: 'CI 部分只保留「push 后跑测试」这一件事，避免臃肿',
    },
  ],
};
