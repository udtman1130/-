import { sourcesForText } from '../shared/research-sources.js'
import { draftText, photoNumber, photoFilename } from './photos.js'
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}
export function cleanText(text) { return text.replace(/^\s*#{1,6}\s+/gm, '').replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/^\s*[-*]\s*•\s*/gm, '• ') }
export function exportDraft(blocks, headings = [], sources = [], sections = [], research = []) {
  const safeSource = source => {
    try { const u = new URL(source.url); return u.protocol === 'https:' && !u.username && !u.password } catch { return false }
  }
  const safeSources = sources.filter(safeSource)
  const links = items => items.filter(safeSource).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">[출처: ${escapeHtml(source.title)}]</a>`).join(' ')

  const html = blocks.map(block => {
    if (block.type === 'photo') return `<div style="margin:24px 0;"><p style="font-size:14px;line-height:1.8;padding:16px;border:1px dashed #aaa;">[사진 ${photoNumber(block.photo.id)} 넣는 곳]<br>사진 파일: ${escapeHtml(photoFilename(block.photo))}</p><p style="font-size:14px;line-height:1.7;text-align:center;color:#666;margin:8px 0 24px;">${escapeHtml(block.photo.description.trim() || '게시 전 사진 설명을 입력해 주세요.')}</p></div>`
    const lines = cleanText(block.text).split('\n')
    return lines.map(line => headings.includes(line) ? `<h2 style="font-size:22px;line-height:1.5;margin:28px 0 14px;font-weight:700;color:#222;">${escapeHtml(line)}</h2>` : `<p style="font-size:16px;line-height:1.9;margin:0 0 16px;color:#222;">${escapeHtml(line)}</p>`).join('') + links(sourcesForText(block.text, sections, research))
  }).join('')
  const referenceText = safeSources.length ? '\n\n참고 자료\n' + safeSources.map(source => `${source.title}: ${source.url}`).join('\n') : ''
  const referenceHtml = safeSources.length ? '<h2>참고 자료</h2><p>' + links(safeSources) + '</p>' : ''
  return { text: cleanText(draftText(blocks)) + referenceText, html: `<div style="font-family:Arial,sans-serif;word-break:break-word;">${html}${referenceHtml}</div>` }
}
