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
    assert.equal(input.max_output_tokens, 6500)
    assert.deepEqual(input.text.format.schema.properties.sections.items.properties.evidenceIds.items.enum, ['business', 'industry', 'region', 'offering', 'difference'])
    assert.ok(JSON.parse(input.input).writingGuide.targetCharacters.includes('2000~2500'))
    assert.equal(JSON.parse(input.input).business, form.business)
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '제목', sections: [{ heading: '안내', text: '본문', evidenceIds: ['business'] }], reviewNotes: [] }) }] }] })
  } })
  assert.equal(r.status, 200)
  assert.equal(r.body.body, '안내\n본문')
  assert.equal(r.body.characterCount, 5)
  assert.ok(r.body.reviewNotes.some(note => note.includes('목표 2000~2500자보다 짧습니다')))
  assert.equal(r.body.coverage.find(item => item.id === 'business').sections[0], 1)
  assert.ok(r.body.reviewNotes.some(note => note.includes('상담 경로')))
  assert.equal(r.status, 200)
  assert.equal(r.body.body, '안내\n본문')
  assert.deepEqual(r.body.coverage[0].sections, [1])
  assert.ok(r.body.reviewNotes.some(note => note.includes('상담 경로')))
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

test('unconfirmed interview text is never sent upstream', async t => {
  const r = await request(t, { fetchImpl: async (url, options) => {
    const data = JSON.parse(JSON.parse(options.body).input)
    assert.ok(!JSON.stringify(data).includes('미확인 비밀 답변'))
    assert.ok(data.evidence.some(item => item.id === 'answer' && item.text === '방문 후 견적 안내'))
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '안내', sections: [{ heading: '', text: '방문 후 견적 안내', evidenceIds: ['answer'] }], reviewNotes: [] }) }] }] })
  } }, { ...form, interview: [{ id: 'answer', text: '방문 후 견적 안내', confirmed: true }, { id: 'case', text: '미확인 비밀 답변', confirmed: false }] })
  assert.equal(r.status, 200)
})
test('fabricated evidence ID causes an explicit failure', async t => {
  const r = await request(t, { fetchImpl: async () => Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '안내', sections: [{ heading: '', text: '주장', evidenceIds: ['invented'] }], reviewNotes: [] }) }] }] }) })
  assert.equal(r.status, 502)
})
test('malformed interview is rejected before provider call', async t => {
  const r = await request(t, { fetchImpl: () => assert.fail('unexpected request') }, { ...form, interview: [{ id: 'fake', text: '내용', confirmed: true }] })
  assert.equal(r.status, 400)
})

 test('user supplied claims remain available without external verification', async t => {
  const r = await request(t, { fetchImpl: async (url, options) => {
    const payload = JSON.parse(options.body)
    const data = JSON.parse(payload.input)
    assert.ok(data.evidence.some(item => item.id === 'difference' && item.text === '매니저 100명'))
    assert.ok(payload.instructions.includes('외부 근거를 찾지 못했다는 이유로 삭제하지 말고'))
    assert.ok(payload.instructions.includes('100명 상주'))
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '안내', sections: [{ heading: '', text: '업체 안내', evidenceIds: ['business'] }], reviewNotes: [] }) }] }] })
  } }, { ...form, difference: '매니저 100명' })
  assert.equal(r.status, 200)
  assert.ok(r.body.reviewNotes.some(note => note.includes('매니저 100명') && note.includes('반영 점검')))
  assert.ok(r.body.coverage.some(item => item.id === 'difference'))
})

