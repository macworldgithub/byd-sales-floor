const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const moduleFixture = { exports: {} };
const source = fs.readFileSync(require('node:path').join(__dirname, '../lib/floorCalendar.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { module: moduleFixture, exports: moduleFixture.exports, Date, Intl });
const { calendarRange, navigateCalendar, melbourneDay, melbourneDateTime, normalizeLead, isFloorAdmin } = moduleFixture.exports;
const plain = value => JSON.parse(JSON.stringify(value));

test('calendar months use the real leap-year and year-boundary dates', () => {
  assert.deepEqual(plain(calendarRange('2028-02-20', 'month')), { from: '2028-02-01', to: '2028-03-01' });
  assert.deepEqual(plain(calendarRange('2026-12-31', 'month')), { from: '2026-12-01', to: '2027-01-01' });
  assert.equal(navigateCalendar('2026-03-31', 'month', -1), '2026-02-01');
  assert.deepEqual(plain(calendarRange('2026-11-01', 'week')), { from: '2026-10-26', to: '2026-11-02' });
});

test('Melbourne dates and bookings follow daylight saving and reject nonexistent local times', () => {
  assert.equal(melbourneDay(new Date('2026-11-05T14:00:00Z')), '2026-11-06');
  assert.equal(melbourneDateTime('2026-11-06', '09:00'), '2026-11-05T22:00:00.000Z');
  assert.equal(melbourneDateTime('2026-07-06', '09:00'), '2026-07-05T23:00:00.000Z');
  assert.throws(() => melbourneDateTime('2026-10-04', '02:30'));
  assert.throws(() => melbourneDateTime('2026-02-30', '09:00'));
});

test('lead normalization retains the real record identity and assigned colleague', () => {
  const lead = normalizeLead({ _id: 'saved-id', name: 'Fixture Person', vehicle: { raw: 'Actual vehicle' }, allocatedPersonFullName: 'Colleague' });
  assert.equal(lead.id, 'saved-id'); assert.equal(lead.model, 'Actual vehicle');
  assert.equal(lead.initials, 'FP'); assert.equal(lead.consultant, 'Colleague');
  assert.ok(isFloorAdmin('admin')); assert.ok(!isFloorAdmin('sales_manager'));
});
