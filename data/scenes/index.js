import requirement from './requirement.js';
import codingTask from './coding-task.js';
import documentWriting from './document-writing.js';
import debug from './debug.js';
import codeReview from './code-review.js';
import refactorPlan from './refactor-plan.js';
import testDesign from './test-design.js';
import apiIntegration from './api-integration.js';
import codeExplain from './code-explain.js';

/** 全部场景。新增场景 = 加一个文件 + 这里 import 一行，不动任何逻辑代码。 */
export const allScenes = [
  requirement,
  codingTask,
  documentWriting,
  debug,
  codeReview,
  refactorPlan,
  testDesign,
  apiIntegration,
  codeExplain,
];

export default allScenes;
