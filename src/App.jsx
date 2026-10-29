import { useState, useRef, useEffect } from 'react'
import Interview from './Interview.jsx'
import { industryOptions, profileFor } from '../shared/interview.js'
import { exportDraft, cleanText } from './export.js'
import { photoNumber, photoFilename, buildPhotoDraft } from './photos'

const initialForm = {
  business: '',
  industry: '',
  region: '',
  offering: '',
  difference: '',
  platform: 'naver',
}

function App() {
  const [answers, setAnswers] = useState({})
  const [resetVersion, setResetVersion] = useState(0)
  const [industryChoice, setIndustryChoice] = useState('기타·직접 입력')
  const [form, setForm] = useState(initialForm)
  const [reviewAnswers, setReviewAnswers] = useState({})
  const [reviewHistory, setReviewHistory] = useState([])
  const [previousVersion, setPreviousVersion] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessCode, setAccessCode] = useState('')

  const [photos, setPhotos] = useState([])
  const [placed, setPlaced] = useState({})
  const nextPhotoId = useRef(1)
  const photoUrls = useRef(new Set())
  useEffect(() => () => photoUrls.current.forEach(url => URL.revokeObjectURL(url)), [])

  function resetInputs() {
    if (loading || !window.confirm('입력한 업체 정보, 질문 답변, 사진, 생성된 글을 모두 초기화할까요? 필요한 글은 먼저 복사해 주세요.')) return
    photoUrls.current.forEach(url => URL.revokeObjectURL(url))
    photoUrls.current.clear()
    nextPhotoId.current = 1
    setForm({ ...initialForm })
    setIndustryChoice('기타·직접 입력')
    setAnswers({})
    setPhotos([])
    setPlaced({})
    setResult(null)
    setCopied(false)
    setError('')
    setAccessCode('')
    setReviewAnswers({})
    setReviewHistory([])
    setPreviousVersion(null)
    setResetVersion(value => value + 1)
  }

  function addPhotos(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024)) {
      setError('JPG·PNG·WebP 사진만 넣어주세요. 사진 한 장은 10MB 이하여야 합니다.')
      return
    }
    if (photos.length + files.length > 10) { setError('사진은 최대 10장까지 넣을 수 있어요.'); return }
    const additions = files.map(file => {
      const url = URL.createObjectURL(file)
      photoUrls.current.add(url)
      return { id: nextPhotoId.current++, file, url, description: '' }
    })
    setPhotos(current => [...current, ...additions])
    setError('')
  }

  function movePhoto(index, direction) {
    setPhotos(current => {
      const copy = [...current]
      ;[copy[index], copy[index + direction]] = [copy[index + direction], copy[index]]
      return copy
    })
    setCopied(false)
  }

  function removePhoto(photo) {
    URL.revokeObjectURL(photo.url)
    photoUrls.current.delete(photo.url)
    setPhotos(current => current.filter(item => item.id !== photo.id))
    setCopied(false)
  }

  const blocks = result ? buildPhotoDraft(result.body, photos) : []

  function updateField(event) {
    const { name, value } = event.target
    if (name === 'industry' && profileFor(value)?.name !== profileFor(form.industry)?.name) setAnswers({})
    setForm((current) => ({ ...current, [name]: value }))
    setResult(null)
    setCopied(false)
  }

  async function handleGenerate(event, revise = false) {
    event.preventDefault()
    if (loading) return
    const additions = revise ? (result.reviewQuestions || []).map((question, i) => ({ question, answer: (reviewAnswers[i] || '').trim() })).filter(a => a.answer) : []
    const history = revise ? [...reviewHistory, ...additions] : []
    if (revise && !additions.length) return
    if (history.length > 20) { setError('추가 답변은 최대 20개까지 반영할 수 있습니다.'); return }
    const oldResult = result
    setLoading(true)
    setError('')
    if (!revise) setResult(null)
    setCopied(false)
    setPlaced({})
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessCode}` },
        body: JSON.stringify({ ...form, ...(revise ? { previousDraft: { title: result.title, body: result.body }, reviewAnswers: history } : {}), interview: Object.entries(answers).map(([id, answer]) => ({ id, ...answer })) }),
        signal: AbortSignal.timeout(70000),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || '서버 연결을 확인해 주세요.')
      if (!data?.title || !data?.body) throw new Error('생성 결과가 올바르지 않습니다.')
      setPreviousVersion(revise ? oldResult : null)
      setReviewHistory(history)
      setReviewAnswers({})
      setResult(data)
    } catch (error) {
      setError(['TimeoutError', 'AbortError'].includes(error.name) ? '시간이 초과됐습니다. 다시 시도해 주세요.' : error.message)
    } finally { setLoading(false) }
  }

  async function handleCopy(mode = 'text') {
    if (!result) return
    try {
      const output = exportDraft(blocks, (result.sections || []).map(section => section.heading))
      if (mode === 'title') await navigator.clipboard.writeText(cleanText(result.title))
      else if (mode === 'html') await navigator.clipboard.writeText(output.html)
      else if (mode === 'rich') {
        if (!window.ClipboardItem || !navigator.clipboard?.write) throw new Error('이 브라우저에서는 서식 복사를 지원하지 않습니다. 일반 본문 복사를 이용해 주세요.')
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([output.html], { type: 'text/html' }), 'text/plain': new Blob([output.text], { type: 'text/plain' }) })])
      } else await navigator.clipboard.writeText(output.text)
      setCopied(true)
    } catch (error) { setError(error.message || '복사하지 못했습니다. 본문을 직접 선택해 복사해 주세요.') }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="글결 홈">
          <span className="brand-mark" aria-hidden="true">ㄱ</span>
          <span>글결<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" />
          <span>콘텐츠 스튜디오</span>
          <span className="topbar-divider" />
          <span className="demo-label">AI</span>
        </div>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow"><span>01</span> BLOG CONTENT STUDIO</p>
          <h1>좋은 이야기는<br /><em>가게의 힘</em>이 됩니다.</h1>
          <p className="intro-description">업체의 고유한 이야기를 담아 블로그 글 초안을 만들어 보세요.<br className="desktop-break" /> 필요한 정보를 적으면 게시 전 다듬을 수 있는 예시 글을 준비합니다.</p>
        </div>
        <div className="intro-aside" aria-label="현재 단계">
          <span className="aside-index">YOUR STORY,</span>
          <span className="aside-title">한 편의 글로</span>
          <span className="aside-rule" />
          <span className="aside-foot">DRAFT No. 001</span>
        </div>
      </section>

      <div className="demo-notice" role="note">
        <span className="notice-icon" aria-hidden="true">i</span>
        <p><strong>AI 글 생성</strong> 입력한 업체 정보가 OpenAI로 전송됩니다. 실제 검색·사실 검증 기능은 없으며, 게시 전 검토가 필요합니다. 검색 순위나 AI 인용을 보장하지 않습니다.</p>
      </div>

      <div className="workspace">
        <section className="form-panel" aria-labelledby="form-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">STEP 01 <span>/</span> INFORMATION</p>
              <h2 id="form-title">업체 이야기 들려주기</h2>
            </div>
            <span className="required-note"><i>*</i> 필수 입력</span>
          </div>

          <form onSubmit={handleGenerate} aria-busy={loading}>
            {error && <p role="alert" className="error-message">{error}</p>}
            <label className="field">
              <span className="field-label">앱 이용 암호 <i>*</i></span>
              <input type="password" value={accessCode} onChange={event => setAccessCode(event.target.value)} placeholder="서버에 설정한 이용 암호" required autoComplete="off" />
            </label>
            <div className="field-grid">
              <label className="field">
                <span className="field-label">업체명 <i>*</i></span>
                <input name="business" value={form.business} onChange={updateField} placeholder="예: 다정한 베이커리" required />
              </label>
              <label className="field">
                <span className="field-label">업종 <i>*</i></span>
                <select aria-label="업종 선택" value={industryChoice} onChange={event => {
                  const value = event.target.value
                  setIndustryChoice(value)
                  setForm(current => ({ ...current, industry: value === '기타·직접 입력' ? '' : value }))
                  setAnswers({})
                  setResult(null)
                }}>{industryOptions.map(option => <option key={option}>{option}</option>)}</select>
                {industryChoice === '기타·직접 입력' && <input name="industry" value={form.industry} onChange={updateField} placeholder="실제 업종을 자유롭게 입력" required />}
              </label>
              <label className="field">
                <span className="field-label">영업 지역 <i>*</i></span>
                <input name="region" value={form.region} onChange={updateField} placeholder="예: 서울 성수동" required />
              </label>
              <label className="field">
                <span className="field-label">주요 상품 또는 서비스 <i>*</i></span>
                <input name="offering" value={form.offering} onChange={updateField} placeholder="예: 매일 굽는 사워도우" required />
              </label>
              <label className="field field-wide">
                <span className="field-label">추가 소개 문구 (선택·글에 반영)</span>
                <textarea name="difference" value={form.difference} onChange={updateField} placeholder="예: 국내산 밀을 사용하고 매일 아침 직접 반죽해요" rows="3" />
              </label>
            </div>

            <Interview key={`${resetVersion}-${profileFor(form.industry)?.name || 'other'}`} industry={form.industry} answers={answers} disabled={loading} onChange={value => { setAnswers(value); setResult(null); setCopied(false) }} />
            <p className="form-footnote">업종을 선택 목록에서 바꾸면 이전 업종의 답변을 지웁니다. 입력한 답변·업체 정보는 생성 시 OpenAI로 전송됩니다. 새로고침 전에 필요한 내용은 보관해 주세요.</p>
            <fieldset className="platform-field">
              <legend className="field-label">블로그 플랫폼 <i>*</i></legend>
              <div className="platform-options">
                <label className={`platform-option ${form.platform === 'naver' ? 'selected' : ''}`}>
                  <input type="radio" name="platform" value="naver" checked={form.platform === 'naver'} onChange={updateField} />
                  <span className="platform-symbol naver-symbol">N</span>
                  <span className="platform-name">네이버 블로그</span>
                  <span className="radio-indicator" />
                </label>
                <label className={`platform-option ${form.platform === 'tistory' ? 'selected' : ''}`}>
                  <input type="radio" name="platform" value="tistory" checked={form.platform === 'tistory'} onChange={updateField} />
                  <span className="platform-symbol tistory-symbol">T</span>
                  <span className="platform-name">티스토리</span>
                  <span className="radio-indicator" />
                </label>
              </div>
            </fieldset>

            <section className="photo-section" aria-labelledby="photos-heading">
              <h3 id="photos-heading">사진 번호와 삽입 위치</h3>
              <p>최대 10장 · JPG/PNG/WebP · 장당 10MB. 번호는 순서를 바꿔도 유지됩니다.</p>
              <p>사진은 이 브라우저에서만 미리 봅니다. 이번 버전은 AI 사진 분석 없이 문단 사이에 삽입 위치를 제안합니다. 새로고침하면 사진과 입력 내용이 사라집니다.</p>
              <label className="photo-upload">사진 선택
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} disabled={loading} />
              </label>
              <ol className="photo-list">
                {photos.map((photo, index) => <li key={photo.id} className="photo-card">
                  <img src={photo.url} alt={`사진 ${photoNumber(photo.id)} 미리보기`} />
                  <div className="photo-details">
                    <strong>사진 {photoNumber(photo.id)}</strong>
                    <label>사진 아래에 표시할 설명
                      <input value={photo.description} maxLength={120} placeholder="예: 작업 전 벽면 상태 — 균열 부위를 확인하는 사진" disabled={loading} onChange={event => { setPhotos(current => current.map(item => item.id === photo.id ? { ...item, description: event.target.value } : item)); setCopied(false) }} />
                    </label>
                    <small>{photoFilename(photo)}</small>
                    {(!photo.description.trim() || /^\d+$/.test(photo.description.trim())) && <p className="interview-hint">숫자 대신 무엇을 보여주는 사진인지 적어주세요. 예: 매장 입구, 작업 전 벽면. 이번 버전은 사진 내용을 AI가 분석하지 않습니다.</p>}
                    <div className="photo-actions">
                      <button type="button" disabled={loading || index === 0} onClick={() => movePhoto(index, -1)} aria-label={`사진 ${photoNumber(photo.id)} 앞으로`}>앞으로</button>
                      <button type="button" disabled={loading || index === photos.length - 1} onClick={() => movePhoto(index, 1)} aria-label={`사진 ${photoNumber(photo.id)} 뒤로`}>뒤로</button>
                      <a href={photo.url} download={photoFilename(photo)}>사진 저장</a>
                      <button type="button" disabled={loading} onClick={() => removePhoto(photo)}>삭제</button>
                    </div>
                  </div>
                </li>)}
              </ol>
            </section>

            <p className="form-footnote">기본 본문 목표: 2,000~2,500자. 사진 설명은 별도이며, 확인된 정보가 부족하면 보완 질문을 안내합니다.</p>
            <button className="generate-button" type="submit" disabled={loading}>
              <span>{loading ? 'AI가 글을 작성하고 있어요…' : 'AI로 블로그 글 생성하기'}</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
            <button className="reset-button" type="button" disabled={loading} onClick={resetInputs}>입력 내용 초기화</button>
            <p className="form-footnote"><span aria-hidden="true">✳</span> 생성된 글은 초안입니다. 게시 전 내용을 꼭 확인해 주세요.</p>
          </form>
        </section>

        <section className={`result-panel ${result ? 'has-result' : ''}`} aria-labelledby="result-title" aria-live="polite">
          <div className="result-header">
            <div>
              <p className="section-kicker">STEP 02 <span>/</span> YOUR DRAFT</p>
              <h2 id="result-title">완성된 초안</h2>
            </div>
            {result && <span className="result-platform">{result.platformName}</span>}
          </div>

          {result ? (
            <>
              <div className="draft-content">
                <p className="draft-label">제목</p>
                <h3>{cleanText(result.title)}</h3>
                <div className="draft-divider" />
                <p className="draft-label">본문 · {result.characterCount ?? Array.from(result.body).length}자 / 목표 2,000~2,500자</p>
                <p className="form-footnote">공백 포함, 제목·사진 설명 제외. 자료가 부족하면 사실을 만들지 않고 보완할 내용을 안내합니다.</p>
                <div className="draft-body">{blocks.map((block, index) => block.type === 'text'
                  ? <div key={index} className="draft-paragraph">{cleanText(block.text).split('\n').map((line, lineIndex) => (result.sections || []).some(section => cleanText(section.heading) === line)
                    ? <h3 key={lineIndex}>{line}</h3> : <p key={lineIndex}>{line}</p>)}</div>
                  : <div key={index} className="photo-placeholder">
                    <img src={block.photo.url} alt={block.photo.description || `사진 ${photoNumber(block.photo.id)}`} />
                    <div><strong>[사진 {photoNumber(block.photo.id)} 넣는 곳 — {block.photo.description.trim() || '설명 없음'}]</strong>
                    <p>{photoFilename(block.photo)}</p>
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', lineHeight: 1.7 }}>{block.photo.description.trim() || '사진 설명을 입력해 주세요.'}</p>
                    <label><input type="checkbox" checked={!!placed[block.photo.id]} onChange={event => setPlaced(current => ({ ...current, [block.photo.id]: event.target.checked }))} /> 블로그에 사진 삽입 완료</label></div>
                  </div>)}</div>
                {photos.length > 0 && <p className="photo-review" role="note">사진 삽입 확인: {photos.filter(photo => placed[photo.id]).length}/{photos.length}장. 체크는 작업 메모이며 실제 업로드 여부는 확인하지 않습니다. 게시 전 [사진 넣는 곳] 안내와 파일명 문구를 지우세요. 사진 설명은 공개할 문구인지 확인하세요.</p>}
              </div>
              <section className="review-panel">
                <h3>게시 전 내용 확인</h3>
                <p>입력한 정보는 외부 근거가 없어도 글에 반영합니다. AI의 추측과 누락을 점검하는 안내이며, 인터넷 조사나 독립적인 사실 검증 결과는 아닙니다.</p>
                <h4>확인할 질문에 답하기</h4>
                {(result.reviewQuestions || []).length === 0 && <p>현재 추가 확인 질문이 없습니다. 사실 검증 완료를 뜻하지는 않습니다.</p>}
                {(result.reviewQuestions || []).map((question, i) => <label className="field" key={i}><span>{i + 1}. {question}</span><textarea value={reviewAnswers[i] || ''} maxLength={2000} rows={3} disabled={loading} placeholder="아는 내용만 적으세요. 모르면 비워 두어도 됩니다." onChange={event => setReviewAnswers(current => ({ ...current, [i]: event.target.value }))} /></label>)}
                {(result.reviewQuestions || []).length > 0 && <><button className="reset-button" type="button" disabled={loading || !Object.values(reviewAnswers).some(value => value.trim())} onClick={event => handleGenerate(event, true)}>{loading ? '답변을 반영하고 있어요…' : '답변을 반영해 글 수정하기'}</button><p>수정할 때 AI를 다시 호출합니다. 성공하면 새 글로 바뀌며 실패하면 기존 글과 답변이 유지됩니다.</p></>}
                {previousVersion && <details><summary>수정 전 글 보기</summary><h4>{previousVersion.title}</h4><p style={{ whiteSpace: 'pre-wrap' }}>{previousVersion.body}</p></details>}
                {(result.changeSummary || []).length > 0 && <div><h4>이번에 바뀐 부분</h4><ul>{result.changeSummary.map((note, i) => <li key={i}>{note}</li>)}</ul></div>}
                <h4>점검 안내</h4>
                <ul>{(result.reviewNotes || []).map((note, i) => <li key={i}>{note}</li>)}</ul>
                <details><summary>입력한 답변이 반영된 위치</summary>{(result.coverage || []).map(item => <p key={item.id}><strong>{({ business: '업체명', industry: '업종', region: '지역', offering: '상품·서비스', difference: '추가 소개 문구', audience: '대상 고객', question: '핵심 질문', answer: '실제 답변', process: '진행 과정', conditions: '비용·조건', case: '실제 사례', contact: '상담 안내', source: '정보 출처·확인 시점' })[item.id] || item.id}</strong>: {item.text}<br />{item.sections.length ? `AI가 연결한 본문 섹션: ${item.sections.join(', ')}` : '반영 위치 없음 — 내용에 필요한 답변인지 검토하세요.'}</p>)}</details>
                <p>사진 안내·파일명 문구를 지우고 사진을 직접 첨부하세요. 가격·조건·사례는 게시 전 원자료와 대조해 주세요.</p>
              </section>
              <div className="export-actions">
                <button type="button" onClick={() => handleCopy('title')}>제목 복사</button>
                <button type="button" onClick={() => handleCopy('text')}>일반 본문 복사</button>
                {result.platformName === '네이버 블로그' ? <button type="button" onClick={() => handleCopy('rich')}>네이버 서식 포함 복사</button> : <button type="button" onClick={() => handleCopy('html')}>티스토리 HTML 복사</button>}
              </div>
              {copied && <p role="status">복사 완료 — 제목은 제목 칸에, 본문은 본문 칸에 붙여넣으세요.</p>}
              <p className="form-footnote">서식 복사는 실제 편집기·스킨에 따라 달라질 수 있습니다. 티스토리 HTML은 HTML 모드에 붙여넣으세요. 복사 내용에는 사진 삽입 안내가 포함되며 실제 이미지는 포함되지 않습니다.</p>
            </>
          ) : (
            <div className="empty-state">
              <div className="paper-illustration" aria-hidden="true">
                <div className="paper-sheet"><span /><span /><span /><b>✳</b></div>
              </div>
              <p className="empty-title">아직 초안이 없어요</p>
              <p className="empty-description">왼쪽에 업체 정보를 입력하고<br />첫 번째 글을 만들어 보세요.</p>
              <span className="empty-index">YOUR NEXT POST STARTS HERE</span>
            </div>
          )}
          <div className="result-bottom-note"><span className="bottom-line" />{result ? 'AI 생성 초안 · 게시 전 검토 필요' : '생성 시 업체 정보가 OpenAI로 전송됩니다'}</div>
        </section>
      </div>

      <footer className="footer">
        <span>글결 <span className="footer-separator">/</span> 블로그 콘텐츠 스튜디오</span>
        <span>초안은 게시 전 직접 확인해 주세요.</span>
      </footer>
    </main>
  )
}

export default App