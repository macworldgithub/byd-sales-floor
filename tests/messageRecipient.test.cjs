const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleFixture = { exports: {} };
const source = fs.readFileSync(path.join(__dirname, '../lib/messageRecipient.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module: moduleFixture, exports: moduleFixture.exports });
const { messageRecipient } = moduleFixture.exports;
const bydLead = { _id: '6acc72ac18b6c13e851e0bc1', name: 'BYD Customer', phone: '+61 499 918 523', dealer: 'BYD Melbourne', stage: 'NEW ENQUIRIES' };
const denzaThread = { id: 'thread-denza', prospectName: '+61499918523', phone: '+61499918523', dealer: 'Denza Melbourne', leadId: bydLead._id, lastMessage: 'reply' };

test('a Denza conversation never borrows the ID of a BYD lead sharing its phone', () => {
  const recipient = messageRecipient(denzaThread, [bydLead]);
  assert.equal(recipient._id, undefined);
  assert.equal(recipient.phone, denzaThread.phone);
  assert.equal(recipient.dealer, 'Denza Melbourne');
});

test('delivery conversation keeps its client identity even when the phone matches a lead', () => {
  const recipient = messageRecipient({ ...denzaThread, client_id: 'denza-client' }, [bydLead]);
  assert.equal(recipient.client_id, 'denza-client');
  assert.equal(recipient._id, undefined);
});

test('a same-site lead matches formatted phones and Melbourne site aliases', () => {
  const recipient = messageRecipient({ ...denzaThread, dealer: 'Melbourne CBD' }, [bydLead]);
  assert.equal(recipient._id, bydLead._id);
});

test('a paginated-out lead is resolved by verified phone and site rather than an unverified inherited ID', () => {
  const recipient = messageRecipient(denzaThread, []);
  assert.equal(recipient._id, undefined);
  assert.equal(recipient.dealer, denzaThread.dealer);
});

test('directly selected lead and delivery identities are preserved', () => {
  assert.equal(messageRecipient(bydLead, []), bydLead);
  const delivery = { name: 'Delivery Customer', phone: denzaThread.phone, dealer: 'Denza Melbourne', client_id: 'denza-client', stage: 'Committed' };
  assert.equal(messageRecipient(delivery, [bydLead]), delivery);
});
