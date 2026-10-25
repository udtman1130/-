export const photoNumber = id => String(id).padStart(2, '0')
export function photoFilename(photo) {
  const stem = (photo.description.trim() || '사진').normalize('NFC').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40)
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[photo.file.type]
  return `사진${photoNumber(photo.id)}_${stem}.${extension}`
}
export function buildPhotoDraft(body, photos) {
  const paragraphs = body.split(/\n\s*\n/).filter(p => p.trim())
  const blocks = []
  paragraphs.forEach((text, index) => {
    blocks.push({ type: 'text', text })
    photos.forEach((photo, position) => {
      const target = Math.floor(position * paragraphs.length / photos.length)
      if (index === target) blocks.push({ type: 'photo', photo })
    })
  })
  if (!paragraphs.length) photos.forEach(photo => blocks.push({ type: 'photo', photo }))
  return blocks
}
export function draftText(blocks) {
  return blocks.map(block => block.type === 'text' ? block.text : `[사진 ${photoNumber(block.photo.id)} 넣는 곳 — ${block.photo.description.trim() || '설명 없음'}]\n사진 파일: ${photoFilename(block.photo)}`).join('\n\n')
}
