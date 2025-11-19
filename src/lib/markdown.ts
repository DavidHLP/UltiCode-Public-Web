import MarkdownIt from 'markdown-it'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItKatex from 'markdown-it-katex'
import markdownItLinkAttributes from 'markdown-it-link-attributes'
import markdownItTaskLists from 'markdown-it-task-lists'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
})
  .use(markdownItKatex)
  .use(markdownItFootnote)
  .use(markdownItTaskLists)
  .use(markdownItLinkAttributes, {
    attrs: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  })

export function renderMarkdown(content: string): string {
  if (!content) return ''
  return md.render(content)
}

export function renderMarkdownInline(content: string): string {
  if (!content) return ''
  return md.renderInline(content)
}
