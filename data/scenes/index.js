import requirement from './requirement.js';
import codingTask from './coding-task.js';
import documentWriting from './document-writing.js';

/** 全部场景。新增场景 = 加一个文件 + 这里 import 一行，不动任何逻辑代码。 */
export const allScenes = [requirement, codingTask, documentWriting];

export default allScenes;
