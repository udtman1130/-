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

export function headingText(text) {
 const value=text.trim()
 const markdown=value.match(/^#{1,4}\s+([^\n]+)$/)
 if(markdown)return markdown[1].trim()
 if(value.includes('\n')||value.length<3||value.length>45||/^[#\[\(]|[.!?。！？:]$/.test(value))return null
 return value
}
export function escapeHtml(value){
 return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}
export function draftHtml(title,blocks){
 const base='font-family:Arial,Malgun Gothic,sans-serif;'
 const content=blocks.map(block=>{
  if(block.type==='photo'){
   const value='[사진 '+photoNumber(block.photo.id)+' 넣는 곳 — '+(block.photo.description.trim()||'설명 없음')+']\n사진 파일: '+photoFilename(block.photo)
   return '<p style="'+base+'font-size:18px;line-height:1.8;margin:0 0 18px;">'+escapeHtml(value).replace(/\n/g,'<br>')+'</p>'
  }
  const heading=headingText(block.text)
  return heading
   ? '<h2 style="'+base+'font-size:22px;font-weight:700;line-height:1.5;margin:24px 0 12px;">'+escapeHtml(heading)+'</h2>'
   : '<p style="'+base+'font-size:18px;line-height:1.8;margin:0 0 18px;">'+escapeHtml(block.text).replace(/\n/g,'<br>')+'</p>'
 }).join('')
 return '<div><h1 style="'+base+'font-size:26px;font-weight:700;line-height:1.5;margin:0 0 24px;">'+escapeHtml(title)+'</h1>'+content+'</div>'
}
