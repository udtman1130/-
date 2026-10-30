import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articlePurposes, exportTopics, normalizeCarExport, questionsForExport, carEvidence, carWritingGuide } from '../shared/car-export.js'
import { normalizeInterview } from '../shared/interview.js'

test('each car export topic has relevant questions without inventing operating facts', () => {
  assert.equal(exportTopics.filter(t => t.id !== 'custom').length, 10)
  for (const purpose of articlePurposes) for (const topic of exportTopics) {
    const plan = normalizeCarExport({ purpose: purpose.id, topicId: topic.id })
    const questions = questionsForExport(plan)
    assert.ok(questions.length >= 5 && questions.length <= 7)
    assert.equal(new Set(questions.map(q => q.id)).size, questions.length)
    assert.ok(questions.every(q => q.title && q.hint && Array.isArray(q.options)))
    assert.doesNotThrow(() => normalizeInterview(questions.map(q => ({ id: q.id, text: '실제 답변', confirmed: true }))))
    assert.equal(questions.some(q => q.id === 'case'), purpose.id === 'case')
  }
  const payment = questionsForExport({ purpose: 'faq', topicId: 'payment' })
  assert.ok(payment.find(q => q.id === 'answer').title.includes('대금'))
  assert.ok(!payment.some(q => /객실|메뉴|수강/.test(q.title)))
  const quote = questionsForExport({ purpose: 'faq', topicId: 'quote' })
  assert.ok(quote.find(q => q.id === 'conditions').title.includes('동의'))
})
test('case data stays literal and does not leak into other article types', () => {
  const plan = normalizeCarExport({ purpose: 'case', topicId: 'mileage', vehicle: { model: '스타렉스', mileage: '25만km', outcome: '견적 안내 중' } })
  const evidence = carEvidence(plan, [])
  assert.equal(evidence.find(e => e.id === 'vehicle_mileage').text, '25만km')
  assert.equal(evidence.find(e => e.id === 'vehicle_outcome').text, '견적 안내 중')
  assert.ok(!JSON.stringify(evidence).includes('판매 완료'))
  const faq = normalizeCarExport({ ...plan, purpose: 'faq' })
  assert.deepEqual(faq.vehicle, {})
  assert.ok(!carEvidence(faq, []).some(e => e.id.startsWith('vehicle_')))
})
test('comparison and introduction use stable topics and custom question does not duplicate evidence IDs', () => {
  const comparison = normalizeCarExport({ purpose: 'comparison', topicId: 'custom' })
  assert.equal(comparison.topicId, 'disposal')
  assert.ok(carWritingGuide(comparison).structure.includes('비교'))
  const intro = normalizeCarExport({ purpose: 'intro', topicId: 'payment' })
  assert.equal(intro.topicId, 'trust')
  assert.ok(!questionsForExport(intro).some(q => q.id === 'question'))
  const custom = normalizeCarExport({ purpose: 'faq', topicId: 'custom' })
  assert.ok(questionsForExport(custom).some(q => q.id === 'question'))
  assert.ok(!carEvidence(custom, [{ id: 'question', confirmed: true, text: '실제 질문' }]).some(e => e.id === 'question'))
})
test('invalid article plans and oversized vehicle values are rejected', () => {
  assert.throws(() => normalizeCarExport({ purpose: 'fake', topicId: 'quote' }))
  assert.throws(() => normalizeCarExport({ purpose: 'case', topicId: 'quote', vehicle: { mileage: 250000 } }))
  assert.throws(() => normalizeCarExport({ purpose: 'case', topicId: 'quote', vehicle: { model: 'a'.repeat(101) } }))
})
