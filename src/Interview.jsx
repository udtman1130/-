import { useState } from 'react'
import { questionsFor, profileFor } from '../shared/interview.js'
export default function Interview({ industry, answers, onChange, disabled }) {
  const [step, setStep] = useState(0)
  const questions = questionsFor(industry)
  const question = questions[step]
  const current = answers[question.id] || { text: '', confirmed: false }
  function edit(text) { onChange({ ...answers, [question.id]: { text, confirmed: false } }) }
  return <section className="interview" aria-labelledby="interview-title">
    <h3 id="interview-title">업종별 질문으로 글의 재료 모으기</h3>
    <p>{profileFor(industry)?.name || '직접 입력한 업종'}에 맞춰 고객의 궁금증에 답할 정보를 모읍니다. 한 번에 한 질문 · 짧게 답해도 됩니다. 예시는 실제 업체 정보로 사용되지 않습니다.</p>
    <p className="interview-hint">가격·조건·위치·실제 경험·확인 시점을 모읍니다. 질문 작성만으로 AI 추천이나 인용이 보장되지는 않습니다.</p>
    <fieldset disabled={disabled}>
      <legend>질문 {step + 1} / {questions.length} — {question.title}</legend>
      <div className="answer-options">{question.options.map(option => <button type="button" key={option} onClick={() => edit(option)}>{option}</button>)}</div>
      <textarea aria-label={question.title} value={current.text} maxLength={2000} rows={3} onChange={event => edit(event.target.value)} placeholder={question.hint} />
      <p className="interview-hint">{question.hint}</p>
      <label><input type="checkbox" checked={current.confirmed} disabled={!current.text.trim()} onChange={event => onChange({ ...answers, [question.id]: { ...current, confirmed: event.target.checked } })} /> 이 답변을 글에 사용할 정보로 확인했어요</label>
      <div className="answer-options">
        <button type="button" onClick={() => { edit(''); setStep(Math.min(step + 1, questions.length - 1)) }}>모름·해당 없음 / 건너뛰기</button>
        <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>이전 질문</button>
        <button type="button" disabled={step === questions.length - 1} onClick={() => setStep(step + 1)}>다음 질문</button>
      </div>
    </fieldset>
    <p>확인한 답변만 AI로 전송합니다. 확인은 독립적인 사실 검증을 뜻하지 않습니다.</p>
    <details><summary>답변 모아보기</summary>{questions.map(q => <p key={q.id}><strong>{q.title}</strong><br />{answers[q.id]?.text || '건너뜀'} — {answers[q.id]?.confirmed ? '사용자 확인' : '미확인·생성 제외'}</p>)}</details>
  </section>
}
