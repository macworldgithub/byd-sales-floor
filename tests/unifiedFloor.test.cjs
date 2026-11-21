const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, File, Blob, URLSearchParams, ...globals }); return exports;
}
test('one navigation exposes BYD workflows and keeps management tools out of salesperson navigation', () => {
  const nav = load('lib/navigation.ts');
  for (const tab of ['today', 'leads', 'customers', 'inventory', 'deliveries', 'calendar', 'pipeline', 'tasks']) assert.equal(nav.canOpenTab(tab, 'sales_consultant'), true);
  for (const tab of ['pulse', 'allocation', 'reports', 'audit', 'settings']) {
    assert.equal(nav.canOpenTab(tab, 'sales_consultant'), false);
    assert.equal(nav.canOpenTab(tab, 'sales_manager'), true);
  }
  assert.equal(nav.canOpenTab('booran-dms', 'super_admin'), false);
  assert.equal(nav.resolveFloorTab('?customer_id=CUST-real', 'sales_consultant'), 'customers');
  assert.equal(nav.resolveFloorTab('?lead_id=original-enquiry', 'sales_consultant'), 'leads');
  assert.equal(nav.resolveFloorTab('?tab=allocation', 'sales_consultant'), 'today');
  assert.equal(nav.resolveFloorTab('', 'contractor'), 'deliveries');
  assert.equal(nav.canOpenTab('customers', 'contractor'), false);
  assert.equal(nav.canOpenTab('deliveries', 'contractor'), true);
});
test('sharing a large video uses bounded authenticated chunks and the backend-issued media ID', async () => {
  const calls = [], requests = [];
  const api = load('lib/operations.ts', {
    require: () => ({ BASE_URL: 'https://example.test/api', getToken: () => 'fixture-token', fetchApi: async (route, options) => {
      calls.push({ route, options });
      return { success: true, data: route.endsWith('/complete') ? { id: 'stored-video', publicUrl: 'https://example.test/shared' } : { id: 'upload-id', chunkBytes: 2097152, parts: 2 } };
    } }),
    localStorage: { getItem: () => 'BYD Fairfield' },
    fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ success: true }) }; },
  });
  const result = await api.uploadMedia(new File([new Uint8Array(3 * 1024 * 1024)], 'walkaround.mp4', { type: 'video/mp4' }), { leadId: 'original-enquiry' });
  assert.equal(result.id, 'stored-video'); assert.equal(requests.length, 2);
  assert.equal(JSON.parse(calls[0].options.body).leadId, 'original-enquiry');
  for (const request of requests) { assert.ok(request.options.body.size <= 2097152); assert.equal(request.options.headers.Authorization, 'Bearer fixture-token'); assert.equal(request.options.headers['X-Site'], 'BYD Fairfield'); }
  assert.equal(calls.at(-1).route, '/mobile/media/uploads/upload-id/complete');
});
test('unconfirmed workflow actions and failed chunks cannot report successful saves or sends', async () => {
  const api = load('lib/operations.ts', { require: () => ({ fetchApi: async () => ({ success: false, message: 'Provider unavailable' }) }) });
  await assert.rejects(api.operation('/leads/fixture/messages', { body: 'Hello' }), /Provider unavailable/);
  await assert.rejects(api.uploadMedia(new File(['x'], 'bad.webm', { type: 'video/webm' }), { leadId: 'fixture' }), /MP4 or MOV/);
});
