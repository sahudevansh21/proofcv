import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createApp({ serveClient: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

test('GET /api/health', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('GET /api/presets returns the sample resume and role JDs', async () => {
  const body = await (await fetch(`${base}/presets`)).json();
  assert.ok(body.sampleResume.length > 100);
  assert.ok(body.presets.length >= 4);
  for (const p of body.presets) assert.ok(p.id && p.role && p.jd);
});

test('GET /api/skills exposes the dictionary without evidence internals', async () => {
  const body = await (await fetch(`${base}/skills`)).json();
  assert.equal(body.count, body.skills.length);
  assert.equal(body.skills[0].evidence, undefined);
});

test('unknown API routes 404 and resume uploads are not accepted', async () => {
  assert.equal((await fetch(`${base}/nope`)).status, 404);
  const res = await fetch(`${base}/analyze`, { method: 'POST', body: '{"resume":"x"}', headers: { 'content-type': 'application/json' } });
  assert.equal(res.status, 404);
});
