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

// Store the default fence renderer
const defaultFenceRender =
  md.renderer.rules.fence ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

// Override to add header
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  if (!token) return "";

  // Get language name
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : "";
  const langName = info.split(/\s+/)[0];

  // Render the original code block (which handles highlighting)
  const rawCode = defaultFenceRender(tokens, idx, options, env, self);

  // If no language specified, return as is (or wrapped without header if desired, but usually plain)
  if (!langName) return rawCode;

  // Wrap in LC style structure
  // We embed the raw content for copy button in a data attribute (encoded) or handle it via DOM traversal later.
  // Using encodeURIComponent to be safe in data attributes.
  const encodedContent = encodeURIComponent(token.content);

  return `
    <div class="lc-code-block group/code">
      <div class="lc-code-header">
        <span class="lc-lang">${langName}</span>
        <button class="lc-copy-btn" data-code="${encodedContent}" aria-label="Copy code">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lc-copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
      <div class="lc-code-body">
        ${rawCode}
      </div>
    </div>
  `;
};

export function renderMarkdown(text: string): string {
  return md.render(text || "");
}
