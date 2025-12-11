import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import hljs from "highlight.js";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch {}
    }
    return ""; // use external default escaping
  },
});

md.use(markdownItKatex);

export function renderMarkdown(text: string): string {
  return md.render(text || "");
}
