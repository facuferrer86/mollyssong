// Serialize Fountain tokens to Final Draft (.fdx) XML — the industry interchange
// format. Maps our token types to FDX Paragraph Types so the script opens with
// correct formatting in Final Draft, WriterDuet, Fade In, etc.
import type { FountainToken, FountainTokenType } from "@/lib/fountain";

const FDX_TYPE: Record<FountainTokenType, string> = {
  scene_heading: "Scene Heading",
  action: "Action",
  character: "Character",
  dialogue: "Dialogue",
  parenthetical: "Parenthetical",
  transition: "Transition",
  centered: "Action",
};

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function tokensToFdx(tokens: FountainToken[]): string {
  const paras = tokens
    .map((t) => {
      const align = t.type === "centered" ? ' Alignment="Center"' : "";
      // FDX keeps line breaks as separate <Text> runs joined by newlines inside
      // the paragraph; a single <Text> with literal newlines is widely accepted.
      return `    <Paragraph Type="${FDX_TYPE[t.type]}"${align}><Text>${xml(t.text)}</Text></Paragraph>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
${paras}
  </Content>
</FinalDraft>
`;
}
