import escapeHtml from "escape-html"
import { jsx } from "slate-hyperscript"
import { Node, Text } from "slate"
import slugify from "slugify"

export const serialize = node => {
  if (Text.isText(node)) {
    console.log(node.text, node)
    if (node.text.trim() === "") {
      return "&nbsp;"
    }
    var html = escapeHtml(node.text)
    html = node.strong ? `<strong>${html}</strong>` : html
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
    case "title":
      return `<h1>${children}</h1>`
    case "subtitle":
      return `<p class="subtitle">${children}</p>`
    // case "b":
    //   return `<strong>${children}</strong>`
    // case "i":
    //   return `<i>${children}</i>`
    case "link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

export const html_to_slate = html_str => {
  const el = new DOMParser().parseFromString(html_str, "text/html")
  const tree = deserialize(el.body)
  return tree
}

export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)
  console.log(" - children ", children)
  switch (el.nodeName.toUpperCase()) {
    case "BODY":
      return jsx("fragment", {}, children)
    case "BR":
      return "\n"
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children)
    case "P":
      return jsx(
        "element",
        { type: "paragraph" },
        children.length === 0 ? jsx("text", {}, "") : children // account for empty <p></p>
      )
    case "B":
      return jsx("text", { strong: true }, children)
    case "STRONG":
      return jsx("text", { strong: true }, children)
    case "I":
      return jsx("text", { italic: true }, children)

    case "H1":
      return jsx("element", { type: "title" }, children)
    case "A":
      return jsx(
        "element",
        { type: "link", url: el.getAttribute("href") },
        children
      )
    default:
      console.log("Default ", el)
      return el.textContent
  }
}

/**
 * Generate a complete string representing a markdown file
 * @param {frontmatter}
 * @param {html_body }
 */
export const to_markdown = ({ frontmatter, html_body }) => {
  const { title, slug, date } = frontmatter
  return `---\ntitle: ${title}\nslug: ${slug}\ndate: ${date}\n---\n${html_body}`
}

/**
 * Generate post slug from string (typically post's title)
 * @param  str
 * @param limit number of words (default = 12)
 */
export const gen_slug_from = (str, limit = 12) => {
  const tokens = str.split(" ", limit ? limit : 12)
  return slugify(tokens.join(" "), { lower: true, strict: true })
}
