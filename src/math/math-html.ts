import katex from 'katex';
import type { RichSegment } from '@/bank/rich-text';
import { KATEX_CSS } from './katex-css';

type Style = { color: string; fontSize: number; lineHeight: number };

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

export function mathHtml(segments: RichSegment[], { color, fontSize, lineHeight }: Style) {
  const body = segments
    .map((segment) =>
      segment.kind === 'text'
        ? escapeHtml(segment.text)
        : katex.renderToString(`\\displaystyle ${segment.latex}`, { throwOnError: false }),
    )
    .join('');

  return `<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
${KATEX_CSS}
html, body { margin: 0; padding: 0; background: transparent; }
body {
  color: ${color};
  font-family: -apple-system, system-ui, Roboto, 'Noto Sans Hebrew', sans-serif;
  font-size: ${fontSize}px;
  line-height: ${lineHeight}px;
  -webkit-text-size-adjust: none;
  overflow-wrap: break-word;
}
.katex { font-size: 1.12em; direction: ltr; unicode-bidi: isolate; }
.katex-display { margin: 0.4em 0; }
</style>
</head>
<body>
<div id="content">${body}</div>
<script>
  var content = document.getElementById('content');
  function report() {
    window.ReactNativeWebView.postMessage(String(Math.ceil(content.getBoundingClientRect().height)));
  }
  new ResizeObserver(report).observe(content);
  document.fonts.ready.then(report);
</script>
</body>
</html>`;
}
