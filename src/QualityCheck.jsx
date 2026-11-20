import { useMemo, useState } from 'react'
import { inspectDraft } from '../shared/quality-check.js'
import './quality-check.css'

const names = { seo: 'SEO', geo: 'GEO', fact: '사실 확인', conversion: '고객 문의' }
const states = { pass: '양호', review: '확인 필요', critical: '우선 확인' }

/** 생성된 초안 아래 표시. 검사 자체는 추가 AI/API 비용 없이 브라우저에서 처리. */
export default function QualityCheck({ result, form, carExport, photos }) {
  const [expanded, setExpanded] = useState(false)
  const audit = useMemo(() => inspectDraft({ result, form, carExport, photos }), [result, form, carExport, photos])
  if (!audit.ready) return null
  return <section className="quality-audit" aria-labelledby="quality-audit-heading">
    <div className="quality-audit-head">
      <div>
        <p className="quality-audit-kicker">게시 전 자체 점검</p>
        <h3 id="quality-audit-heading">SEO · GEO 품질 검사</h3>
      </div>
      <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls="quality-audit-results">
        {expanded ? '검사 결과 접기' : '품질 검사하기'}
      </button>
    </div>
    {expanded && <div id="quality-audit-results" className="quality-audit-results">
      <div className="quality-audit-scores">
        <div><small>SEO 자체 점수</small><strong>{audit.seo}<span>/100</span></strong></div>
        <div><small>GEO 자체 점수</small><strong>{audit.geo}<span>/100</span></strong></div>
      </div>
      {audit.blocking && <p className="quality-audit-blocking" role="alert">거래 상태의 모순이 의심됩니다. 완료·성공 표현을 게시 전에 확인하세요.</p>}
      <p className="quality-audit-summary">양호 {audit.counts.pass} · 확인 필요 {audit.counts.review} · 우선 확인 {audit.counts.critical}</p>
      <div className="quality-audit-items">
        {audit.checks.filter(item => item.status !== 'pass').map(item => <article key={item.id}>
          <b>{names[item.group]} · {item.label} <em>{states[item.status]}</em></b>
          <p>{item.detail}</p>
          <p className="quality-audit-action">개선 방법: {item.action}</p>
        </article>)}
      </div>
      {audit.checks.every(item => item.status === 'pass') && <p>자동 점검 항목은 모두 통과했습니다. 실제 자료와의 대조는 별도로 필요합니다.</p>}
      <p className="quality-audit-disclaimer">{audit.message} 네이버·티스토리 붙여넣기 서식도 직접 확인해야 합니다.</p>
    </div>}
  </section>
}
