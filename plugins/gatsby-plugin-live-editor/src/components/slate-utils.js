import escapeHtml from "escape-html"
import { jsx } from "slate-hyperscript"
import { Node, Text } from "slate"

export const serialize = node => {
  if (Text.isText(node)) {
    console.log(node.text, node)
    var html = escapeHtml(node.text)
    html = node.bold ? `<b>${html}</b>` : html
    html = node.italic ? `<i>${html}</i>` : html
    html = node.code ? `<code>${html}</code>` : html
    return html
  }

  const children = node.children.map(n => serialize(n)).join("")

  switch (node.type) {
    case "quote":
      return `<blockquote><p>${children}</p></blockquote>`
    case "paragraph":
      return `<p>${children}</p>`
    case "heading-one":
      return `<h1>${children}</h1>`
    case "link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

export const html_to_slate = html_str => {
  const el = new DOMParser().parseFromString(html_str, "text/html")
  const tree = deserialize(el.body)
  return [
    {
      type: "section",
      children: tree,
    },
  ]
}

export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)

  switch (el.nodeName.toUpperCase()) {
    case "BODY":
      return jsx("fragment", {}, children)
    case "BR":
      return "\n"
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children)
    case "P":
      return jsx("element", { type: "paragraph" }, children)
    case "A":
      return jsx(
        "element",
        { type: "link", url: el.getAttribute("href") },
        children
      )
    default:
      return el.textContent
  }
}

export const to_markdown = ({ title, date, html_body }) => {
  return `---\ntitle: ${title}\ndate: ${date}\n---\n${html_body}`
}
