// Content planning only. These topics are questions, not legal or operational facts.
export const articlePurposes = [
  { id: 'faq', label: '차주의 궁금증에 답하기' },
  { id: 'case', label: '실제로 처리한 차량 사례 소개' },
  { id: 'comparison', label: '매매·수출·폐차 비교 안내' },
  { id: 'intro', label: '우리 업체와 이용 방법 소개' },
]
export const exportTopics = [
  { id: 'quote', label: '전화 견적과 현장 가격은 왜 달라지나요?', answer: '전화 견적과 현장 금액이 달라지는 경우를 어떻게 설명하시나요?', conditions: '금액을 바꾸기 전에 어떤 내용을 설명하고 동의를 받나요?', hint: '처음 확인하는 차량 정보, 달라지는 조건, 변경 이유를 알리는 방법을 적으세요. 해당하지 않는 조건은 넣지 마세요.', process: '차주가 현장 금액에 동의하지 않으면 어떻게 진행하나요?' },
  { id: 'after-handover', label: '차량을 넘긴 뒤 추가 감가를 요구하나요?', answer: '차량 인도 후 추가 감가에 대해 실제로 어떻게 안내하시나요?', conditions: '인도 전 확인 범위와 인도 후 문제가 확인됐을 때의 약정은 무엇인가요?', hint: '실제 약정과 고객에게 설명하는 내용을 적으세요. 법적 판단이나 다른 업체의 방식을 추측하지 않아도 됩니다.', process: '금액에 이견이 생겼을 때 상담·확인·해결은 어떻게 진행하나요?' },
  { id: 'payment', label: '차량 대금은 언제, 어떻게 받나요?', answer: '차량 확인·대금 입금·서류 전달·차량 인수는 어떤 순서인가요?', conditions: '대금 지급 조건과 지급 시점이 달라지는 경우가 있나요?', hint: '실제 입금 순서와 차주가 입금을 확인하는 방법을 적으세요. 입력하지 않은 선입금·당일 정산을 자동으로 약속하지 않습니다.', process: '차주는 입금부터 인수까지 무엇을 확인하면 되나요?' },
  { id: 'transport', label: '탁송은 어떻게 진행되고 비용은 누가 내나요?', answer: '차량은 누가 어디에서 인수하고 어떻게 이동시키나요?', conditions: '탁송비는 누가 부담하고 어떤 경우 추가 비용이 생기나요?', hint: '실제 가능 지역·이동 방법·비용 부담·취소 조건을 아는 범위에서 적으세요. 전국 무료라고 추측하지 않습니다.', process: '탁송 예약부터 인수 확인까지 어떤 순서로 진행하나요?' },
  { id: 'deregistration', label: '수출 말소 완료는 어떻게 확인하나요?', answer: '말소가 완료됐다는 사실을 차주에게 어떻게 알려주시나요?', conditions: '실제로 안내하는 처리 일정과 지연될 수 있는 조건이 있나요?', hint: '실제 안내 일정, 완료 확인 자료와 전달 방법을 적으세요. 법정 기한·필수 서류·처리 기간은 근거 없이 확정하지 않습니다.', process: '서류를 받은 뒤 말소 완료를 안내하기까지 어떻게 진행하나요?' },
  { id: 'disposal', label: '국내 매매·수출·폐차 중 어떻게 비교하나요?', answer: '차주가 세 가지 방법을 비교할 때 어떤 기준을 안내하시나요?', conditions: '각 방법의 실제 견적·비용·이용 조건에서 확인할 것은 무엇인가요?', hint: '직접 확인한 비교 기준과 조건을 적으세요. 수출이 항상 더 유리하다고 단정하지 않습니다.', process: '차량 정보를 받은 뒤 어떤 순서로 처분 방법을 비교해 안내하나요?' },
  { id: 'mileage', label: '주행거리가 많은 차량도 수출 상담이 가능한가요?', answer: '고주행 차량의 상담 가능 여부를 어떤 기준으로 판단하시나요?', conditions: '직접 취급하는 차종·상태·주행거리 조건과 어려운 경우가 있나요?', hint: '실제 취급 범위와 확인 방법만 적으세요. 수출국의 규정이나 매입 가능 여부를 새로 만들지 않습니다.', process: '차주가 어떤 정보와 사진을 보내면 무엇을 확인해 주시나요?' },
  { id: 'damage', label: '고장·사고·외관 손상이 있는 차량은 어떻게 하나요?', answer: '고장이나 손상이 있는 차량에 실제로 어떤 상담을 해주시나요?', conditions: '확인해야 할 상태와 취급이 어려운 조건, 별도 비용은 무엇인가요?', hint: '시동 여부·파손 부위 등 차주가 알려줄 정보와 실제 판단 과정을 적으세요. 사진만으로 엔진·성능을 확정하지 않습니다.', process: '차량 상태를 확인하고 견적·가능 여부를 안내하는 순서를 알려주세요.' },
  { id: 'documents', label: '상담과 거래 전에 어떤 자료를 준비하나요?', answer: '상담용 자료와 실제 거래 단계의 준비 자료를 나눠 알려주세요.', conditions: '차량·소유 형태에 따라 달라지는 준비 사항이 있나요?', hint: '실제로 안내하는 자료와 확인 경로를 적으세요. 주민번호·차량번호·서류 원본은 입력하지 마세요. 법적 필수 서류는 검증 자료 없이 단정하지 않습니다.', process: '자료를 언제 어떤 공개 상담 경로로 확인하시나요?' },
  { id: 'trust', label: '중고차 수출 업체를 선택할 때 무엇을 확인하나요?', answer: '차주가 업체를 선택하기 전에 확인할 내용을 어떻게 안내하시나요?', conditions: '우리 업체가 실제로 공개하거나 확인해 줄 수 있는 정보는 무엇인가요?', hint: '업체 식별 정보·견적 조건·대금 및 인수 순서·말소 안내 중 실제 정보를 적으세요. 자격·등록·무사고 실적은 만들지 않습니다.', process: '처음 상담한 차주에게 거래 과정을 어떤 순서로 안내하시나요?' },
  { id: 'custom', label: '다른 질문 직접 작성', answer: '차주의 질문에 평소 어떻게 답하시나요?', conditions: '그 답이 달라지는 조건이나 예외가 있나요?', hint: '이번 글과 관련된 실제 설명만 적으세요.', process: '고객이 답을 확인하거나 상담받으려면 어떻게 하면 되나요?' },
]
export const vehicleFields = [
  { id: 'model', label: '차종', max: 100 },
  { id: 'year', label: '연식', max: 50 },
  { id: 'mileage', label: '주행거리', max: 100 },
  { id: 'condition', label: '실제로 확인한 차량 상태', max: 1000 },
  { id: 'concern', label: '차주가 처음 고민했던 점', max: 1000 },
  { id: 'outcome', label: '현재 처리 결과 또는 진행 상태', max: 1000 },
]
export function effectiveTopicId(plan) { return plan.purpose === 'comparison' ? 'disposal' : plan.purpose === 'intro' ? 'trust' : plan.topicId }
export function initialCarExport() { return { purpose: 'faq', topicId: 'quote', vehicle: {} } }
export function normalizeCarExport(value) {
  if (value == null) return null // Older clients can still send the existing form.
  if (!articlePurposes.some(p => p.id === value?.purpose) || !exportTopics.some(t => t.id === value.topicId) || (value.vehicle != null && (typeof value.vehicle !== 'object' || Array.isArray(value.vehicle)))) throw new Error('글 종류와 차주 질문을 선택해 주세요.')
  const vehicle = {}
  for (const field of vehicleFields) {
    const text = value.vehicle?.[field.id]
    if (text != null && (typeof text !== 'string' || text.length > field.max)) throw new Error(`${field.label} 입력 내용을 확인해 주세요.`)
    if (value.purpose === 'case' && text?.trim()) vehicle[field.id] = text.trim()
  }
  return { purpose: value.purpose, topicId: effectiveTopicId(value), vehicle }
}
export function questionsForExport(plan = initialCarExport()) {
  const topic = exportTopics.find(t => t.id === effectiveTopicId(plan)) || exportTopics[0]
  const purpose = plan.purpose
  const questions = []
  if (topic.id === 'custom' && !['intro', 'comparison'].includes(purpose)) questions.push({ id: 'question', title: '차주가 실제로 궁금해하는 질문을 적어주세요.', hint: '이번 글에서 한 가지 궁금증을 해결한다고 생각해 주세요.', options: [] })
  questions.push({ id: 'answer', title: purpose === 'intro' ? '우리 업체가 직접 제공하는 서비스와 취급 범위는 무엇인가요?' : purpose === 'comparison' ? '매매·수출·폐차를 비교할 때 차주에게 어떤 기준을 설명하나요?' : topic.answer, hint: purpose === 'intro' ? '취급 차량·상담 범위·방문 가능 지역 등 실제 내용을 적으세요.' : purpose === 'comparison' ? '확인한 차이와 각각 유리하거나 어려운 조건만 적으세요.' : topic.hint, options: [] })
  questions.push({ id: 'conditions', title: purpose === 'intro' ? '서비스를 이용할 때 미리 알려줄 조건이나 비용은 무엇인가요?' : purpose === 'comparison' ? '비교할 때 함께 확인할 비용·조건·예외는 무엇인가요?' : topic.conditions, hint: '실제 조건만 적으세요. 모르면 건너뛰어도 됩니다.', options: [] })
  questions.push({ id: 'process', title: purpose === 'intro' || purpose === 'comparison' ? '차량 상담부터 진행 여부를 정하기까지 어떤 순서인가요?' : topic.process, hint: '실제 순서와 차주가 확인할 부분을 짧게 적으세요.', options: [] })
  if (purpose === 'case') questions.push({ id: 'case', title: '이 차를 어떻게 확인하고 처리했나요?', hint: '위에 적은 차량을 확인한 과정과 현재 결과를 적으세요. 거래 전이면 거래 전이라고 적고, 실제 사례가 없으면 건너뛰세요.', options: [] })
  questions.push({ id: 'contact', title: '견적 문의는 어디로 하고 어떤 자료를 보내면 되나요?', hint: '공개할 연락처·상담 링크와 차종·연식·주행거리·사진 등 필요한 자료를 적으세요. 실제로 요구하는 자료만 적으세요.', options: [] })
  questions.push({ id: 'source', title: '이 내용은 언제, 어떻게 확인했나요? (선택)', hint: '운영자 직접 안내·거래 기록·공개 자료 링크와 확인 날짜를 아는 만큼 적으세요. 공개 근거가 없어도 입력은 유지합니다.', options: [] })
  return questions
}
export function carEvidence(plan, interview) {
  if (!plan) return []
  const topic = exportTopics.find(t => t.id === plan.topicId)
  const facts = []
  if (!interview.some(a => a.id === 'question' && a.confirmed && a.text)) facts.push({ id: 'question', text: plan.purpose === 'intro' ? '이 중고차 수출 업체는 어떤 서비스를 어떻게 제공하나요?' : plan.purpose === 'comparison' ? '국내 매매·수출·폐차를 어떤 기준으로 비교하나요?' : topic.id === 'custom' ? '차주가 직접 입력한 궁금증에 답하기' : topic.label, origin: '사용자가 선택한 작성 주제' })
  for (const field of vehicleFields) if (plan.vehicle[field.id]) facts.push({ id: `vehicle_${field.id}`, text: plan.vehicle[field.id], origin: '사용자가 입력한 실제 차량 자료', question: field.label })
  return facts
}
export function carEvidenceLabel(id) { return vehicleFields.find(field => `vehicle_${field.id}` === id)?.label }
export function carWritingGuide(plan) {
  const purpose = articlePurposes.find(p => p.id === plan.purpose)
  const topic = exportTopics.find(t => t.id === plan.topicId)
  const structure = {
    faq: '차주 질문에 직접 답하기 → 이유와 확인 방법 → 조건·예외 → 상담 준비 자료',
    case: '차주의 실제 고민 → 제공된 차량 상태 → 실제 확인·처리 과정 → 확인된 결과 또는 진행 상태 → 상담 안내',
    comparison: '비교 질문에 답하기 → 제공된 기준으로 각 방법 비교 → 달라지는 조건 → 상담 준비 자료',
    intro: '업체명·지역·실제 서비스 → 취급 범위와 이용 조건 → 상담·거래 순서 → 공개 문의 방법',
  }[plan.purpose]
  return { purpose: purpose.label, topic: topic.label, structure }
}
export const carInstructions = '중고차 수출 전용 블로그다. carExport.purpose와 writingGuide.structure에 따라 글 종류를 구분한다. 차주의 질문에 먼저 답하고 업체 홍보는 실제 정보로만 덧붙인다. 차량 연식·주행거리·상태·실제 결과는 입력된 자료만 사용한다. case 글에서 자료가 부족하면 가상의 차주·판매 완료·가격·기간을 만들지 말고 최대 3개 확인 질문으로 보완한다. 전화 견적과 현장 가격 차이, 차량 인도 후 추가 감가, 연식에 따른 가치 하락을 혼동하지 않는다. 대금 지급·인수·서류 전달·탁송·말소 순서와 비용은 이 업체가 제공한 설명만 쓴다. 1~2일 말소, 선입금, 당일 지급, 전국 무료 탁송, 높은 매입가, 수출국 규격, 법적 필수 서류·불법 여부를 근거 없이 확정하지 않는다. 비교 글은 수출이 항상 유리하다고 쓰지 말고 제공된 비교 기준만 사용한다. 제목은 차주 질문 또는 실제 차량 사례를 정확히 나타내며 지역·업체명·키워드를 반복해서 채우지 않는다. 사진 설명은 사진에서 실제 확인한 내용 또는 사용자 설명만 사용하며 차량 성능을 추측하지 않는다. 개인정보·차량번호를 새로 만들지 않는다. 2000~2500자는 분량 기본값이고 SEO·GEO 합격 기준이 아니다. 검색·AI 추천·문의 성과를 보장하지 않는다. '
