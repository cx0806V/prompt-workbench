/**
 * 用 Cloudflare REST API 直接部署（不需要 npm / wrangler / Git 集成）。
 *
 *   $env:CF_API_TOKEN = "你的令牌"
 *   $env:CF_ACCOUNT_ID = "你的账户 ID"
 *   node scripts/deploy-cf.mjs
 *
 * 令牌权限只需要：Account → Workers Scripts → Edit
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const TOKEN = process.env.CF_API_TOKEN;
const ACCOUNT = process.env.CF_ACCOUNT_ID;
const NAME = process.env.WORKER_NAME || 'prompt-workbench';

if (!TOKEN || !ACCOUNT) {
  console.error('缺少环境变量：CF_API_TOKEN / CF_ACCOUNT_ID');
  process.exit(1);
}

console.log('1/3 打包…');
execFileSync(process.execPath, [path.join(ROOT, 'scripts/bundle-worker.mjs')], { stdio: 'inherit' });

const metadata = readFileSync(path.join(ROOT, 'dist/metadata.json'), 'utf8');
const script = readFileSync(path.join(ROOT, 'dist/worker.js'), 'utf8');

const form = new FormData();
form.append('metadata', new Blob([metadata], { type: 'application/json' }), 'metadata.json');
form.append('worker.js', new Blob([script], { type: 'application/javascript+module' }), 'worker.js');

console.log('2/3 上传…');
const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/workers/scripts/${NAME}`;
const response = await fetch(uploadUrl, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${TOKEN}` },
  body: form,
});
const uploadResult = await response.json();
if (!uploadResult.success) {
  console.error('上传失败：', JSON.stringify(uploadResult.errors, null, 2));
  process.exit(1);
}
console.log(`   ✓ 已上传 script=${uploadResult.result.id}`);

console.log('3/3 开启 workers.dev 访问…');
const subdomainUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/workers/scripts/${NAME}/subdomain`;
const subdomainResponse = await fetch(subdomainUrl, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: true }),
});
const subdomainResult = await subdomainResponse.json();
console.log(`   ✓ subdomain enabled=${subdomainResult.success}`);

console.log('\n部署完成。验证：');
console.log(`  https://${NAME}.<你的子域>.workers.dev/health`);
