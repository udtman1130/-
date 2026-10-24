import { useState } from 'react'

const initialForm = {
  business: '',
  industry: '',
  region: '',
  offering: '',
  difference: '',
  platform: 'naver',
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessCode, setAccessCode] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleGenerate(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    setResult(null)
    setCopied(false)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessCode}` },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(70000),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || '서버 연결을 확인해 주세요.')
      if (!data?.title || !data?.body) throw new Error('생성 결과가 올바르지 않습니다.')
      setResult(data)
    } catch (error) {
      setError(['TimeoutError', 'AbortError'].includes(error.name) ? '시간이 초과됐습니다. 다시 시도해 주세요.' : error.message)
    } finally { setLoading(false) }
  }

  async function handleCopy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(`${result.title}\n\n${result.body}`)
      setCopied(true)
    } catch { setError('복사하지 못했습니다. 본문을 직접 선택해 복사해 주세요.') }
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
                <input name="industry" value={form.industry} onChange={updateField} placeholder="예: 동네 빵집" required />
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
                <span className="field-label">업체만의 차별점 <i>*</i></span>
                <textarea name="difference" value={form.difference} onChange={updateField} placeholder="예: 국내산 밀을 사용하고 매일 아침 직접 반죽해요" rows="3" required />
              </label>
            </div>

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

            <button className="generate-button" type="submit" disabled={loading}>
              <span>{loading ? 'AI가 글을 작성하고 있어요…' : 'AI로 블로그 글 생성하기'}</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
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
                <h3>{result.title}</h3>
                <div className="draft-divider" />
                <p className="draft-label">본문</p>
                <div className="draft-body">{result.body}</div>
              </div>
              <button className="copy-button" type="button" onClick={handleCopy}>
                <span className="copy-icon" aria-hidden="true">{copied ? '✓' : '▢'}</span>
                <span>{copied ? '복사 완료' : '제목과 본문 복사'}</span>
              </button>
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