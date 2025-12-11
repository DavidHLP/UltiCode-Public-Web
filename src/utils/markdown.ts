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

// Custom plugin to group consecutive fence tokens
const groupFencesPlugin = (md: MarkdownIt) => {
  md.core.ruler.push("group_fences", (state) => {
    const tokens = state.tokens;
    const newTokens: InstanceType<typeof state.Token>[] = [];
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];
      if (!token) {
        i++;
        continue;
      }

      // Check for fence token
      if (token.type === "fence") {
        const group = [token];
        let j = i + 1;

        // Look ahead for consecutive fences
        while (j < tokens.length) {
          const nextToken = tokens[j];
          if (nextToken && nextToken.type === "fence") {
            group.push(nextToken);
            j++;
          } else {
            break;
          }
        }

        // Create a new token for the group
        const groupToken = new state.Token("code_group", "div", 0);
        groupToken.block = true;
        groupToken.meta = { group }; // Store the original tokens
        newTokens.push(groupToken);

        i = j; // Skip the grouped tokens
      } else {
        newTokens.push(token);
        i++;
      }
    }
    state.tokens = newTokens;
  });

  // Renderer for the code_group token
  md.renderer.rules.code_group = (tokens, idx, options) => {
    const token = tokens[idx];
    if (!token) return "";

    const group = token.meta.group;

    if (!group || !group.length) return "";

    // Generate Header (Tabs)
    let tabsHtml = '<div class="lc-tabs-header">';
    group.forEach(
      (
        fence: InstanceType<typeof md.core.State.prototype.Token>,
        index: number,
      ) => {
        const info = fence.info ? md.utils.unescapeAll(fence.info).trim() : "";
        const langName = info.split(/\s+/)[0] || "Text";
        const activeClass = index === 0 ? "active" : "";

        tabsHtml += `
        <button class="lc-tab-btn ${activeClass}" data-index="${index}">
          ${langName}
        </button>
      `;
      },
    );
    tabsHtml += "</div>";

    // Generate Body (Panels)
    let bodyHtml = '<div class="lc-tabs-body">';
    group.forEach(
      (
        fence: InstanceType<typeof md.core.State.prototype.Token>,
        index: number,
      ) => {
        const info = fence.info ? md.utils.unescapeAll(fence.info).trim() : "";
        const langName = info.split(/\s+/)[0] || "";

        // Highlight code
        let highlightedCode = "";
        if (options.highlight) {
          highlightedCode =
            options.highlight(fence.content, langName, "") ||
            md.utils.escapeHtml(fence.content);
        } else {
          highlightedCode = md.utils.escapeHtml(fence.content);
        }

        const activeClass = index === 0 ? "active" : "";
        const encodedContent = encodeURIComponent(fence.content);

        // Note: We use a simplified structure here, relying on CSS for layout
        bodyHtml += `
        <div class="lc-code-panel ${activeClass}" data-index="${index}">
          <div class="lc-code-block group/code">
             <div class="lc-copy-wrapper">
                <button class="lc-copy-btn" data-code="${encodedContent}" aria-label="Copy code">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lc-copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
             </div>
             <pre><code class="hljs language-${langName}">${highlightedCode}</code></pre>
          </div>
        </div>
      `;
      },
    );
    bodyHtml += "</div>";

    return `<div class="lc-code-tabs">${tabsHtml}${bodyHtml}</div>`;
  };
};

// Use the plugin
md.use(groupFencesPlugin);

export function renderMarkdown(text: string): string {
  return md.render(text || "");
}
