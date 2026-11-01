import test from 'node:test'
import assert from 'node:assert/strict'
import { inspectDraft } from '../shared/quality-check.js'

const base = {
  result: { title: '외관 손상 코란도 스포츠 중고차 수출 상담', body: '차량 상태를 확인한 뒤 수출 가능 여부와 견적 조건을 안내합니다. 바다무역에 상담 문의해 주세요.', sections: [
    {heading: '차량 상태', text: '외관과 상태를 확인합니다.'},
    {heading: '판단 조건', text: '차종과 주행거리 조건을 살펴봅니다.'},
    {heading: '상담 방법', text: '견적 상담을 받으세요.'}
  ], coverage: [{id: 'business', sections: ['차량 상태']}], reviewQuestions: [] },
  form: {business: '바다무역'},
  carExport: {purpose: 'case', vehicle: {model: '코란도 스포츠', year: '2016', mileage: '26만 km', outcome: '매입 완료'}},
  photos: [{description: '전면 사진'}]
}
test('초안 전에는 검사 대기', () => {
  assert.equal(inspectDraft({}).ready, false)
})
test('SEO/GEO 점수 범위', () => {
  const a=inspectDraft(base)
  assert.ok(a.seo >= 0 && a.seo <= 100)
  assert.ok(a.geo >= 0 && a.geo <= 100)
  assert.equal(a.blocking, false)
})
test('진행 중인 사례를 성공이라고 쓰면 우선 확인', () => {
  const a=inspectDraft({...base, carExport:{purpose:'case',vehicle:{...base.carExport.vehicle,outcome:'거래 진행 중'}},result:{...base.result,title:'코란도 스포츠 중고차 수출 거래 성공 사례'}})
  assert.equal(a.blocking, true)
  assert.equal(a.checks.find(c=>c.id==='outcome').status,'critical')
})
test('본문에 진행 중/완료가 동시에 있으면 경고', () => {
  const a=inspectDraft({...base,result:{...base.result, body:base.result.body+' 아직 거래 협의 중이지만 매입이 이루어졌습니다.'}})
  assert.equal(a.blocking,true)
})
test('사진 설명 누락을 확인', () => {
  const a=inspectDraft({...base,photos:[{description:''}]})
  assert.equal(a.checks.find(c=>c.id==='photo').status,'review')
})
test('추가 질문과 과장 표현을 검사', () => {
  const a=inspectDraft({...base,result:{...base.result,body:base.result.body+' 무조건 최고가 100% 보장.',reviewQuestions:['현재 계약 상태는?']}})
  assert.equal(a.checks.find(c=>c.id==='claims').status,'review')
  assert.equal(a.checks.find(c=>c.id==='questions').status,'review')
})
