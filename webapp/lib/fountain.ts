// Minimal Fountain screenplay parser + HTML renderer. Fountain is the plain-text
// screenplay standard (fountain.io). This is a pragmatic subset: scene headings,
// action, character cues, dialogue, parentheticals, transitions, centered text —
// enough to render the script in industry format and export to PDF/FDX.
//
// The legacy scenes are markdown-ish (lines wrapped in **bold**), so a whole-line
// **…** / *…* wrapper is stripped before classification and treated as emphasis.

export type FountainTokenType =
  | "scene_heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "centered";

export interface FountainToken {
  type: FountainTokenType;
  text: string;
}

const SCENE_RE = /^(INT|EXT|EST|I\/E|INT\.?\/EXT)[.\s]/i;
const TRANSITION_RE =
  /^(FADE IN:|FADE OUT\.?|FADE TO:|FADE TO BLACK\.?|CUT TO:|CUT TO BLACK\.?|SMASH CUT TO:|MATCH CUT TO:|DISSOLVE TO:|JUMP CUT TO:|INTERCUT:?)/i;

function stripWrap(s: string): string {
  // strip a whole-line **…** or *…* or __…__ wrapper (markdown emphasis)
  return s.replace(/^\*\*(.*)\*\*$/, "$1").replace(/^\*(.*)\*$/, "$1").replace(/^__(.*)__$/, "$1").trim();
}
function isUpper(s: string): boolean {
  return s === s.toUpperCase() && /[A-Z]/.test(s);
}

export function parseFountain(input: string): FountainToken[] {
  const text = (input ?? "").replace(/\r\n?/g, "\n");
  const blocks = text.split(/\n[ \t]*\n/);
  const out: FountainToken[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    if (!lines.length) continue;

    const rawFirst = lines[0].trim();
    const first = stripWrap(rawFirst);

    // Forced markers
    if (rawFirst.startsWith("!")) {
      out.push({ type: "action", text: lines.map((l) => l.replace(/^!/, "")).join("\n") });
      continue;
    }
    if (first.startsWith(".") && !first.startsWith("..")) {
      out.push({ type: "scene_heading", text: first.slice(1).trim().toUpperCase() });
      continue;
    }
    if (first.startsWith(">") && first.endsWith("<")) {
      out.push({ type: "centered", text: first.slice(1, -1).trim() });
      continue;
    }
    if (first.startsWith(">")) {
      out.push({ type: "transition", text: first.slice(1).trim().toUpperCase() });
      continue;
    }

    // Scene heading
    if (SCENE_RE.test(first)) {
      out.push({ type: "scene_heading", text: first.toUpperCase() });
      continue;
    }
    // Common transitions / single uppercase line ending in TO:
    if (lines.length === 1 && (TRANSITION_RE.test(first) || (isUpper(first) && /TO:$/.test(first)))) {
      out.push({ type: "transition", text: first.toUpperCase() });
      continue;
    }

    // Character cue + dialogue block
    const forcedChar = first.startsWith("@");
    const cue = forcedChar ? first.slice(1).trim() : first;
    const looksLikeCue =
      forcedChar || (isUpper(first) && /[A-Za-z]/.test(first) && !/TO:$/.test(first));
    if (looksLikeCue && lines.length >= 2) {
      out.push({ type: "character", text: cue.toUpperCase() });
      let dlg: string[] = [];
      const flush = () => {
        if (dlg.length) {
          out.push({ type: "dialogue", text: dlg.join("\n") });
          dlg = [];
        }
      };
      for (let k = 1; k < lines.length; k++) {
        const dl = stripWrap(lines[k].trim());
        if (dl === "") continue;
        if (dl.startsWith("(") && dl.endsWith(")")) {
          flush();
          out.push({ type: "parenthetical", text: dl });
        } else {
          dlg.push(dl);
        }
      }
      flush();
      continue;
    }

    // Default: action (preserve internal markdown for inline emphasis)
    out.push({ type: "action", text: lines.join("\n") });
  }

  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/_(.+?)_/g, "<u>$1</u>")
    .replace(/\n/g, "<br>");
}

const CLASS: Record<FountainTokenType, string> = {
  scene_heading: "sh",
  action: "action",
  character: "char",
  dialogue: "dlg",
  parenthetical: "paren",
  transition: "trans",
  centered: "center",
};

export function tokensToHtml(tokens: FountainToken[]): string {
  return tokens.map((t) => `<p class="${CLASS[t.type]}">${inline(t.text)}</p>`).join("\n");
}

// Screenplay layout, roughly US-letter Courier conventions. Scoped under
// `.screenplay` so it can be injected on-screen and into the print window.
export const SCREENPLAY_CSS = `
.screenplay { font-family: "Courier New", Courier, monospace; font-size: 12pt; line-height: 1.1; color: #111; background: #fff; max-width: 6.5in; margin: 0 auto; padding: 0.5in; }
.screenplay p { margin: 0 0 12px; white-space: pre-wrap; }
.screenplay .sh { font-weight: 700; text-transform: uppercase; margin-top: 18px; }
.screenplay .action { }
.screenplay .char { margin: 12px 0 0; padding-left: 2.2in; text-transform: uppercase; }
.screenplay .paren { padding-left: 1.6in; margin: 0; }
.screenplay .dlg { padding-left: 1in; padding-right: 1.5in; margin: 0 0 12px; }
.screenplay .trans { text-align: right; text-transform: uppercase; }
.screenplay .center { text-align: center; }
@media print { .screenplay { padding: 0; max-width: none; } @page { margin: 1in; } }
`;
