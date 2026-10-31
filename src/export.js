import { draftText, photoNumber, photoFilename } from './photos.js'
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}
export function cleanText(text) { return text.replace(/^\s*#{1,6}\s+/gm, '').replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/^\s*[-*]\s*•\s*/gm, '• ') }
export function exportDraft(blocks, headings = []) {
  const html = blocks.map(block => {
    if (block.type === 'photo') return `<div style="margin:24px 0;"><p style="font-size:14px;line-height:1.8;padding:16px;border:1px dashed #aaa;">[사진 ${photoNumber(block.photo.id)} 넣는 곳]<br>사진 파일: ${escapeHtml(photoFilename(block.photo))}</p><p style="font-size:14px;line-height:1.7;text-align:center;color:#666;margin:8px 0 24px;">${escapeHtml(block.photo.description.trim() || '게시 전 사진 설명을 입력해 주세요.')}</p></div>`
    const lines = cleanText(block.text).split('\n')
    return lines.map(line => headings.includes(line) ? `<h2 style="font-size:22px;line-height:1.5;margin:34px 0 16px;padding:3px 0 3px 13px;border-left:4px solid #3e7650;font-weight:700;color:#172a1c;">${escapeHtml(line)}</h2>` : `<p style="font-size:18px;line-height:1.85;margin:0 0 18px;color:#303630;">${escapeHtml(line)}</p>`).join('')
  }).join('')
  return { text: cleanText(draftText(blocks)), html: `<div style="font-family:Arial,sans-serif;word-break:break-word;">${html}</div>` }
}
