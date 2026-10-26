export const industryOptions = ['음식점·카페', '인테리어·수리', '여행·숙박', '교육·강습', '판매·쇼핑몰', '중고차', '기타·직접 입력']
const common = [
  { id: 'audience', title: '어떤 고객에게 도움이 되는 글인가요?', options: ['처음 알아보는 분', '가격을 비교하는 분', '예약·구매를 고민하는 분'], hint: '예: 처음 인테리어 견적을 받는 사람' },
  { id: 'question', title: '이번 글에서 고객의 어떤 궁금증을 풀어줄까요?', options: ['비용이 어떻게 정해지나요?', '어떤 순서로 진행하나요?', '선택 전에 무엇을 확인하나요?'], hint: '예: 추가 비용이 생기는 경우는 언제인가요?' },
  { id: 'answer', title: '그 질문에 평소 어떻게 답하시나요?', options: [], hint: '짧게 적어도 됩니다. 실제 고객에게 설명하는 말로 적어주세요.' },
  { id: 'process', title: '고객이 문의한 다음에는 무엇을 하나요?', options: [], hint: '예: 원하는 내용 확인 → 가능 일정 안내 → 예약. 실제 순서로 적어주세요.' },
  { id: 'conditions', title: '비용이나 이용 조건에서 미리 알려줄 점이 있나요?', options: [], hint: '추가 비용·취소 조건·제공하기 어려운 경우 중 이번 글과 관련된 것만 적으세요.' },
  { id: 'case', title: '직접 겪은 사례가 있나요? 없으면 건너뛰세요.', options: [], hint: '어떤 상황 → 어떻게 처리 → 어떤 결과. 이름·차량번호 등 개인정보는 빼주세요.' },
  { id: 'contact', title: '어디로 문의하고 무엇을 준비하면 되나요?', options: [], hint: '공개할 전화번호나 https:// 상담 주소와 준비 자료를 적으세요.' },
]
export function questionsFor(industry = '') {
  let detail = common[4]
  if (/음식|카페|식당/.test(industry)) detail = { ...detail, title: '가격·예약·알레르기 문의 중 미리 안내할 조건이 있나요?', hint: '예: 예약 가능 인원·메뉴 가격·알레르기 확인 방법. 실제 운영 정보만 적으세요.' }
  else if (/인테리어|수리|시공/.test(industry)) detail = { ...detail, title: '어떤 경우에 추가 비용이 생기고 어떻게 안내하나요?', hint: '작업 범위·자재·현장 상태 등 실제 견적 조건을 적으세요.' }
  else if (/여행|숙박/.test(industry)) detail = { ...detail, title: '포함·불포함 비용과 예약·취소 조건은 무엇인가요?', hint: '날짜·인원 등에 따라 달라지는 실제 조건을 적으세요.' }
  else if (/교육|강습|학원/.test(industry)) detail = { ...detail, title: '수강료·수업 대상·환불에서 미리 안내할 점은 무엇인가요?', hint: '대상·횟수·기간 등 실제 조건을 적고 성과를 보장하지 마세요.' }
  else if (/판매|쇼핑|소매/.test(industry)) detail = { ...detail, title: '배송·추가 비용·교환·반품에서 미리 안내할 점은 무엇인가요?', hint: '상품별 실제 적용 조건을 적으세요.' }
  else if (/중고차|자동차/.test(industry)) detail = { ...detail, title: '견적이 달라지는 조건과 별도 비용은 무엇인가요?', hint: '실차 확인 전후의 차이·고객 동의 과정·출장비 등 실제 조건만 적으세요.' }
  return common.map(q => q.id === 'conditions' ? detail : { ...q })
}
export function normalizeInterview(value) {
  if (value == null) return []
  if (!Array.isArray(value) || value.length > 7) throw new Error('질문 답변 형식을 확인해 주세요.')
  const ids = new Set()
  return value.map(item => {
    const allowed = common.some(q => q.id === item?.id)
    if (!allowed || ids.has(item.id) || typeof item.text !== 'string' || item.text.length > 2000 || typeof item.confirmed !== 'boolean') throw new Error('질문 답변을 다시 확인해 주세요.')
    ids.add(item.id)
    return { id: item.id, text: item.text.trim(), confirmed: item.confirmed }
  })
}
export function evidenceFor(form, interview) {
  const facts = ['business', 'industry', 'region', 'offering'].map(id => ({ id, text: form[id], origin: '업체 제공·외부 검증 안 됨' }))
  return facts.concat(interview.filter(a => a.confirmed && a.text).map(a => ({ id: a.id, text: a.text, origin: '사용자 확인·외부 검증 안 됨' })))
}
export function coverageFor(sections, evidence) {
  return evidence.map(item => ({ id: item.id, text: item.text, sections: sections.map((section, i) => section.evidenceIds.includes(item.id) ? i + 1 : null).filter(Boolean) }))
}
