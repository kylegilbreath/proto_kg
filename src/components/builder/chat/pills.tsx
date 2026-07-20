import * as React from "react"

// References to catalog objects are written inline as [Object name] and render
// as pill chips (both in sent messages and live in the chat input).
export const OBJ_ICON_SVG =
  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>'

// Split plain text into React nodes, turning [token] into a pill chip.
export function renderWithPills(text: string | undefined): React.ReactNode {
  if (!text) return text
  const out: React.ReactNode[] = []
  const re = /\[([^\][]+)\]/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <span
        key={"p" + i++}
        className="obj-pill"
        contentEditable={false}
        dangerouslySetInnerHTML={{
          __html: OBJ_ICON_SVG + "<span>" + m[1].replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>",
        }}
      />,
    )
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

// HTML string version for the contenteditable input.
export const escHTML = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function pillsToHTML(text: string) {
  return escHTML(text || "").replace(
    /\[([^\][]+)\]/g,
    (_mm, p1) =>
      '<span class="obj-pill" contenteditable="false" data-pill="' +
      escHTML(p1) +
      '">' +
      OBJ_ICON_SVG +
      "<span>" +
      escHTML(p1) +
      "</span></span>",
  )
}

// Walk a contenteditable node back to plain text (pills → [label], blocks → \n).
export function readEditable(node: Node): string {
  let s = ""
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) s += n.nodeValue
    else if (n.nodeType === 1) {
      const el = n as HTMLElement
      if (el.dataset && el.dataset.pill != null) s += "[" + el.dataset.pill + "]"
      else if (el.tagName === "BR") s += "\n"
      else {
        if (el.tagName === "DIV" && s && !s.endsWith("\n")) s += "\n"
        s += readEditable(el)
      }
    }
  })
  return s
}