test('review revision includes original facts, previous draft and only answered questions', async t => {
  const r = await request(t, { fetchImpl: async (url, options) => {
    const payload = JSON.parse(options.body)
    const input = JSON.parse(payload.input)
    assert.equal(input.previousDraft.body, '기존 초안')
    assert.ok(input.evidence.some(e => e.id === 'difference' && e.text === '국산 밀'))
    const extra = input.evidence.find(e => e.id.startsWith('review_'))
    assert.equal(extra.text, '전체 등록 인원입니다')
    assert.equal(extra.question, '100명의 의미는?')
    assert.equal(input.evidence.filter(e => e.id.startsWith('review_')).length, 1)
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '수정', sections: [{ heading: '', text: '전체 등록 인원입니다', evidenceIds: [extra.id] }], reviewNotes: [], reviewQuestions: ['예약은 어디로 하나요?'], changeSummary: ['인원 의미를 보완했습니다.'] }) }] }] })
  } }, { ...form, previousDraft: { title: '제목', body: '기존 초안' }, reviewAnswers: [{ question: '100명의 의미는?', answer: '전체 등록 인원입니다' }, { question: '요금은?', answer: ' ' }] })
  assert.equal(r.status, 200)
  assert.deepEqual(r.body.reviewQuestions, ['예약은 어디로 하나요?'])
  assert.deepEqual(r.body.changeSummary, ['인원 의미를 보완했습니다.'])
})
test('invalid revision inputs are rejected before any paid request', async t => {
  for (const extra of [{ reviewAnswers: [{ question: '질문', answer: 123 }] }, { reviewAnswers: Array.from({ length: 21 }, () => ({ question: '질문', answer: '답' })) }, { previousDraft: { title: '제목', body: 123 } }]) {
    const r = await request(t, { fetchImpl: () => assert.fail('unexpected provider request') }, { ...form, ...extra })
    assert.equal(r.status, 400)
  }
})

test('preparation returns original input summary and at most three easy questions without drafting', async t => {
  const r = await request(t, { fetchImpl: async (url, options) => {
    const payload = JSON.parse(options.body)
    assert.equal(payload.text.format.name, 'preparation_questions')
    assert.equal(payload.max_output_tokens, 1800)
    assert.ok(payload.instructions.includes('글은 작성하지 마라'))
    assert.ok(payload.instructions.includes('이미 답한 내용은 묻지 마라'))
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ questions: [{ question: '어떤 감가를 설명하나요?', options: ['연식에 따른 가치 하락', '전화 견적과 현장 가격 차이'] }] }) }] }] })
  } }, { ...form, action: 'prepare', difference: '매니저 100명' })
  assert.equal(r.status, 200)
  assert.equal(r.body.questions.length, 1)
  assert.equal(r.body.summary.find(e => e.id === 'difference').text, '매니저 100명')
  assert.equal(r.body.body, undefined)
})
test('preparation accepts sufficient material with no questions and rejects malformed model output', async t => {
  for (const questions of [[], Array.from({ length: 4 }, () => ({ question: '질문', options: [] })), [{ question: '질문', options: '잘못된 선택지' }]]) {
    const r = await request(t, { fetchImpl: async () => Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ questions }) }] }] }) }, { ...form, action: 'prepare' })
    assert.equal(r.status, questions.length === 0 ? 200 : 502)
  }
})
test('generation and later revision retain answered preparation facts, never empty answers', async t => {
  for (const previousDraft of [undefined, { title: '기존 제목', body: '기존 본문' }]) {
    const r = await request(t, { fetchImpl: async (url, options) => {
      const payload = JSON.parse(options.body)
      assert.equal(payload.text.format.name, 'blog_draft')
      const input = JSON.parse(payload.input)
      const facts = input.evidence.filter(e => e.id.startsWith('preparation_'))
      assert.equal(facts.length, 1)
      assert.equal(facts[0].text, '전화 견적과 현장 가격 차이')
      assert.ok(input.evidence.some(e => e.id === 'business'))
      return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ title: '제목', sections: [{ heading: '', text: '전화 견적과 현장 가격 차이', evidenceIds: [facts[0].id] }], reviewNotes: [], reviewQuestions: [], changeSummary: [] }) }] }] })
    } }, { ...form, previousDraft, preparationAnswers: [{ question: '어떤 감가인가요?', answer: '전화 견적과 현장 가격 차이' }, { question: '연락처는?', answer: '' }] })
    assert.equal(r.status, 200)
  }
})
test('invalid preparation answer limits and action are rejected before provider calls', async t => {
  for (const extra of [{ action: 'unknown' }, { preparationAnswers: [{ question: '질문', answer: 123 }] }, { preparationAnswers: Array.from({ length: 4 }, () => ({ question: '질문', answer: '답' })) }]) {
    const r = await request(t, { fetchImpl: () => assert.fail('unexpected provider request') }, { ...form, ...extra })
    assert.equal(r.status, 400)
  }
})
