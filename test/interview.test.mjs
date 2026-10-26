import { test } from 'node:test'
import assert from 'node:assert/strict'
import { questionsFor, normalizeInterview, evidenceFor } from '../shared/interview.js'
import { exportDraft } from '../src/export.js'
test('business questions branch without automotive leakage', () => {
  for (const industry of ['음식점·카페', '인테리어·수리', '여행·숙박', '교육·강습', '판매·쇼핑몰', '애견 미용']) {
    const questions = questionsFor(industry)
    assert.equal(questions.length, 7)
    assert.ok(!JSON.stringify(questions).includes('실차'))
  }
  assert.ok(questionsFor('중고차')[4].hint.includes('실차'))
  assert.equal(questionsFor('처음보는 업종')[4].id, 'conditions')
})
test('unknown, duplicate and unconfirmed evidence cannot become confirmed facts', () => {
  assert.throws(() => normalizeInterview([{ id: 'case', text: 'a', confirmed: true }, { id: 'case', text: 'b', confirmed: true }]))
  const answers = normalizeInterview([{ id: 'case', text: '예시를 사용하지 마세요', confirmed: false }])
  const facts = evidenceFor({ business: '업체', industry: '카페', region: '서울', offering: '커피' }, answers)
  assert.ok(!facts.some(item => item.id === 'case'))
})
test('export escapes script-like content, does not export temporary image URL', () => {
  const blocks = [{ type: 'text', text: '## 제목\n**설명** <script>alert(1)</script>' }, { type: 'photo', photo: { id: 3, description: '<img onerror=evil>', url: 'blob:secret', file: { type: 'image/png' } } }]
  const out = exportDraft(blocks, ['제목'])
  assert.ok(out.html.includes('<h2'))
  assert.ok(!out.html.includes('<script>'))
  assert.ok(!out.html.includes('blob:'))
  assert.ok(!out.text.includes('##'))
  assert.ok(!out.text.includes('**'))
  assert.ok(out.text.includes('photo_03.png'))
})
