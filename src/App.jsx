import { useState } from 'react'

const initialForm = {
  business: '',
  industry: '',
  region: '',
  offering: '',
  difference: '',
  platform: 'naver',
}

function makeDraft(form) {
  const platformName = form.platform === 'naver' ? '네이버 블로그' : '티스토리'
  const title = `${form.region} ${form.industry} 찾는다면? ${form.business}의 ${form.offering}`
  const body = `${form.business}는 ${form.region}에서 ${form.offering}을(를) 소개하는 ${form.industry} 업체입니다.\n\n${form.industry}를 알아볼 때는 내 상황에 맞는 서비스인지, 어떤 점을 꼼꼼히 살펴보는지가 중요합니다. ${form.business}는 ${form.difference}을(를) 바탕으로 한 분 한 분에게 필요한 선택지를 안내해 드리고 있습니다.\n\n## ${form.business}가 전하는 이야기\n\n처음 방문하시는 분도 편하게 상담하실 수 있도록 서비스 과정과 궁금한 점을 차근차근 설명해 드립니다. ${form.region}에서 ${form.offering}을(를) 찾고 계시다면 현재 필요한 내용부터 함께 확인해 보세요.\n\n## 이런 분께 소개합니다\n\n- ${form.region}에서 ${form.industry} 관련 정보를 찾고 계신 분\n- ${form.offering}의 진행 방식이 궁금하신 분\n- ${form.difference}을(를) 중요하게 생각하시는 분\n\n## 상담 안내\n\n서비스 내용과 일정은 상황에 따라 달라질 수 있습니다. 자세한 사항은 ${form.business}에 문의해 확인해 주세요.\n\n※ 이 글은 입력한 정보를 바탕으로 만든 데모 초안입니다. 게시 전 사실관계와 업체 정보를 확인하고 자연스럽게 다듬어 주세요.\n\n#${form.region.replaceAll(' ', '')} #${form.industry.replaceAll(' ', '')} #${form.offering.replaceAll(' ', '')} #${form.business.replaceAll(' ', '')}`

  return { title, body, platformName }
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleGenerate(event) {
    event.preventDefault()
    setResult(makeDraft(form))
    setCopied(false)
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(`${result.title}\n\n${result.body}`)
    setCopied(true)
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
          <span className="demo-label">DEMO</span>
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
        <p><strong>데모 버전</strong> 입력한 정보로 예시 문장을 조합합니다. AI 연결 및 외부 전송은 없으며, 검색 순위나 GEO 인용을 보장하지 않습니다.</p>
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

          <form onSubmit={handleGenerate}>
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

            <button className="generate-button" type="submit">
              <span>블로그 글 생성하기</span>
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
          <div className="result-bottom-note"><span className="bottom-line" />{result ? '데모 문장 · 게시 전 검토 필요' : '입력 정보는 이 화면에서만 사용됩니다'}</div>
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