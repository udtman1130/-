export const industryOptions = ['음식점·카페', '인테리어·수리', '여행·숙박', '교육·강습', '판매·쇼핑몰', '중고차', '가라오케·노래방', '기타·직접 입력']
const common = [
  { id: 'audience', title: '어떤 고객에게 도움이 되는 글인가요?', options: ['처음 알아보는 분', '가격을 비교하는 분', '예약·구매를 고민하는 분'], hint: '예: 처음 인테리어 견적을 받는 사람' },
  { id: 'question', title: '이번 글에서 고객의 어떤 궁금증을 풀어줄까요?', options: ['비용이 어떻게 정해지나요?', '어떤 순서로 진행하나요?', '선택 전에 무엇을 확인하나요?'], hint: '예: 추가 비용이 생기는 경우는 언제인가요?' },
  { id: 'answer', title: '그 질문에 평소 어떻게 답하시나요?', options: [], hint: '짧게 적어도 됩니다. 결론은 무엇인가요? 왜 그런가요? 고객이 확인할 것은 무엇인가요? 실제로 설명하는 말로 적어주세요.' },
  { id: 'process', title: '고객이 문의한 다음에는 무엇을 하나요?', options: [], hint: '예: 원하는 내용 확인 → 가능 일정 안내 → 예약. 실제 순서로 적어주세요.' },
  { id: 'conditions', title: '비용이나 이용 조건에서 미리 알려줄 점이 있나요?', options: [], hint: '추가 비용·취소 조건·제공하기 어려운 경우 중 이번 글과 관련된 것만 적으세요.' },
  { id: 'case', title: '직접 겪은 사례가 있나요? 없으면 건너뛰세요.', options: [], hint: '고객이 처음 어떤 문제로 연락했나요? 확인한 상태는? 어떻게 처리했나요? 확인 가능한 결과는? 없으면 건너뛰고 개인정보는 빼주세요.' },
  { id: 'contact', title: '어디로 문의하고 무엇을 준비하면 되나요?', options: [], hint: '공개할 전화번호나 https:// 상담 주소와 준비 자료를 적으세요.' },
]
// These collect useful answers; they are not an AI citation or ranking score.
const profiles = [
  { match: /가라오케|노래방|karaoke|클럽/i, name: '가라오케·노래방',
    audience: ['처음 방문하는 여행객', '단체 모임 고객', '예약을 고민하는 고객'],
    topics: ['이용 요금과 추가 비용은?', '객실·음향·시설은?', '위치와 예약 방법은?'],
    answer: ['고객에게 실제로 안내하는 시설·이용 정보를 알려주세요.', '객실 크기·이용 가능 인원·음향·언어 지원 중 아는 내용만 적으세요. 매니저 같은 업계 표현은 역할도 설명해 주세요.'],
    process: ['예약부터 입장·이용까지 어떻게 진행되나요?', '예약 방법, 영업시간, 이용 시간, 정확한 위치나 지도 주소 중 아는 내용을 적으세요.'],
    conditions: ['요금 기준·포함 항목·별도 비용은 무엇인가요?', '객실·시간·인원 중 요금 기준과 통화, 포함 서비스, 추가 비용, 예약·취소 조건을 적으세요.'],
    case: ['직접 확인한 시설이나 실제 이용 사례가 있나요?', '사진에서 보이는 시설이나 실제 안내한 이용 상황을 적으세요. 고객 후기를 만들어 적지 않아도 됩니다.'],
    contact: ['예약 연락처와 방문 전에 보낼 정보는 무엇인가요?', '공개 연락처·공식 계정과 방문 날짜·인원 등 예약에 필요한 내용을 적으세요.'] },
  { match: /음식|카페|식당|빵집|베이커리/, name: '음식점·카페',
    audience: ['처음 방문하는 손님', '메뉴를 고르는 손님', '단체·가족 손님'],
    topics: ['대표 메뉴의 맛과 양은?', '메뉴 가격과 주문 방법은?', '위치·영업시간·주차는?'],
    answer: ['대표 메뉴의 맛·식감·양을 알려주세요.', '메뉴 이름, 재료, 맛과 식감, 몇 명이 먹기 좋은지 중 아는 내용을 적으세요.'],
    process: ['방문하거나 주문하려면 어떻게 하면 되나요?', '정확한 위치·영업시간·마지막 주문·예약·포장·주차 중 해당 내용을 적으세요.'],
    conditions: ['메뉴 가격과 이용 전에 알아둘 조건은 무엇인가요?', '가격·예약 가능 인원·추가 비용·알레르기 문의 방법을 적으세요.'],
    case: ['직접 만든 메뉴나 매장 사진에서 소개할 점은 무엇인가요?', '실제 조리 과정·좌석·메뉴 구성 등 직접 아는 내용을 적으세요. 사례가 없으면 건너뛰세요.'],
    contact: ['예약·주문은 어디로 하고 무엇을 알려주면 되나요?', '공개 연락처·지도·주문 링크와 필요한 인원·날짜 등을 적으세요.'] },
  { match: /인테리어|수리|시공/, name: '인테리어·수리',
    audience: ['고장·불편을 겪는 고객', '견적을 비교하는 고객', '시공을 준비하는 고객'], topics: ['수리 가능한 범위는?', '견적과 추가 비용은?', '작업 기간과 사후 관리는?'],
    answer: ['어떤 문제를 어떤 작업으로 해결하나요?', '작업 대상·가능 범위·사용 자재·어려운 조건을 실제 기준으로 적으세요.'],
    process: ['견적 상담부터 작업 완료까지 어떻게 진행하나요?', '현장 확인·작업 순서·지역·소요 시간과 달라지는 조건을 적으세요.'],
    conditions: ['어떤 경우에 추가 비용이 생기고 어떻게 안내하나요?', '작업 범위·자재·현장 상태와 고객 동의·사후 관리 조건을 적으세요.'],
    case: ['실제 작업 전 상태와 작업 후 달라진 점은 무엇인가요?', '문제 → 작업 내용 → 확인한 결과. 전후 사진 설명도 좋습니다.'],
    contact: ['견적 문의는 어디로 하고 어떤 사진이 필요한가요?', '공개 연락처와 현장 사진·크기·주소 등 필요한 자료를 적으세요.'] },
  { match: /여행|숙박|호텔|투어|펜션|풀빌라|골프/, name: '여행·숙박',
    audience: ['처음 방문하는 여행객', '가족·단체 여행객', '일정·숙소를 비교하는 고객'], topics: ['일정과 포함 서비스는?', '가격·추가 비용·취소 조건은?', '위치와 이동 방법은?'],
    answer: ['실제로 제공하는 일정·객실·서비스를 알려주세요.', '상품 이름, 일정이나 객실 구성, 이용 인원과 특징을 적으세요.'],
    process: ['예약부터 도착·이용까지 어떻게 진행하나요?', '위치·집결 장소·이동·체크인·이용 시간을 아는 범위에서 적으세요.'],
    conditions: ['포함·불포함 비용과 예약·취소 조건은 무엇인가요?', '통화·날짜·인원별 가격 기준과 별도 비용·취소 조건을 적으세요.'],
    case: ['직접 진행한 여행이나 실제 숙소의 특징이 있나요?', '실제 일정·객실 사진·현장 경험을 적으세요. 만족도는 추측하지 않습니다.'],
    contact: ['예약은 어디로 하고 어떤 정보를 보내면 되나요?', '공개 연락처·공식 링크와 날짜·인원·희망 상품을 적으세요.'] },
  { match: /교육|강습|학원/, name: '교육·강습',
    audience: ['입문자', '학부모', '수업을 비교하는 수강생'], topics: ['누구를 위한 수업인가요?', '수업 내용과 방식은?', '수강료·시간·환불 조건은?'],
    answer: ['수업 대상과 실제로 배우는 내용을 알려주세요.', '연령·필요한 수준·수업 구성·개인 또는 그룹 여부를 적으세요.'],
    process: ['상담·등록부터 수업 참여까지 어떻게 진행하나요?', '위치·온라인 여부·수업 시간·횟수·준비물을 적으세요.'],
    conditions: ['수강료·수업 대상·환불에서 미리 안내할 점은 무엇인가요?', '횟수·기간별 요금, 교재비, 보강·환불 조건을 적으세요.'],
    case: ['실제 수업 사례나 직접 확인할 자료가 있나요?', '실제 수업 활동·공개 가능한 경력이나 자료를 적으세요. 성적 향상은 보장하지 않습니다.'],
    contact: ['수강 상담은 어디로 하고 무엇을 알려주면 되나요?', '공개 연락처와 희망 수업·수준·시간을 적으세요.'] },
  { match: /판매|쇼핑|소매/, name: '판매·쇼핑몰',
    audience: ['처음 구매하는 고객', '제품을 비교하는 고객', '사용 조건을 확인하는 고객'], topics: ['제품 규격과 특징은?', '가격·배송비는?', '사용 방법·교환 조건은?'],
    answer: ['상품의 규격·재질·용도는 무엇인가요?', '크기·구성품·재질·호환 여부와 실제 차이를 적으세요.'],
    process: ['주문 후 배송·사용은 어떻게 진행되나요?', '주문 방법·배송 지역·예상 기간의 조건·사용 방법을 적으세요.'],
    conditions: ['배송·추가 비용·교환·반품에서 미리 안내할 점은 무엇인가요?', '옵션별 가격·배송비·교환과 반품 조건을 적으세요.'],
    case: ['직접 사용한 사례나 상품 사진에서 확인할 점이 있나요?', '실제 사용 환경·사진 속 구성·주의할 조건을 적으세요.'],
    contact: ['구매·상품 문의는 어디로 하면 되나요?', '공식 구매 링크·공개 연락처와 문의 시 필요한 옵션 정보를 적으세요.'] },
  { match: /중고차|자동차/, name: '중고차',
    audience: ['차량 처분을 고민하는 차주', '수출·매매·폐차를 비교하는 차주', '견적을 알아보는 차주'], topics: ['어떤 차량을 취급하나요?', '견적과 현장 감가는?', '대금 지급과 말소 절차는?'],
    answer: ['차주가 궁금해하는 내용에 실제로 어떻게 답하시나요?', '취급 차종·차량 상태에 따른 판단 기준이나 대금·말소 질문의 실제 답을 적으세요.'],
    process: ['차량 확인·대금 지급·인수·말소는 어떤 순서인가요?', '실제 운영 순서와 처리 기간의 조건을 적으세요.'],
    conditions: ['견적이 달라지는 조건과 별도 비용은 무엇인가요?', '실차 확인 전후 차이·감가 동의·탁송비·취소 조건을 적으세요.'],
    case: ['실제 차량 상태와 처리 결과를 알려주세요.', '차종·연식·주행거리·상태 → 처리 과정 → 결과. 개인정보는 빼주세요.'],
    contact: ['견적 문의는 어디로 하고 어떤 차량 자료가 필요한가요?', '공개 연락처와 차종·연식·주행거리·사진 등 필요한 자료를 적으세요.'] },
]
export function profileFor(industry = '') {
  return profiles.find(profile => profile.match.test(industry)) || null
}
export function questionsFor(industry = '') {
  const profile = profileFor(industry)
  const questions = common.map(q => {
    const result = { ...q, options: [...q.options] }
    if (!profile) return result
    if (q.id === 'audience') return { ...result, options: [...profile.audience], hint: '이 글을 읽고 도움받을 고객을 선택하거나 직접 적으세요.' }
    if (q.id === 'question') return { ...result, options: [...profile.topics], hint: '고객이 실제로 묻는 질문을 선택하거나 직접 적으세요.' }
    const detail = profile[q.id]
    return detail ? { ...result, title: detail[0], hint: detail[1] } : result
  })
  return questions.concat({ id: 'source', title: '이 정보는 언제, 어떻게 확인했나요? (선택)', options: [], hint: '예: 운영자가 직접 안내한 정보 / 직접 방문 / 가격표·공식 링크와 확인 날짜. 공개 근거가 없어도 입력 내용은 유지합니다. 모르면 건너뛰세요.' })
}
export function normalizeInterview(value) {
  if (value == null) return []
  if (!Array.isArray(value) || value.length > 8) throw new Error('질문 답변 형식을 확인해 주세요.')
  const ids = new Set()
  return value.map(item => {
    const allowed = questionsFor().some(q => q.id === item?.id)
    if (!allowed || ids.has(item.id) || typeof item.text !== 'string' || item.text.length > 2000 || typeof item.confirmed !== 'boolean') throw new Error('질문 답변을 다시 확인해 주세요.')
    ids.add(item.id)
    return { id: item.id, text: item.text.trim(), confirmed: item.confirmed }
  })
}
export function evidenceFor(form, interview) {
  const facts = ['business', 'industry', 'region', 'offering'].map(id => ({ id, text: form[id], origin: '업체 제공·외부 검증 안 됨' }))
  if (typeof form.difference === 'string' && form.difference.trim()) facts.push({ id: 'difference', text: form.difference.trim().slice(0, 2000), origin: '사용자 제공·외부 검증 안 됨' })
  return facts.concat(interview.filter(a => a.confirmed && a.text).map(a => ({ id: a.id, text: a.text, origin: '사용자 확인·외부 검증 안 됨', question: questionsFor(form.industry).find(q => q.id === a.id)?.title })))
}
export function coverageFor(sections, evidence) {
  return evidence.map(item => ({ id: item.id, text: item.text, sections: sections.map((section, i) => section.evidenceIds.includes(item.id) ? i + 1 : null).filter(Boolean) }))
}
