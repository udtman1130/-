import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildPhotoDraft, draftText, photoFilename } from '../src/photos.js'
const photo = (id, description = '차량 앞면') => ({ id, description, file: { type: 'image/jpeg' } })
test('reordering preserves photo identity and export filename', () => {
  const photos = [photo(3), photo(1)]
  const blocks = buildPhotoDraft('첫 문단\n\n둘째 문단', photos)
  assert.deepEqual(blocks.filter(b => b.type === 'photo').map(b => b.photo.id), [3, 1])
  assert.equal(photoFilename(photos[0]), '사진03_차량_앞면.jpg')
})
test('every selected photo appears exactly once even with fewer paragraphs', () => {
  const photos = [photo(1), photo(4), photo(9)]
  for (const body of ['', '짧은 글', '하나\n\n둘\n\n셋\n\n넷']) {
    const blocks = buildPhotoDraft(body, photos)
    assert.deepEqual(blocks.filter(b => b.type === 'photo').map(b => b.photo.id), [1, 4, 9])
    assert.equal(blocks.filter(b => b.type === 'text').map(b => b.text).join('\n\n'), body)
  }
})
test('export includes only active photo references and sanitizes filenames', () => {
  const text = draftText(buildPhotoDraft('본문', [photo(5, '../../앞면')]))
  assert.ok(text.includes('[사진 05 넣는 곳'))
  assert.ok(!text.includes('사진 01'))
  assert.ok(!photoFilename(photo(5, '../../앞면')).includes('/'))
})
