import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publicUrl, researchRequest, searchPayload, researchBundle, acceptedResearch } from '../research.mjs'
import { exportDraft } from '../src/export.js'
const form = { business: '업체', industry: '중고차', region: '인천' }
const now = new Date('2026-10-30T09:00:00Z')
const lookup = { scope: 'business', query: '영업시간', identityUrl: 'https://example.com/shop' }
export function searchResponse(text = '영업시간은 오전 9시입니다. [1]', url = 'https://example.com/shop') {
  return { status: 'completed', output: [{ type: 'web_search_call', status: 'completed' }, { type: 'message', content: [{ type: 'output_text', text, annotations: [{ type: 'url_citation', start_index: text.length - 3, end_index: text.length, url, title: '공식 페이지' }] }] }] }
}
test('research only accepts public https links and rejects unsafe identity input', () => {
  for (const url of ['javascript:alert(1)', 'https://name:pass@example.com', 'https://127.0.0.1', 'https://localhost', 'https://server.local', 'file:///tmp/a']) assert.equal(publicUrl(url), null)
  assert.equal(publicUrl('https://example.com/page'), 'https://example.com/page')
  assert.throws(() => researchRequest({ researchRequest: { scope: 'business', query: '요금' } }))
  assert.equal(researchRequest({ researchRequest: { scope: 'general', query: '수출 절차' } }).identityUrl, null)
})
test('lookup forces web search and excludes draft, credentials and private answers', () => {
  const data = searchPayload({ ...form, difference: 'private', previousDraft: 'private', password: 'secret' }, lookup, 'gpt-4.1-mini')
  assert.equal(data.tools[0].type, 'web_search')
  assert.equal(data.tool_choice, 'required')
  assert.equal(data.store, false)
  assert.ok(!data.input.includes('private'))
  assert.ok(!data.input.includes('secret'))
  const general = searchPayload(form, { scope: 'general', query: '절차' }, 'gpt-4.1-mini')
  assert.ok(!general.input.includes(form.business))
  assert.ok(!general.input.includes(form.region))
})
test('only cited paragraphs with a completed search and matching business domain become candidates', () => {
  const signed = researchBundle(searchResponse(), form, lookup, 'secret', now)
  assert.equal(signed.bundle.findings.length, 1)
  assert.equal(signed.bundle.checkedAt, now.toISOString())
  assert.equal(researchBundle({ ...searchResponse(), output: searchResponse().output.slice(1) }, form, lookup, 'secret', now).bundle.findings.length, 0)
  assert.equal(researchBundle(searchResponse('다른 업체 [1]', 'https://other.example/shop'), form, lookup, 'secret', now).bundle.findings.length, 0)
  const noCites = searchResponse(); noCites.output[1].content[0].annotations = []
  assert.equal(researchBundle(noCites, form, lookup, 'secret', now).bundle.findings.length, 0)
})
test('selection is required, signatures prevent tampering and stale business results cannot be reused', () => {
  const signed = researchBundle(searchResponse(), form, lookup, 'secret', now)
  assert.deepEqual(acceptedResearch({ ...signed, selectedIds: [] }, form, 'secret', now), [])
  const selected = { ...signed, selectedIds: ['finding_1'] }
  assert.equal(acceptedResearch(selected, form, 'secret', now)[0].scope, 'business')
  assert.throws(() => acceptedResearch({ ...selected, bundle: { ...signed.bundle, findings: [] } }, form, 'secret', now))
  assert.throws(() => acceptedResearch(selected, { ...form, business: '다른 업체' }, 'secret', now))
  assert.throws(() => acceptedResearch(selected, form, 'secret', new Date('2026-11-01T00:00:00Z')))
  assert.throws(() => acceptedResearch({ ...signed, selectedIds: ['fake'] }, form, 'secret', now))
})
test('general research remains general and export preserves clickable sources without scripts', () => {
  const signed = researchBundle(searchResponse(), form, { scope: 'general', query: '절차' }, 'secret', now)
  const research = acceptedResearch({ ...signed, selectedIds: ['finding_1'] }, form, 'secret', now)
  assert.equal(research[0].scope, 'general')
  const sections = [{ text: '본문 설명', evidenceIds: [research[0].id] }]
  const sources = [...research[0].sources, { url: 'javascript:alert(1)', title: 'bad' }]
  const out = exportDraft([{ type: 'text', text: '본문 설명' }], [], sources, sections, research)
  assert.ok(out.html.includes('href="https://example.com/shop"'))
  assert.ok(out.text.includes('참고 자료'))
  assert.ok(!out.html.includes('javascript:'))
})
test('sources stay linked to the right section across headings, paragraphs and photo breaks', async () => {
  const { sourcesForText } = await import('../shared/research-sources.js')
  const sources = [{ url: 'https://example.com/info', title: '정보' }]
  const sections = [{ heading: '안내', text: '첫 번째 설명\n\n두 번째 설명', evidenceIds: ['research_a'] }, { heading: '업체 소개', text: '직접 입력한 정보', evidenceIds: ['business'] }]
  const research = [{ id: 'research_a', sources }]
  assert.deepEqual(sourcesForText('안내\n첫 번째 설명', sections, research), sources)
  assert.deepEqual(sourcesForText('두 번째 설명', sections, research), sources)
  assert.deepEqual(sourcesForText('업체 소개\n직접 입력한 정보', sections, research), [])
})
