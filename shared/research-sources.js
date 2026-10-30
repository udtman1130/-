export function sourcesForText(text, sections = [], research = []) {
  const ids = new Set(sections.filter(section => {
    const content = text.split('\n').filter(line => !section.heading || line.trim() !== section.heading.trim()).join('\n').trim()
    return content && section.text.trim() && (section.text.includes(content) || content.includes(section.text.trim()))
  }).flatMap(section => section.evidenceIds || []))
  return [...new Map(research.filter(item => ids.has(item.id)).flatMap(item => item.sources || []).map(source => [source.url, source])).values()]
}
