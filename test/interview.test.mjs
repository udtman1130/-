import { test } from 'node:test'
import assert from 'node:assert/strict'
import { questionsFor, normalizeInterview, evidenceFor } from '../shared/interview.js'
import { exportDraft } from '../src/export.js'
test('business questions branch without automotive leakage', () => {
  for (const industry of ['음식점·카페', '인테리어·수리', '여행·숙박', '교육·강습', '판매·쇼핑몰', '애견 미용']) {
    const questions = questionsFor(industry)
    assert.equal(questions.length, 8)
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

test('HTML photo caption is a separate escaped paragraph below placement', () => {
  const out = exportDraft([{ type: 'photo', photo: { id: 2, description: '작업 전 <벽면>', file: { type: 'image/jpeg' } } }])
  assert.ok(out.html.includes('photo_02.jpg</p><p'))
  assert.ok(out.html.includes('작업 전 &lt;벽면&gt;</p>'))
})

 test('industry profiles collect distinct customer decision facts and provenance', () => {
  const food = questionsFor('빵집')
  const karaoke = questionsFor('라오스 가라오케')
  assert.ok(food.find(q => q.id === 'answer').title.includes('맛'))
  assert.ok(karaoke.find(q => q.id === 'answer').hint.includes('역할'))
  assert.notDeepEqual(food[1].options, karaoke[1].options)
  for (const industry of ['음식점·카페', '가라오케·노래방', '인테리어·수리', '여행·숙박', '교육·강습', '판매·쇼핑몰', '중고차', '기타']) {
    const questions = questionsFor(industry)
    assert.equal(new Set(questions.map(q => q.id)).size, 8)
    assert.ok(questions.every(q => q.title && q.hint && Array.isArray(q.options)))
    assert.doesNotThrow(() => normalizeInterview(questions.map(q => ({ id: q.id, text: '입력', confirmed: true }))))
  }
  const facts = evidenceFor({ industry: '가라오케' }, normalizeInterview([{ id: 'answer', text: '객실 3개', confirmed: true }, { id: 'source', text: '운영자 안내', confirmed: true }]))
  assert.ok(facts.find(f => f.id === 'answer').question.includes('시설'))
  assert.ok(facts.some(f => f.id === 'source'))
})
