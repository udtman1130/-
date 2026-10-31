import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createGenerateHandler } from '../server.mjs'

const form = { business: '다정빵집', industry: '빵집', region: '양산', offering: '식빵', difference: '국산 밀', platform: 'naver' }
async function request(t, options = {}, body = form, auth = 'Bearer secret') {
  const handler = createGenerateHandler({ env: { OPENAI_API_KEY: 'server-only', APP_ACCESS_CODE: 'secret' }, ...options })
  const server = http.createServer(handler)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const r = await fetch(`http://127.0.0.1:${server.address().port}`, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { status: r.status, body: await r.json() }
}
test('reject missing configuration without contacting provider', async t => {
  const r = await request(t, { env: {}, fetchImpl: () => assert.fail('unexpected request') })
  assert.equal(r.status, 503)
})
test('reject invalid access code', async t => {
  assert.equal((await request(t, {}, form, 'Bearer wrong')).status, 401)
})
test('reject blank business and unknown platform', async t => {
  assert.equal((await request(t, {}, { ...form, business: ' ' })).status, 400)
  assert.equal((await request(t, {}, { ...form, platform: 'unknown' })).status, 400)
})
test('server sends credentials upstream and parses structured response', async t => {
  const r = await request(t, { fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses')
    assert.equal(options.headers.Authorization, 'Bearer server-only')
    const input = JSON.parse(options.body)
    assert.equal(input.store, false)
    assert.equal(input.text.format.strict, true)
    assert.equal(JSON.parse(input.input).business, form.business)
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '제목', body: '본문' }) }] }] })
  } })
  assert.deepEqual(r, { status: 200, body: { title: '제목', body: '본문', platformName: '네이버 블로그' } })
  assert.equal(JSON.stringify(r).includes('server-only'), false)
})
test('upstream quota error is actionable', async t => {
  const r = await request(t, { fetchImpl: async () => new Response('', { status: 429 }) })
  assert.equal(r.status, 429)
})
test('incomplete and malformed AI output never treated as success', async t => {
  for (const data of [{ status: 'incomplete' }, { status: 'completed', output: [] }]) {
    assert.equal((await request(t, { fetchImpl: async () => Response.json(data) })).status, 502)
  }
})
