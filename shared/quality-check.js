/*
 * SEO/GEO 사전 품질 검사 — 중고차 수출 블로그
 * 비용 없는 규칙 기반 경고. 실제 검색 순위, AI 인용 및 사실 진위는 확인하지 않음.
 */
export function inspectDraft({ result, form = {}, carExport = {}, photos = [] } = {}) {
  if (!result?.title || !result?.body) return { ready: false, seo: null, geo: null, blocking: false, checks: [], message: '먼저 글을 작성해 주세요.' };
  const title = String(result.title).trim();
  const body = String(result.body).trim();
  const text = title + '\n' + body;
  const sections = Array.isArray(result.sections) ? result.sections : [];
  const evidence = Array.isArray(result.coverage) ? result.coverage : [];
  const vehicle = carExport?.vehicle || {};
  const isCase = carExport?.purpose === 'case';
  const checks = [];
  const add = (group, id, label, ok, detail, action, weight = 1, critical = false) => {
    checks.push({ group, id, label, status: critical ? 'critical' : ok ? 'pass' : 'review', detail, action, weight });
  };
  const length = value => Array.from(String(value)).length;
  add('seo', 'title', '제목의 명확성',
    length(title) >= 12 && length(title) <= 75 && /(중고차|수출|매입|차량|폐차)/.test(title),
    '제목 ' + length(title) + '자. 길이는 내부 가독성 참고 기준입니다.',
    '차종, 실제 상태 또는 독자의 궁금증을 자연스럽게 담으세요.', 2);
  add('seo', 'sections', '소제목 구분',
    sections.length >= 3 && sections.every(s => String(s.heading || '').trim()),
    '소제목 ' + sections.length + '개.',
    '상태·판단 근거·처리 과정·결과 등을 실제 정보에 따라 구분하세요.', 2);
  const first = String(sections[0]?.text || body.slice(0, 350));
  add('seo', 'opening', '도입부의 직접적인 답변',
    /(가능|조건|확인|검토|판단|방법|어려|기준|경우|때문|따라)/.test(first),
    '도입부에 판단이나 답변을 나타내는 표현이 있는지 단순 점검합니다.',
    '첫 문단에서 차주의 질문에 실제 조건을 근거로 답하세요.', 2);
  const longParagraphs = (sections.length ? sections.flatMap(s => String(s.text || '').split(/\n+/)) : body.split(/\n+/)).filter(p => length(p) > 300);
  add('seo', 'readability', '모바일 문단 가독성', !longParagraphs.length,
    '300자 초과 문단 ' + longParagraphs.length + '개(내부 참고 기준).',
    '긴 문단은 읽기 쉬운 설명 단위로 나누세요.');
  add('seo', 'useful', '실용 정보',
    /(조건|확인|절차|방법|상태|서류|사진|견적|비용|기준)/.test(body),
    '차주가 확인할 조건이나 준비물에 관한 표현을 간단히 확인합니다.',
    '차주가 무엇을 확인하고 어떻게 준비할지 구체적으로 설명하세요.', 2);

  const business = String(form.business || '').trim();
  add('geo', 'business', '업체 정보 반영', !!business && text.includes(business),
    business && text.includes(business) ? '입력 업체명이 글에 있습니다.' : '입력한 업체명을 글에서 확인하지 못했습니다.',
    '실제 업체명을 자연스럽게 표시하되, 확인되지 않은 인증·경력은 만들지 마세요.', 2);
  const linked = evidence.filter(x => Array.isArray(x.sections) && x.sections.length).length;
  add('geo', 'evidence', '입력 자료 반영 확인', linked > 0,
    '입력 자료 연결 표시 ' + linked + '/' + evidence.length + '개. 연결 표시가 사실 검증은 아닙니다.',
    '차량 정보·답변과 생성된 문장을 사람의 눈으로 직접 대조하세요.', 2);
  if (isCase) {
    const filled = ['model', 'year', 'mileage', 'condition', 'concern', 'outcome'].filter(k => String(vehicle[k] || '').trim()).length;
    add('geo', 'vehicle', '실제 차량 사례의 구체성', filled >= 3,
      '실제 차량 입력 항목 ' + filled + '/6개.',
      '차종·연식·주행거리·상태·차주 고민·진행 결과 중 아는 사실만 반영하세요.', 3);
  } else {
    add('geo', 'detail', '답변의 조건과 판단 근거',
      /(이유|조건|방법|기준|확인|다만|하지만|예외|경우)/.test(body),
      '답뿐 아니라 이유·조건·예외가 있는지 간단히 확인합니다.',
      '실제 판단 기준을 설명하고 근거 없는 보장은 피하세요.', 3);
  }
  add('geo', 'answer', '독자 질문에 유용한 답변',
    /(왜|어떻게|언제|무엇|어떤|가능|기준|경우|조건|절차|확인)/.test(body),
    '질문·판단 기준과 관련된 표현이 있는지 확인합니다.',
    '한 가지 고객 질문에 답 → 근거 → 주의사항 순으로 설명하세요.', 2);
  const missingPhotoDescriptions = photos.filter(p => !String(p.description || '').trim()).length;
  add('geo', 'photo', isCase ? '사례 사진 및 설명' : '사진 설명 점검',
    photos.length ? missingPhotoDescriptions === 0 : !isCase,
    photos.length ? '사진 ' + photos.length + '장 중 설명 누락 ' + missingPhotoDescriptions + '장.' : '현재 입력한 사진이 없습니다.',
    '실제 사진으로 확인되는 상태만 설명하세요. 사진 자체는 AI가 분석한 것이 아닙니다.');

  const outcome = String(vehicle.outcome || '');
  const inProgress = /(진행\s*중|협의\s*중|검토\s*중|거래\s*전|미완료|아직.{0,20}(?:않|못|전))/.test(outcome);
  const completed = /(거래\s*(?:완료|성공|성사)|성공\s*사례|매입(?:이)?\s*(?:완료|성사|이루어졌)|수출\s*완료|계약\s*체결)/.test(text);
  const inText = /(진행\s*중|협의\s*중|검토\s*중)/.test(body);
  const conflict = (inProgress && completed) || (inText && completed);
  add('fact', 'outcome', '거래 상태 일치', !conflict,
    conflict ? '진행 중과 완료·성공 표현이 함께 발견되었습니다.' : '설정된 모순 표현은 발견되지 않았지만 실제 거래 상태는 확인되지 않았습니다.',
    '담당자에게 상태를 확인하고 완료 전에는 완료·성공으로 단정하지 마세요.', 4, conflict);
  const claims = ['무조건', '100%', '절대', '전국 무료', '최고가', '추가 감가 없음', '당일 입금', '당일 정산', '1일 말소', '100% 보장'].filter(x => text.includes(x));
  add('fact', 'claims', '과장·보장 표현', !claims.length,
    claims.length ? '확인이 필요한 표현: ' + claims.join(', ') : '설정된 주의 표현은 발견되지 않았습니다.',
    '가격·정산·말소·무료 서비스 조건은 실제 근거를 확인하세요.', 2);
  const questions = Array.isArray(result.reviewQuestions) ? result.reviewQuestions.length : 0;
  add('fact', 'questions', '추가 사실 확인 질문', !questions,
    '추가로 확인할 질문 ' + questions + '개. 0개라도 사실 확인 완료는 아닙니다.',
    '업체가 답할 수 있는 질문부터 확인하고 초안을 고치세요.', 1);
  add('conversion', 'contact', '상담 안내',
    /(문의|상담|연락|견적)/.test(body),
    '차주가 다음 행동을 알 수 있는지 간단히 점검합니다.',
    '실제 상담 경로와 필요한 차량 자료를 구체적으로 안내하세요.');
  const score = group => {
    const items = checks.filter(c => c.group === group);
    const total = items.reduce((n, c) => n + c.weight, 0);
    return total ? Math.round(100 * items.filter(c => c.status === 'pass').reduce((n, c) => n + c.weight, 0) / total) : null;
  };
  return {
    ready: true, seo: score('seo'), geo: score('geo'),
    blocking: checks.some(c => c.status === 'critical'),
    checks,
    counts: {
      pass: checks.filter(c => c.status === 'pass').length,
      review: checks.filter(c => c.status === 'review').length,
      critical: checks.filter(c => c.status === 'critical').length
    },
    message: 'SEO·GEO 수치는 앱 자체의 규칙 기반 점수이며 검색 순위·AI 인용률이 아닙니다. 게시 전 사람의 사실 확인이 필요합니다.'
  };
}
